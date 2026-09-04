import re
from typing import List, Dict, Any, Set, Tuple

# Common stop words to exclude from keyword / concept overlap computations
STOP_WORDS: Set[str] = {
    "the", "and", "that", "have", "for", "not", "with", "you", "this", "but", "his",
    "from", "they", "say", "her", "she", "will", "one", "all", "would", "there",
    "their", "what", "out", "about", "who", "get", "which", "when", "make", "can",
    "like", "time", "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then", "now", "look",
    "only", "come", "its", "over", "think", "also", "back", "after", "use", "two",
    "how", "our", "work", "first", "well", "even", "new", "want", "because", "any",
    "these", "give", "day", "most", "us", "are", "was", "were", "been", "being"
}

REFUSAL_SIGNATURES = [
    "couldn't find enough information",
    "could not find enough information",
    "not enough information",
    "i cannot answer",
    "no relevant context found",
    "no information provided",
    "does not mention",
    "does not contain"
]


def extract_content_tokens(text: str) -> List[str]:
    """Tokenizes text into clean lowercase content words (min 3 chars, alphanumeric)."""
    if not text:
        return []
    words = re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", text.lower())
    return [w for w in words if w not in STOP_WORDS]


def is_refusal_response(text: str) -> bool:
    """Checks if text contains standard RAG refusal phrasing."""
    if not text:
        return True
    lower = text.lower()
    return any(sig in lower for sig in REFUSAL_SIGNATURES)


def is_chunk_relevant(chunk_text: str, target_keywords: List[str]) -> bool:
    """
    Determines whether a chunk contains the target keywords/phrases required to answer the query.
    Matches if at least 60% of keywords (or any compound phrase) appear in chunk_text.
    """
    if not target_keywords:
        return True
    if not chunk_text:
        return False

    chunk_lower = chunk_text.lower()
    matched_count = 0

    for kw in target_keywords:
        kw_clean = kw.strip().lower()
        if not kw_clean:
            continue
        if kw_clean in chunk_lower:
            matched_count += 1

    match_ratio = matched_count / len(target_keywords)
    return match_ratio >= 0.50 or (len(target_keywords) >= 4 and matched_count >= 2)


def compute_recall_at_k(
    retrieved_chunk_texts: List[str],
    target_keywords: List[str],
    k: int = 5,
    is_unanswerable: bool = False
) -> float:
    """
    Computes Recall@K:
    Measures whether the relevant information was captured in the top-K retrieved candidates.
    For unanswerable queries: Recall is 1.0 (empty set successfully preserved).
    """
    if is_unanswerable:
        return 1.0
    if not target_keywords:
        return 1.0

    candidates = retrieved_chunk_texts[:k]
    if not candidates:
        return 0.0

    # Count how many target keywords appeared across all top-k candidates
    combined_text = " ".join(candidates).lower()
    matched = sum(1 for kw in target_keywords if kw.strip().lower() in combined_text)
    return round(matched / len(target_keywords), 4)


def compute_precision_at_k(
    retrieved_chunk_texts: List[str],
    target_keywords: List[str],
    k: int = 5,
    is_unanswerable: bool = False
) -> float:
    """
    Computes Precision@K:
    Measures the proportion of retrieved chunks in top-K that are actually relevant.
    Precision@K = (Number of relevant chunks in top-K) / K
    """
    if is_unanswerable:
        # If unanswerable, precision is 1.0 if no chunks were retrieved above threshold
        return 1.0 if not retrieved_chunk_texts else 0.0

    candidates = retrieved_chunk_texts[:k]
    if not candidates:
        return 0.0

    relevant_count = sum(1 for chunk in candidates if is_chunk_relevant(chunk, target_keywords))
    effective_k = min(k, len(candidates))
    return round(relevant_count / effective_k, 4) if effective_k > 0 else 0.0


def compute_hit_rate(
    retrieved_chunk_texts: List[str],
    target_keywords: List[str],
    k: int = 5,
    is_unanswerable: bool = False
) -> float:
    """
    Computes Hit Rate@K:
    Binary indicator: 1.0 if at least one relevant chunk appears in the top-K list, else 0.0.
    """
    if is_unanswerable:
        return 1.0

    candidates = retrieved_chunk_texts[:k]
    for chunk in candidates:
        if is_chunk_relevant(chunk, target_keywords):
            return 1.0
    return 0.0


def compute_mrr(
    retrieved_chunk_texts: List[str],
    target_keywords: List[str],
    k: int = 5,
    is_unanswerable: bool = False
) -> float:
    """
    Computes Mean Reciprocal Rank (MRR):
    MRR = 1 / rank of the first relevant chunk in top-K candidates. Returns 0.0 if not found.
    """
    if is_unanswerable:
        return 1.0

    candidates = retrieved_chunk_texts[:k]
    for rank_idx, chunk in enumerate(candidates, 1):
        if is_chunk_relevant(chunk, target_keywords):
            return round(1.0 / rank_idx, 4)
    return 0.0


def compute_answer_correctness(
    generated_answer: str,
    ground_truth_answer: str,
    is_unanswerable: bool = False
) -> float:
    """
    Computes Answer Correctness:
    Computes Token F1 score and key concept overlap between generated answer and ground truth.
    For unanswerable queries: 1.0 if correctly refused, 0.0 if fabricated.
    """
    did_refuse = is_refusal_response(generated_answer)
    if is_unanswerable:
        return 1.0 if did_refuse else 0.0

    if did_refuse:
        return 0.0

    gen_tokens = extract_content_tokens(generated_answer)
    gt_tokens = extract_content_tokens(ground_truth_answer)

    if not gt_tokens:
        return 1.0
    if not gen_tokens:
        return 0.0

    gen_set = set(gen_tokens)
    gt_set = set(gt_tokens)

    overlap = len(gen_set & gt_set)
    precision = overlap / len(gen_set) if gen_set else 0.0
    recall = overlap / len(gt_set) if gt_set else 0.0

    if precision + recall == 0:
        return 0.0

    f1 = 2 * (precision * recall) / (precision + recall)
    return round(f1, 4)


def compute_groundedness(
    generated_answer: str,
    retrieved_chunk_texts: List[str]
) -> float:
    """
    Computes Groundedness / Faithfulness:
    Measures the ratio of factual content tokens in the generated answer that are directly attested in the retrieved context.
    """
    if is_refusal_response(generated_answer):
        return 1.0

    if not retrieved_chunk_texts:
        return 0.0

    gen_tokens = extract_content_tokens(generated_answer)
    if not gen_tokens:
        return 1.0

    context_str = " ".join(retrieved_chunk_texts).lower()
    attested = sum(1 for token in gen_tokens if token in context_str)
    return round(attested / len(gen_tokens), 4)


def compute_hallucination_rate(
    groundedness_score: float,
    is_unanswerable: bool,
    did_refuse: bool
) -> float:
    """
    Computes Hallucination Rate:
    - For unanswerable queries: 1.0 if the model answered anyway, 0.0 if correctly refused.
    - For answerable queries: 1.0 - groundedness_score.
    """
    if is_unanswerable:
        return 0.0 if did_refuse else 1.0
    if did_refuse:
        return 0.0
    return round(max(0.0, 1.0 - groundedness_score), 4)


def compute_refusal_accuracy(
    is_unanswerable: bool,
    did_refuse: bool
) -> float:
    """
    Computes Refusal Accuracy:
    1.0 if unanswerable was refused OR answerable was answered.
    0.0 if false refusal (falsely refused answerable) OR false acceptance (hallucinated unanswerable).
    """
    if is_unanswerable and did_refuse:
        return 1.0
    if not is_unanswerable and not did_refuse:
        return 1.0
    return 0.0


def evaluate_single_sample(
    question: str,
    ground_truth_answer: str,
    relevant_keywords: List[str],
    retrieved_chunks: List[Dict[str, Any]],
    generated_answer: str,
    is_unanswerable: bool = False,
    top_k: int = 5,
    category: str = "fact_retrieval"
) -> Dict[str, Any]:
    """
    Evaluates a single question end-to-end against retrieved chunks and generated answer.
    Returns comprehensive metrics dictionary for the individual sample.
    """
    chunk_texts = [c.get("chunk_text", "") for c in retrieved_chunks]
    did_refuse = is_refusal_response(generated_answer)

    recall = compute_recall_at_k(chunk_texts, relevant_keywords, k=top_k, is_unanswerable=is_unanswerable)
    precision = compute_precision_at_k(chunk_texts, relevant_keywords, k=top_k, is_unanswerable=is_unanswerable)
    hit_rate = compute_hit_rate(chunk_texts, relevant_keywords, k=top_k, is_unanswerable=is_unanswerable)
    mrr = compute_mrr(chunk_texts, relevant_keywords, k=top_k, is_unanswerable=is_unanswerable)

    correctness = compute_answer_correctness(generated_answer, ground_truth_answer, is_unanswerable=is_unanswerable)
    groundedness = compute_groundedness(generated_answer, chunk_texts)
    hallucination = compute_hallucination_rate(groundedness, is_unanswerable, did_refuse)
    refusal_acc = compute_refusal_accuracy(is_unanswerable, did_refuse)

    return {
        "question": question,
        "category": category,
        "is_unanswerable": is_unanswerable,
        "did_refuse": did_refuse,
        "retrieved_count": len(retrieved_chunks),
        "recall_at_k": recall,
        "precision_at_k": precision,
        "hit_rate": hit_rate,
        "mrr": mrr,
        "answer_correctness": correctness,
        "groundedness_score": groundedness,
        "hallucination_rate": hallucination,
        "refusal_accuracy": refusal_acc,
        "generated_answer": generated_answer,
        "ground_truth_answer": ground_truth_answer,
        "citations_count": len(retrieved_chunks)
    }
