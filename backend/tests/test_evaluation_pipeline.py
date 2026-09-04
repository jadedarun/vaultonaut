import pytest
from app.services.eval.metrics import (
    compute_recall_at_k,
    compute_precision_at_k,
    compute_hit_rate,
    compute_mrr,
    compute_answer_correctness,
    compute_groundedness,
    compute_hallucination_rate,
    compute_refusal_accuracy,
    is_refusal_response
)
from app.services.eval.failure_analyzer import failure_analyzer
from app.services.eval.dataset_service import dataset_service
from app.services.chunking_service import (
    default_chunking_service,
    STRATEGY_FIXED_NO_OVERLAP,
    STRATEGY_FIXED_OVERLAP,
    STRATEGY_SEMANTIC_PARAGRAPH
)
from app.services.embedding_service import embedding_service


def test_ir_metrics_formulas():
    """Validates mathematical correctness of Recall@K, Precision@K, Hit Rate, and MRR."""
    retrieved = [
        "Consistent hashing uses a virtual circular ring to map keys.",
        "Paxos and Raft are consensus algorithms.",
        "The CAP theorem states that distributed data stores face tradeoffs."
    ]
    target_keywords = ["CAP theorem", "tradeoffs"]

    # 1. Recall@K:
    # Top 1 chunk doesn't contain CAP theorem:
    recall_at_1 = compute_recall_at_k(retrieved, target_keywords, k=1)
    assert recall_at_1 == 0.0

    # Top 3 chunks contain both keywords:
    recall_at_3 = compute_recall_at_k(retrieved, target_keywords, k=3)
    assert recall_at_3 == 1.0

    # 2. Precision@K:
    # 1 of 3 chunks is relevant:
    precision_at_3 = compute_precision_at_k(retrieved, target_keywords, k=3)
    assert precision_at_3 == round(1.0 / 3.0, 4)

    # 3. Hit Rate@K:
    assert compute_hit_rate(retrieved, target_keywords, k=1) == 0.0
    assert compute_hit_rate(retrieved, target_keywords, k=3) == 1.0

    # 4. MRR:
    # First relevant chunk is at rank 3 -> MRR = 1/3 = 0.3333
    mrr = compute_mrr(retrieved, target_keywords, k=3)
    assert mrr == 0.3333


def test_generation_and_grounding_metrics():
    """Validates Groundedness, Hallucination Rate, Answer Correctness, and Refusal Accuracy."""
    ground_truth = "Raft uses leader election, log replication, and safety to reach consensus."
    good_answer = "Raft achieves consensus through leader election, log replication, and safety."
    refusal_answer = "I couldn't find enough information in your uploaded documents to answer this question."

    context_chunks = ["Raft decomposes consensus into leader election, log replication, and safety."]

    # Groundedness
    groundedness = compute_groundedness(good_answer, context_chunks)
    assert groundedness >= 0.75

    # Hallucination Rate for grounded answer
    hallucination = compute_hallucination_rate(groundedness, is_unanswerable=False, did_refuse=False)
    assert hallucination <= 0.25

    # Refusal recognition
    assert is_refusal_response(refusal_answer) is True
    assert is_refusal_response(good_answer) is False

    # Refusal Accuracy
    # Unanswerable query + refused = 1.0
    assert compute_refusal_accuracy(is_unanswerable=True, did_refuse=True) == 1.0
    # Unanswerable query + answered (hallucinated) = 0.0
    assert compute_refusal_accuracy(is_unanswerable=True, did_refuse=False) == 0.0
    # Answerable query + answered = 1.0
    assert compute_refusal_accuracy(is_unanswerable=False, did_refuse=False) == 1.0
    # Answerable query + refused (false refusal) = 0.0
    assert compute_refusal_accuracy(is_unanswerable=False, did_refuse=True) == 0.0

    # Answer Correctness (Token F1)
    correctness = compute_answer_correctness(good_answer, ground_truth, is_unanswerable=False)
    assert correctness >= 0.60


def test_failure_analyzer_classification():
    """Validates that failure_analyzer correctly categorizes each distinct failure mode."""
    mock_results = [
        # Failure 1: False Acceptance (answered unanswerable)
        {
            "question": "What is the capital of Mars?",
            "is_unanswerable": True,
            "did_refuse": False,
            "retrieved_count": 0,
            "hit_rate": 0.0,
            "groundedness_score": 0.0,
            "answer_correctness": 0.0,
            "generated_answer": "The capital of Mars is Olympus City."
        },
        # Failure 2: Retrieval Miss
        {
            "question": "How does Raft elect a leader?",
            "is_unanswerable": False,
            "did_refuse": False,
            "retrieved_count": 0,
            "hit_rate": 0.0,
            "groundedness_score": 0.0,
            "answer_correctness": 0.0,
            "generated_answer": "Some generic text."
        },
        # Failure 3: False Refusal
        {
            "question": "What are the states of a circuit breaker?",
            "is_unanswerable": False,
            "did_refuse": True,
            "retrieved_count": 2,
            "hit_rate": 1.0,
            "groundedness_score": 1.0,
            "answer_correctness": 0.0,
            "generated_answer": "I couldn't find enough information in your uploaded documents to answer this question."
        },
        # Success Sample
        {
            "question": "What is CAP theorem?",
            "is_unanswerable": False,
            "did_refuse": False,
            "retrieved_count": 3,
            "hit_rate": 1.0,
            "groundedness_score": 0.90,
            "answer_correctness": 0.85,
            "generated_answer": "CAP theorem covers Consistency, Availability, Partition Tolerance."
        }
    ]

    analysis = failure_analyzer.analyze_run_results(mock_results)
    assert analysis["total_samples"] == 4
    assert analysis["successful_samples"] == 1
    assert analysis["total_failures"] == 3

    breakdown = analysis["failure_breakdown"]
    assert breakdown["FALSE_ACCEPTANCE"]["count"] == 1
    assert breakdown["RETRIEVAL_MISS"]["count"] == 1
    assert breakdown["FALSE_REFUSAL"]["count"] == 1


def test_chunking_strategies():
    """Validates multi-strategy chunking across Strategy A, B, and C."""
    sample_text = """# Distributed Storage Systems

Consistency is vital for mission-critical financial ledgers. Every transaction must be committed with strict serializability.

## Consensus Algorithms
Raft divides time into terms and uses randomized election timeouts. Paxos provides the mathematical foundation for state machine replication.

Another paragraph discussing fault tolerance and asynchronous replication models across datacenters.
"""
    pages = [{"page_number": 1, "text": sample_text}]

    # Strategy A: Fixed no overlap
    chunks_a = default_chunking_service.chunk_document_pages(pages, strategy=STRATEGY_FIXED_NO_OVERLAP)
    assert len(chunks_a) >= 1
    assert chunks_a[0]["strategy"] == STRATEGY_FIXED_NO_OVERLAP
    assert chunks_a[0]["page_number"] == 1

    # Strategy B: Fixed with overlap
    chunks_b = default_chunking_service.chunk_document_pages(pages, strategy=STRATEGY_FIXED_OVERLAP)
    assert len(chunks_b) >= 1
    assert chunks_b[0]["strategy"] == STRATEGY_FIXED_OVERLAP

    # Strategy C: Semantic / Paragraph-aware
    chunks_c = default_chunking_service.chunk_document_pages(pages, strategy=STRATEGY_SEMANTIC_PARAGRAPH)
    assert len(chunks_c) >= 1
    assert chunks_c[0]["strategy"] == STRATEGY_SEMANTIC_PARAGRAPH
    # Semantic chunking preserves section titles
    section_titles = [c["section_title"] for c in chunks_c if c.get("section_title")]
    assert len(section_titles) > 0


def test_embedding_cache():
    """Validates vector embedding caching behavior, hits, and misses."""
    test_texts = ["Distributed system consistency test sentence A", "Consensus algorithms test sentence B"]
    
    # Generate embeddings (first time -> miss)
    vecs_first = embedding_service.generate_embeddings(test_texts)
    assert len(vecs_first) == 2
    assert len(vecs_first[0]) == 384

    stats_before = embedding_service.get_cache_stats()
    hits_before = stats_before["hits"]

    # Generate again -> should hit cache
    vecs_second = embedding_service.generate_embeddings(test_texts)
    stats_after = embedding_service.get_cache_stats()

    assert stats_after["hits"] >= hits_before + 2
    assert vecs_first[0] == vecs_second[0]


def test_benchmark_dataset_seeding(db_session):
    """Validates that get_or_create_benchmark_dataset seeds 35 golden questions."""
    dataset = dataset_service.get_or_create_benchmark_dataset(db_session)
    assert dataset is not None
    assert dataset.name == "Vaultonaut Technical RAG Benchmark"
    assert len(dataset.items) == 35

    categories = set(item.category for item in dataset.items)
    expected_categories = {"fact_retrieval", "multi_sentence", "comparison", "summarization", "numerical", "distractor", "unanswerable"}
    assert expected_categories.issubset(categories)


def test_evaluation_api_endpoints(client):
    """Validates REST endpoints for dataset metadata and embedding cache stats."""
    # 1. Dataset overview endpoint
    resp = client.get("/api/eval/dataset")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_items"] == 35
    assert "category_distribution" in data

    # 2. Embedding cache stats endpoint
    cache_resp = client.get("/api/eval/cache-stats")
    assert cache_resp.status_code == 200
    cache_data = cache_resp.json()
    assert "hits" in cache_data
    assert "misses" in cache_data
    assert "hit_rate_pct" in cache_data
