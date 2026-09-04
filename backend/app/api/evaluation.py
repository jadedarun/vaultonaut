import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.evaluation import EvaluationRun, EvaluationDataset, EvaluationItem, Experiment
from app.core.security import get_current_user
from app.schemas.evaluation import EvaluationRunRequest, EvaluationRunSummary, ExperimentSummary
from app.services.eval.experiment_runner import experiment_runner
from app.services.eval.dataset_service import dataset_service
from app.services.eval.failure_analyzer import failure_analyzer
from app.services.embedding_service import embedding_service

router = APIRouter(prefix="/api/eval", tags=["RAG Evaluation & Engineering Benchmark"])


@router.post("/run", status_code=status.HTTP_200_OK, summary="Execute Real Benchmark Evaluation Run")
def run_evaluation(
    request: EvaluationRunRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Executes an end-to-end evaluation run on the golden benchmark dataset.
    Computes mathematical IR metrics (Recall@K, Precision@K, Hit Rate, MRR)
    and RAG generation metrics (Correctness, Groundedness, Hallucination Rate, Refusal Accuracy).
    """
    return experiment_runner.run_benchmark_evaluation(
        db=db,
        user_id=current_user.id,
        top_k=request.top_k or 5,
        similarity_threshold=request.similarity_threshold if request.similarity_threshold is not None else 0.45,
        chunking_strategy=request.chunking_strategy or "fixed_overlap",
        run_name=request.run_name,
        sample_limit=request.sample_limit
    )


@router.get("/runs", response_model=List[EvaluationRunSummary], summary="List Historical Evaluation Runs")
def list_evaluation_runs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all past evaluation runs for the authenticated user, ordered by date descending."""
    runs = db.query(EvaluationRun).filter(
        EvaluationRun.user_id == current_user.id
    ).order_by(EvaluationRun.created_at.desc()).limit(20).all()

    return [
        EvaluationRunSummary(
            run_id=str(r.id),
            run_name=r.run_name,
            created_at=r.created_at.isoformat() if r.created_at else "",
            top_k=r.top_k,
            similarity_threshold=r.similarity_threshold,
            chunking_strategy=r.chunking_strategy,
            recall_at_k=r.recall_at_k,
            precision_at_k=r.precision_at_k,
            hit_rate=r.hit_rate,
            mrr=r.mrr,
            answer_correctness=r.answer_correctness,
            groundedness_score=r.groundedness_score,
            hallucination_rate=r.hallucination_rate,
            refusal_accuracy=r.refusal_accuracy,
            avg_latency_ms=r.avg_latency_ms,
            total_samples=r.total_samples
        )
        for r in runs
    ]


@router.get("/runs/{run_id}", summary="Get Detailed Evaluation Run with Sample Breakdowns")
def get_evaluation_run(
    run_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Retrieves full evaluation run including per-question answers, ground truth, and latencies."""
    run_obj = db.query(EvaluationRun).filter(
        EvaluationRun.id == run_id,
        EvaluationRun.user_id == current_user.id
    ).first()

    if not run_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation run not found.")

    diagnostics = failure_analyzer.analyze_run_results(run_obj.detailed_results or [])

    return {
        "run_id": str(run_obj.id),
        "run_name": run_obj.run_name,
        "created_at": run_obj.created_at.isoformat() if run_obj.created_at else "",
        "parameters": {
            "top_k": run_obj.top_k,
            "similarity_threshold": run_obj.similarity_threshold,
            "chunking_strategy": run_obj.chunking_strategy,
            "embedding_model": run_obj.embedding_model,
            "total_samples": run_obj.total_samples
        },
        "metrics": {
            "recall_at_k": run_obj.recall_at_k,
            "precision_at_k": run_obj.precision_at_k,
            "hit_rate": run_obj.hit_rate,
            "mrr": run_obj.mrr,
            "answer_correctness": run_obj.answer_correctness,
            "groundedness_score": run_obj.groundedness_score,
            "hallucination_rate": run_obj.hallucination_rate,
            "refusal_accuracy": run_obj.refusal_accuracy
        },
        "avg_latency_ms": run_obj.avg_latency_ms,
        "failure_diagnostics": diagnostics,
        "detailed_results": run_obj.detailed_results
    }


@router.post("/experiments/chunking", summary="Run Multi-Strategy Chunking Comparison")
def run_chunking_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Executes side-by-side benchmark evaluation across 3 chunking strategies:
      - Fixed (500 chars, 0 overlap)
      - Fixed + Overlap (800 chars, 150 overlap)
      - Semantic / Paragraph-aware (~700 chars)
    """
    return experiment_runner.run_chunking_experiment(db=db, user_id=current_user.id)


@router.post("/experiments/threshold", summary="Run Similarity Threshold Sensitivity Sweep")
def run_threshold_sweep(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Evaluates RAG performance across thresholds [0.30, 0.45, 0.60, 0.75]
    to map the Precision vs. Recall trade-off curve.
    """
    return experiment_runner.run_threshold_sweep(db=db, user_id=current_user.id)


@router.get("/experiments", summary="List Historical Experiments")
def list_experiments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Retrieves all historical comparative experiments."""
    exps = db.query(Experiment).filter(
        Experiment.user_id == current_user.id
    ).order_by(Experiment.created_at.desc()).limit(15).all()

    return [
        {
            "experiment_id": str(e.id),
            "experiment_name": e.experiment_name,
            "experiment_type": e.experiment_type,
            "created_at": e.created_at.isoformat() if e.created_at else "",
            "results_summary": e.results_summary
        }
        for e in exps
    ]


@router.get("/failures/{run_id}", summary="Get Detailed Failure Mode Diagnostics")
def get_run_failures(
    run_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retrieves failure mode classification (RETRIEVAL_MISS, THRESHOLD_FALSE_REJECTION,
    FALSE_REFUSAL, HALLUCINATION, FALSE_ACCEPTANCE) for an evaluation run.
    """
    run_obj = db.query(EvaluationRun).filter(
        EvaluationRun.id == run_id,
        EvaluationRun.user_id == current_user.id
    ).first()

    if not run_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation run not found.")

    return failure_analyzer.analyze_run_results(run_obj.detailed_results or [])


@router.get("/dataset", summary="Get Golden Benchmark Dataset Overview")
def get_benchmark_dataset(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Retrieves the benchmark dataset metadata and question breakdown."""
    dataset = dataset_service.get_or_create_benchmark_dataset(db)
    items = db.query(EvaluationItem).filter(EvaluationItem.dataset_id == dataset.id).all()

    return {
        "dataset_id": str(dataset.id),
        "name": dataset.name,
        "description": dataset.description,
        "total_items": len(items),
        "category_distribution": dataset.category_distribution,
        "items": [
            {
                "id": str(item.id),
                "question": item.question,
                "category": item.category,
                "is_unanswerable": item.is_unanswerable,
                "expected_page": item.expected_page,
                "ground_truth_answer": item.ground_truth_answer
            }
            for item in items
        ]
    }


@router.post("/seed-benchmark", summary="Explicitly Ingest Benchmark Corpus Document")
def seed_benchmark_corpus(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Ingests and indexes the distributed systems guide into the vector store for evaluation."""
    experiment_runner.ensure_benchmark_corpus_indexed(db, current_user.id)
    return {"message": "Benchmark corpus successfully indexed and ready for evaluation."}


@router.get("/cache-stats", summary="Get Embedding LRU Cache Performance Statistics")
def get_cache_stats() -> Dict[str, Any]:
    """Returns hits, misses, hit rate percentage, and cached vector counts from EmbeddingCache."""
    return embedding_service.get_cache_stats()


@router.post("/cache/clear", summary="Purge Embedding Cache")
def clear_embedding_cache() -> Dict[str, str]:
    """Purges the in-memory and disk SQLite vector embedding cache."""
    embedding_service.clear_cache()
    return {"message": "Embedding cache successfully cleared."}
