import time
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.evaluation import EvaluationDataset, EvaluationItem, EvaluationRun, Experiment
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.services.eval.dataset_service import dataset_service, BENCHMARK_DOCUMENT_TITLE, BENCHMARK_DOCUMENT_CONTENT
from app.services.eval.metrics import evaluate_single_sample
from app.services.eval.failure_analyzer import failure_analyzer
from app.services.rag.rag_service import rag_service
from app.services.chunking_service import (
    default_chunking_service,
    STRATEGY_FIXED_NO_OVERLAP,
    STRATEGY_FIXED_OVERLAP,
    STRATEGY_SEMANTIC_PARAGRAPH
)
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_service
from app.services import vector_sync_service
from app.core.logging import logger


class ExperimentRunner:
    @staticmethod
    def ensure_benchmark_corpus_indexed(db: Session, user_id: uuid.UUID, strategy: str = "fixed_overlap") -> None:
        """
        Guarantees that the benchmark reference text is ingested and indexed in ChromaDB for user_id.
        If the user already has chunks in ChromaDB, ensures benchmark doc exists or is added.
        """
        # Check if benchmark document already exists for user
        existing_doc = db.query(Document).filter(
            Document.user_id == user_id,
            Document.original_filename == BENCHMARK_DOCUMENT_TITLE
        ).first()

        if existing_doc:
            # Check if it has chunks in PostgreSQL
            chunk_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == existing_doc.id).count()
            if chunk_count > 0:
                return

        # Create benchmark document record
        doc_id = uuid.uuid4()
        new_doc = Document(
            id=doc_id,
            user_id=user_id,
            knowledge_id=None,
            original_filename=BENCHMARK_DOCUMENT_TITLE,
            stored_filename=f"benchmark_{doc_id.hex}.md",
            file_extension=".md",
            mime_type="text/markdown",
            file_size=len(BENCHMARK_DOCUMENT_CONTENT.encode("utf-8")),
            storage_path=f"benchmark/{doc_id.hex}.md",
            status="completed",
            processing_stage="completed",
            checksum_sha256=f"bench_{doc_id.hex[:16]}"
        )
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        # Index into ChromaDB using the selected strategy
        vector_sync_service.process_ai_indexing(
            db=db,
            document=new_doc,
            text_content=BENCHMARK_DOCUMENT_CONTENT,
            strategy=strategy
        )
        logger.info(f"Indexed benchmark corpus for user {user_id} using strategy '{strategy}'.")

    @staticmethod
    def run_benchmark_evaluation(
        db: Session,
        user_id: uuid.UUID,
        top_k: int = 5,
        similarity_threshold: float = 0.45,
        chunking_strategy: str = "fixed_overlap",
        embedding_model: str = "all-MiniLM-L6-v2",
        run_name: Optional[str] = None,
        sample_limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes an end-to-end evaluation run across the benchmark dataset:
        1. Ensures benchmark corpus is indexed.
        2. Retrieves benchmark questions.
        3. Queries RAG pipeline for each question.
        4. Computes IR and RAG metrics (Recall, Precision, Hit Rate, MRR, Correctness, Groundedness, Hallucination, Refusal).
        5. Computes diagnostic failure modes.
        6. Persists EvaluationRun to PostgreSQL.
        7. Returns complete performance payload.
        """
        start_time = time.time()
        dataset = dataset_service.get_or_create_benchmark_dataset(db, user_id)
        ExperimentRunner.ensure_benchmark_corpus_indexed(db, user_id, strategy=chunking_strategy)

        query_items = db.query(EvaluationItem).filter(EvaluationItem.dataset_id == dataset.id).all()
        if sample_limit and sample_limit > 0:
            query_items = query_items[:sample_limit]

        detailed_results = []
        total_retrieval_latency = 0.0
        total_llm_latency = 0.0

        for idx, item in enumerate(query_items, 1):
            # Execute RAG query (retrieval + generation)
            rag_output = rag_service.execute_rag_query(
                user_id=str(user_id),
                query=item.question,
                top_k=top_k,
                similarity_threshold=similarity_threshold
            )

            total_retrieval_latency += rag_output.get("retrieval_latency_ms", 0.0)
            total_llm_latency += rag_output.get("llm_latency_ms", 0.0)

            # Evaluate sample
            sample_eval = evaluate_single_sample(
                question=item.question,
                ground_truth_answer=item.ground_truth_answer,
                relevant_keywords=item.relevant_chunk_keywords,
                retrieved_chunks=rag_output.get("citations", []),
                generated_answer=rag_output.get("content", ""),
                is_unanswerable=item.is_unanswerable,
                top_k=top_k,
                category=item.category
            )

            sample_eval["retrieval_latency_ms"] = rag_output.get("retrieval_latency_ms", 0.0)
            sample_eval["llm_latency_ms"] = rag_output.get("llm_latency_ms", 0.0)
            sample_eval["total_latency_ms"] = rag_output.get("total_latency_ms", 0.0)
            sample_eval["grounding_status"] = rag_output.get("grounding_status", "UNKNOWN")

            detailed_results.append(sample_eval)
            time.sleep(1.5)

        n = len(detailed_results) if detailed_results else 1

        # Compute macro-averaged metrics
        avg_recall = round(sum(d["recall_at_k"] for d in detailed_results) / n, 4)
        avg_precision = round(sum(d["precision_at_k"] for d in detailed_results) / n, 4)
        avg_hit_rate = round(sum(d["hit_rate"] for d in detailed_results) / n, 4)
        avg_mrr = round(sum(d["mrr"] for d in detailed_results) / n, 4)
        avg_correctness = round(sum(d["answer_correctness"] for d in detailed_results) / n, 4)
        avg_groundedness = round(sum(d["groundedness_score"] for d in detailed_results) / n, 4)
        avg_hallucination = round(sum(d["hallucination_rate"] for d in detailed_results) / n, 4)
        avg_refusal_acc = round(sum(d["refusal_accuracy"] for d in detailed_results) / n, 4)

        avg_latency_ms = round((total_retrieval_latency + total_llm_latency) / n, 2)
        total_time_s = round(time.time() - start_time, 2)

        # Run failure analysis
        diagnostics = failure_analyzer.analyze_run_results(detailed_results)

        # Persist EvaluationRun
        run_obj = EvaluationRun(
            id=uuid.uuid4(),
            dataset_id=dataset.id,
            user_id=user_id,
            run_name=run_name or f"Run - k={top_k}, th={similarity_threshold} ({chunking_strategy})",
            top_k=top_k,
            similarity_threshold=similarity_threshold,
            chunking_strategy=chunking_strategy,
            embedding_model=embedding_model,
            recall_at_k=avg_recall,
            precision_at_k=avg_precision,
            hit_rate=avg_hit_rate,
            mrr=avg_mrr,
            answer_correctness=avg_correctness,
            groundedness_score=avg_groundedness,
            hallucination_rate=avg_hallucination,
            refusal_accuracy=avg_refusal_acc,
            avg_latency_ms=avg_latency_ms,
            total_samples=len(detailed_results),
            detailed_results=detailed_results
        )
        db.add(run_obj)
        db.commit()
        db.refresh(run_obj)

        return {
            "run_id": str(run_obj.id),
            "run_name": run_obj.run_name,
            "created_at": run_obj.created_at.isoformat() if run_obj.created_at else "",
            "parameters": {
                "top_k": top_k,
                "similarity_threshold": similarity_threshold,
                "chunking_strategy": chunking_strategy,
                "embedding_model": embedding_model,
                "total_samples": len(detailed_results)
            },
            "metrics": {
                "recall_at_k": avg_recall,
                "precision_at_k": avg_precision,
                "hit_rate": avg_hit_rate,
                "mrr": avg_mrr,
                "answer_correctness": avg_correctness,
                "groundedness_score": avg_groundedness,
                "hallucination_rate": avg_hallucination,
                "refusal_accuracy": avg_refusal_acc
            },
            "latency": {
                "avg_retrieval_ms": round(total_retrieval_latency / n, 2),
                "avg_llm_ms": round(total_llm_latency / n, 2),
                "avg_total_ms": avg_latency_ms,
                "benchmark_duration_s": total_time_s
            },
            "failure_diagnostics": diagnostics,
            "detailed_results": detailed_results
        }

    @staticmethod
    def run_chunking_experiment(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Executes comparative evaluation across all 3 chunking strategies:
          - Strategy A: Fixed-size, no overlap (500 chars)
          - Strategy B: Fixed-size + Overlap (800 chars, 150 overlap)
          - Strategy C: Semantic / Paragraph-aware (~700 chars)
        """
        strategies = [
            (STRATEGY_FIXED_NO_OVERLAP, "Fixed (500 chars, 0 overlap)"),
            (STRATEGY_FIXED_OVERLAP, "Fixed + Overlap (800 / 150 chars)"),
            (STRATEGY_SEMANTIC_PARAGRAPH, "Semantic / Paragraph-aware")
        ]

        comparison_matrix = []
        for strat_key, strat_label in strategies:
            # Rebuild vectors for benchmark doc using current strategy
            ExperimentRunner.ensure_benchmark_corpus_indexed(db, user_id, strategy=strat_key)
            
            run_result = ExperimentRunner.run_benchmark_evaluation(
                db=db,
                user_id=user_id,
                top_k=5,
                similarity_threshold=0.40,
                chunking_strategy=strat_key,
                run_name=f"Chunking Experiment: {strat_label}",
                sample_limit=15  # Efficient representative subset for comparison speed
            )

            metrics = run_result["metrics"]
            comparison_matrix.append({
                "strategy": strat_key,
                "label": strat_label,
                "recall_at_k": metrics["recall_at_k"],
                "precision_at_k": metrics["precision_at_k"],
                "hit_rate": metrics["hit_rate"],
                "mrr": metrics["mrr"],
                "answer_correctness": metrics["answer_correctness"],
                "groundedness": metrics["groundedness_score"],
                "hallucination_rate": metrics["hallucination_rate"],
                "avg_latency_ms": run_result["latency"]["avg_total_ms"]
            })

        # Save experiment record in DB
        exp = Experiment(
            id=uuid.uuid4(),
            user_id=user_id,
            experiment_name="Multi-Strategy Chunking Evaluation",
            experiment_type="chunking_comparison",
            status="completed",
            config_json={"strategies": [s[0] for s in strategies], "top_k": 5, "threshold": 0.40},
            results_summary={"matrix": comparison_matrix}
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)

        return {
            "experiment_id": str(exp.id),
            "experiment_name": exp.experiment_name,
            "comparison_matrix": comparison_matrix
        }

    @staticmethod
    def run_threshold_sweep(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Evaluates RAG performance across candidate similarity thresholds: [0.30, 0.45, 0.60, 0.75].
        Maps the Precision vs. Recall tradeoff curve.
        """
        thresholds = [0.30, 0.45, 0.60, 0.75]
        sweep_data = []

        ExperimentRunner.ensure_benchmark_corpus_indexed(db, user_id, strategy="fixed_overlap")

        for th in thresholds:
            run_result = ExperimentRunner.run_benchmark_evaluation(
                db=db,
                user_id=user_id,
                top_k=5,
                similarity_threshold=th,
                chunking_strategy="fixed_overlap",
                run_name=f"Threshold Sweep: th={th}",
                sample_limit=15
            )

            metrics = run_result["metrics"]
            sweep_data.append({
                "threshold": th,
                "recall_at_k": metrics["recall_at_k"],
                "precision_at_k": metrics["precision_at_k"],
                "hit_rate": metrics["hit_rate"],
                "refusal_accuracy": metrics["refusal_accuracy"],
                "groundedness": metrics["groundedness_score"],
                "hallucination_rate": metrics["hallucination_rate"]
            })

        # Persist experiment
        exp = Experiment(
            id=uuid.uuid4(),
            user_id=user_id,
            experiment_name="Similarity Threshold Sensitivity Sweep",
            experiment_type="threshold_sweep",
            status="completed",
            config_json={"thresholds": thresholds, "top_k": 5},
            results_summary={"sweep": sweep_data}
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)

        return {
            "experiment_id": str(exp.id),
            "experiment_name": exp.experiment_name,
            "sweep_data": sweep_data
        }


experiment_runner = ExperimentRunner()
