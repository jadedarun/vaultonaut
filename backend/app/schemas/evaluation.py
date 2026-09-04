import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class EvaluationRunRequest(BaseModel):
    top_k: Optional[int] = Field(default=5, ge=1, le=20, description="Number of candidate chunks to retrieve")
    similarity_threshold: Optional[float] = Field(default=0.45, ge=0.0, le=1.0, description="Minimum cosine similarity cutoff")
    chunking_strategy: Optional[str] = Field(default="fixed_overlap", description="Chunking strategy: fixed_no_overlap, fixed_overlap, or semantic_paragraph")
    sample_limit: Optional[int] = Field(default=None, ge=1, le=50, description="Optional cap on benchmark questions to run")
    run_name: Optional[str] = Field(default=None, description="Custom label for the evaluation run")


class EvaluationRunSummary(BaseModel):
    run_id: str
    run_name: str
    created_at: str
    top_k: int
    similarity_threshold: float
    chunking_strategy: str
    recall_at_k: float
    precision_at_k: float
    hit_rate: float
    mrr: float
    answer_correctness: float
    groundedness_score: float
    hallucination_rate: float
    refusal_accuracy: float
    avg_latency_ms: float
    total_samples: int


class ExperimentSummary(BaseModel):
    experiment_id: str
    experiment_name: str
    experiment_type: str
    created_at: str
    results_summary: Dict[str, Any]
