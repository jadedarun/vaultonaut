import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import String, DateTime, Text, Integer, Float, Boolean, JSON, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class EvaluationDataset(Base):
    __tablename__ = "evaluation_datasets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category_distribution: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    items: Mapped[List["EvaluationItem"]] = relationship("EvaluationItem", back_populates="dataset", cascade="all, delete-orphan")
    runs: Mapped[List["EvaluationRun"]] = relationship("EvaluationRun", back_populates="dataset", cascade="all, delete-orphan")


class EvaluationItem(Base):
    __tablename__ = "evaluation_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evaluation_datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    ground_truth_answer: Mapped[str] = mapped_column(Text, nullable=False)
    relevant_chunk_keywords: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    expected_page: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    category: Mapped[str] = mapped_column(String(64), nullable=False)  # fact_retrieval, comparison, summarization, etc.
    is_unanswerable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    dataset: Mapped["EvaluationDataset"] = relationship("EvaluationDataset", back_populates="items")


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    dataset_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evaluation_datasets.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    run_name: Mapped[str] = mapped_column(String(255), nullable=False)
    top_k: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    similarity_threshold: Mapped[float] = mapped_column(Float, default=0.45, nullable=False)
    chunking_strategy: Mapped[str] = mapped_column(String(64), default="fixed_overlap", nullable=False)
    embedding_model: Mapped[str] = mapped_column(String(128), default="all-MiniLM-L6-v2", nullable=False)

    # Core IR and RAG Metrics
    recall_at_k: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    precision_at_k: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    hit_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    mrr: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    answer_correctness: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    groundedness_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    hallucination_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    refusal_accuracy: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    avg_latency_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_samples: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    detailed_results: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    dataset: Mapped[Optional["EvaluationDataset"]] = relationship("EvaluationDataset", back_populates="runs")


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    experiment_name: Mapped[str] = mapped_column(String(255), nullable=False)
    experiment_type: Mapped[str] = mapped_column(String(64), nullable=False)  # chunking_comparison, threshold_sweep, top_k_sweep
    status: Mapped[str] = mapped_column(String(32), default="completed", nullable=False)
    config_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    results_summary: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
