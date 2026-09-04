import uuid
import time
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.core.logging import logger
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_service
from app.services.rag.context_builder import context_builder_service
from app.services.rag.prompt_builder import prompt_builder_service
from app.services.rag.citation_service import citation_service
from app.services.rag.providers.factory import LLMProviderFactory
from app.services.rag import conversation_service

NO_CONTEXT_REFUSAL = "I couldn't find enough information in your uploaded documents to answer this question."


class RAGService:
    def verify_grounding(self, answer: str, citations: List[Dict[str, Any]]) -> Tuple[str, float]:
        """
        Evaluates faithfulness and groundedness of the generated answer against retrieved context.
        Returns (grounding_status, grounding_score):
          - "REFUSED": When model correctly refused due to lack of evidence
          - "SUPPORTED": Claims are heavily grounded in retrieved chunks (>=60% overlap)
          - "PARTIALLY_SUPPORTED": Partial lexical grounding (35%-59%)
          - "UNSUPPORTED": Claims do not match retrieved chunks (<35%)
        """
        clean_ans = answer.strip().lower()
        if (
            NO_CONTEXT_REFUSAL.lower() in clean_ans
            or "couldn't find enough information" in clean_ans
            or "not enough information" in clean_ans
        ):
            return "REFUSED", 1.0

        if not citations:
            return "UNSUPPORTED", 0.0

        context_text = " ".join([c.get("chunk_text", "") for c in citations]).lower()
        import re
        answer_words = set(re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', clean_ans))
        stop_words = {
            "the", "and", "that", "have", "for", "not", "with", "you", "this", "but", "his",
            "from", "they", "say", "her", "she", "will", "one", "all", "would", "there",
            "their", "what", "out", "about", "who", "get", "which", "when", "make", "can",
            "like", "time", "just", "him", "know", "take", "people", "into", "year", "your",
            "good", "some", "could", "them", "see", "other", "than", "then", "now", "look",
            "only", "come", "its", "over", "think", "also", "back", "after", "use", "two"
        }
        content_words = [w for w in answer_words if w not in stop_words]
        if not content_words:
            return "SUPPORTED", 1.0

        matched = sum(1 for w in content_words if w in context_text)
        overlap_ratio = matched / len(content_words)

        if overlap_ratio >= 0.60:
            return "SUPPORTED", round(overlap_ratio, 2)
        elif overlap_ratio >= 0.35:
            return "PARTIALLY_SUPPORTED", round(overlap_ratio, 2)
        else:
            return "UNSUPPORTED", round(overlap_ratio, 2)

    def execute_rag_query(
        self,
        user_id: str,
        query: str,
        top_k: Optional[int] = None,
        similarity_threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Lightweight evaluation executor: runs vector retrieval + Gemini generation
        without requiring conversation history persistence.
        """
        start_time = time.time()
        effective_top_k = top_k or settings.RAG_TOP_K
        effective_threshold = similarity_threshold if similarity_threshold is not None else settings.RAG_SIMILARITY_THRESHOLD

        # 1. Generate query embedding
        query_vector = embedding_service.generate_query_embedding(query)

        # 2. Semantic Search in ChromaDB
        raw_chunks = vector_store_service.similarity_query(
            user_id=str(user_id),
            query_embedding=query_vector,
            top_k=effective_top_k,
            score_threshold=effective_threshold
        )
        retrieval_latency_ms = round((time.time() - start_time) * 1000, 2)

        if not raw_chunks:
            return {
                "content": NO_CONTEXT_REFUSAL,
                "grounded": False,
                "grounding_status": "REFUSED",
                "grounding_score": 1.0,
                "retrieved_count": 0,
                "citations": [],
                "raw_chunks": [],
                "model_name": settings.GEMINI_MODEL,
                "retrieval_latency_ms": retrieval_latency_ms,
                "llm_latency_ms": 0.0,
                "total_latency_ms": retrieval_latency_ms
            }

        # 3. Context & Citations
        context_str, raw_citations = context_builder_service.format_context(raw_chunks)
        citations = citation_service.format_citations(raw_citations)

        # 4. Prompt & Generation
        system_prompt = prompt_builder_service.build_system_prompt()
        rag_prompt = prompt_builder_service.build_rag_prompt(
            user_question=query,
            context_str=context_str
        )

        llm_start_time = time.time()
        try:
            provider = LLMProviderFactory.get_provider("gemini")
            llm_output = provider.generate_response(
                prompt=rag_prompt,
                system_prompt=system_prompt,
                temperature=settings.RAG_TEMPERATURE
            )
            llm_latency_ms = round((time.time() - llm_start_time) * 1000, 2)
            assistant_content = llm_output.get("content", "").strip() or NO_CONTEXT_REFUSAL
            model_name = llm_output.get("model", settings.GEMINI_MODEL)
        except Exception as err:
            logger.error(f"Gemini generation error: {err}")
            llm_latency_ms = round((time.time() - llm_start_time) * 1000, 2)
            assistant_content = "Relevant document content was retrieved, but generation encountered an error."
            model_name = settings.GEMINI_MODEL

        total_latency_ms = round((time.time() - start_time) * 1000, 2)
        grounding_status, grounding_score = self.verify_grounding(assistant_content, citations)
        grounded = grounding_status in ["SUPPORTED", "PARTIALLY_SUPPORTED"]

        return {
            "content": assistant_content,
            "grounded": grounded,
            "grounding_status": grounding_status,
            "grounding_score": grounding_score,
            "retrieved_count": len(citations),
            "citations": citations,
            "raw_chunks": raw_chunks,
            "model_name": model_name,
            "retrieval_latency_ms": retrieval_latency_ms,
            "llm_latency_ms": llm_latency_ms,
            "total_latency_ms": total_latency_ms
        }

    def answer_question(
        self,
        db: Session,
        user_id: uuid.UUID,
        query: str,
        conversation_id: Optional[uuid.UUID] = None,
        top_k: Optional[int] = None,
        similarity_threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end grounded Retrieval-Augmented Generation (RAG) pipeline:
        1. Validate/Create Conversation Thread.
        2. Record User prompt in DB.
        3. Generate Query Vector Embedding via EmbeddingService.
        4. Query ChromaDB scoped strictly to user_id.
        5. Apply similarity threshold filter (default 0.45).
        6. Grounding check: If no relevant chunks meet threshold, return refusal message.
        7. Build context & prompt with Prompt Injection Defense and page-aware citations.
        8. Generate response using Gemini via BaseLLMProvider interface.
        9. Verify Grounding status (SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED, REFUSED).
        10. Persist Assistant response & citation metadata in DB and return response payload.
        """
        start_time = time.time()
        effective_top_k = top_k or settings.RAG_TOP_K
        effective_threshold = similarity_threshold if similarity_threshold is not None else settings.RAG_SIMILARITY_THRESHOLD

        # 1. Resolve Conversation Session
        if conversation_id:
            conv = conversation_service.get_conversation_by_id(db, conversation_id, user_id)
        else:
            conv = conversation_service.create_conversation(db, user_id, title=query[:30])

        # 2. Record User Message
        user_msg = conversation_service.add_message(
            db=db,
            conversation_id=conv.id,
            role="user",
            content=query
        )

        # 3. Generate Query Vector Embedding
        query_vector = embedding_service.generate_query_embedding(query)

        # 4. Semantic Search in ChromaDB
        raw_chunks = vector_store_service.similarity_query(
            user_id=str(user_id),
            query_embedding=query_vector,
            top_k=effective_top_k,
            score_threshold=effective_threshold
        )

        # 5. Grounding Check: Insufficient Context Refusal
        if not raw_chunks:
            retrieval_latency = round((time.time() - start_time) * 1000, 2)
            refusal_metadata = {
                "retrieved_count": 0,
                "citations": [],
                "retrieval_latency_ms": retrieval_latency,
                "llm_latency_ms": 0,
                "total_latency_ms": retrieval_latency,
                "grounded": False,
                "grounding_status": "REFUSED",
                "grounding_score": 1.0,
                "model_name": settings.GEMINI_MODEL
            }

            assistant_msg = conversation_service.add_message(
                db=db,
                conversation_id=conv.id,
                role="assistant",
                content=NO_CONTEXT_REFUSAL,
                retrieval_metadata=refusal_metadata
            )

            return {
                "conversation_id": conv.id,
                "conversation_title": conv.title,
                "user_message_id": user_msg.id,
                "message_id": assistant_msg.id,
                "role": "assistant",
                "content": NO_CONTEXT_REFUSAL,
                "grounded": False,
                "grounding_status": "REFUSED",
                "grounding_score": 1.0,
                "retrieved_count": 0,
                "citations": [],
                "model_name": settings.GEMINI_MODEL,
                "latency_ms": refusal_metadata
            }

        # 6. Build Context & Format Citations
        context_str, raw_citations = context_builder_service.format_context(raw_chunks)
        citations = citation_service.format_citations(raw_citations)

        # Fetch recent conversation history
        history_messages = [
            {"role": m.role, "content": m.content}
            for m in conv.messages if m.id != user_msg.id
        ]

        # 7. Construct Prompt & Invocation
        system_prompt = prompt_builder_service.build_system_prompt()
        rag_prompt = prompt_builder_service.build_rag_prompt(
            user_question=query,
            context_str=context_str,
            history=history_messages
        )

        retrieval_latency_ms = round((time.time() - start_time) * 1000, 2)
        llm_start_time = time.time()

        # 8. Call Gemini via LLM Provider Interface
        try:
            provider = LLMProviderFactory.get_provider("gemini")
            llm_output = provider.generate_response(
                prompt=rag_prompt,
                system_prompt=system_prompt,
                temperature=settings.RAG_TEMPERATURE
            )
            llm_latency_ms = round((time.time() - llm_start_time) * 1000, 2)
            assistant_content = llm_output.get("content", "").strip() or NO_CONTEXT_REFUSAL
            model_name = llm_output.get("model", settings.GEMINI_MODEL)
        except Exception as err:
            logger.error(f"Gemini API generation error: {err}")
            llm_latency_ms = round((time.time() - llm_start_time) * 1000, 2)
            assistant_content = "Relevant document content was retrieved, but Gemini could not generate the answer."
            model_name = settings.GEMINI_MODEL

        total_latency_ms = round((time.time() - start_time) * 1000, 2)

        # 9. Verify Grounding
        grounding_status, grounding_score = self.verify_grounding(assistant_content, citations)
        grounded = grounding_status in ["SUPPORTED", "PARTIALLY_SUPPORTED"]

        meta_payload = {
            "retrieved_count": len(citations),
            "citations": citations,
            "retrieval_latency_ms": retrieval_latency_ms,
            "llm_latency_ms": llm_latency_ms,
            "total_latency_ms": total_latency_ms,
            "grounded": grounded,
            "grounding_status": grounding_status,
            "grounding_score": grounding_score,
            "model_name": model_name
        }

        # 10. Persist Assistant Response in DB
        assistant_msg = conversation_service.add_message(
            db=db,
            conversation_id=conv.id,
            role="assistant",
            content=assistant_content,
            retrieval_metadata=meta_payload
        )

        # 11. Return Complete Response Object
        return {
            "conversation_id": conv.id,
            "conversation_title": conv.title,
            "user_message_id": user_msg.id,
            "message_id": assistant_msg.id,
            "role": "assistant",
            "content": assistant_content,
            "grounded": grounded,
            "grounding_status": grounding_status,
            "grounding_score": grounding_score,
            "retrieved_count": len(citations),
            "citations": citations,
            "model_name": model_name,
            "latency_ms": meta_payload
        }


rag_service = RAGService()

