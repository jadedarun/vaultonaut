import uuid
import time
from typing import Optional, Dict, Any, List
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
        7. Build context & prompt with Prompt Injection Defense.
        8. Generate response using Gemini via BaseLLMProvider interface.
        9. Persist Assistant response & citation metadata in DB.
        10. Return grounded response payload with source citations and latency metrics.
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
            grounded = assistant_content != NO_CONTEXT_REFUSAL
        except Exception as err:
            logger.error(f"Gemini API generation error: {err}")
            llm_latency_ms = round((time.time() - llm_start_time) * 1000, 2)
            assistant_content = "Relevant document content was retrieved, but Gemini could not generate the answer."
            model_name = settings.GEMINI_MODEL
            grounded = False

        total_latency_ms = round((time.time() - start_time) * 1000, 2)

        meta_payload = {
            "retrieved_count": len(citations),
            "citations": citations,
            "retrieval_latency_ms": retrieval_latency_ms,
            "llm_latency_ms": llm_latency_ms,
            "total_latency_ms": total_latency_ms,
            "grounded": grounded,
            "model_name": model_name
        }

        # 9. Persist Assistant Response in DB
        assistant_msg = conversation_service.add_message(
            db=db,
            conversation_id=conv.id,
            role="assistant",
            content=assistant_content,
            retrieval_metadata=meta_payload
        )

        # 10. Return Complete Response Object
        return {
            "conversation_id": conv.id,
            "conversation_title": conv.title,
            "user_message_id": user_msg.id,
            "message_id": assistant_msg.id,
            "role": "assistant",
            "content": assistant_content,
            "grounded": grounded,
            "retrieved_count": len(citations),
            "citations": citations,
            "model_name": model_name,
            "latency_ms": meta_payload
        }


rag_service = RAGService()
