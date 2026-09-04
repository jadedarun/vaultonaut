from typing import List, Dict, Any


class FailureAnalyzer:
    """
    Diagnoses and categorizes RAG system failures into actionable engineering root causes.
    Taxonomy:
      1. RETRIEVAL_MISS: Semantic gap; query failed to retrieve relevant chunks in top-K.
      2. THRESHOLD_FALSE_REJECTION: Chunk was retrieved, but filtered out by relevance gate.
      3. FALSE_REFUSAL: Context was present, but generative model prematurely refused to answer.
      4. HALLUCINATION: Model generated unsupported assertions not attested in retrieved context.
      5. FALSE_ACCEPTANCE: Model fabricated an answer to an unanswerable query instead of refusing.
    """

    @staticmethod
    def analyze_run_results(detailed_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        failure_buckets: Dict[str, List[Dict[str, Any]]] = {
            "RETRIEVAL_MISS": [],
            "THRESHOLD_FALSE_REJECTION": [],
            "FALSE_REFUSAL": [],
            "HALLUCINATION": [],
            "FALSE_ACCEPTANCE": []
        }

        total_samples = len(detailed_results)
        successful_samples = 0

        for item in detailed_results:
            is_unanswerable = item.get("is_unanswerable", False)
            did_refuse = item.get("did_refuse", False)
            retrieved_count = item.get("retrieved_count", 0)
            hit_rate = item.get("hit_rate", 0.0)
            groundedness = item.get("groundedness_score", 1.0)
            correctness = item.get("answer_correctness", 0.0)

            # Failure Mode 1: False Acceptance (Hallucination on unanswerable query)
            if is_unanswerable and not did_refuse:
                failure_buckets["FALSE_ACCEPTANCE"].append({
                    "question": item.get("question"),
                    "category": item.get("category"),
                    "generated_answer": item.get("generated_answer"),
                    "root_cause": "Model attempted to answer an unanswerable / out-of-domain question with fabricated information instead of invoking grounded refusal.",
                    "mitigation": "Increase refusal system prompt enforcement, or elevate similarity score threshold."
                })
                continue

            # If unanswerable and refused: that is a success
            if is_unanswerable and did_refuse:
                successful_samples += 1
                continue

            # Answerable Queries:
            # Failure Mode 2: Retrieval Miss
            if retrieved_count == 0 or hit_rate == 0.0:
                failure_buckets["RETRIEVAL_MISS"].append({
                    "question": item.get("question"),
                    "category": item.get("category"),
                    "retrieved_count": retrieved_count,
                    "hit_rate": hit_rate,
                    "root_cause": "Vector similarity search failed to retrieve ground-truth chunks within top-K. Likely causes: lexical mismatch, embedding semantic divergence, or inappropriate chunk sizing.",
                    "mitigation": "Experiment with Semantic/Paragraph chunking, hybrid keyword search (BM25 + Dense), or query expansion."
                })
                continue

            # Failure Mode 3: False Refusal
            if did_refuse and hit_rate > 0.0:
                failure_buckets["FALSE_REFUSAL"].append({
                    "question": item.get("question"),
                    "category": item.get("category"),
                    "generated_answer": item.get("generated_answer"),
                    "root_cause": "Relevant chunks were successfully retrieved into context, but LLM erroneously concluded it lacked information.",
                    "mitigation": "Calibrate system prompt instructions to synthesize partial evidence rather than strictly defaulting to refusal."
                })
                continue

            # Failure Mode 4: Hallucination / Unsupported generation
            if groundedness < 0.40 and correctness < 0.40:
                failure_buckets["HALLUCINATION"].append({
                    "question": item.get("question"),
                    "category": item.get("category"),
                    "groundedness_score": groundedness,
                    "answer_correctness": correctness,
                    "generated_answer": item.get("generated_answer"),
                    "root_cause": "Model generated assertions with poor contextual attestation (<40% content word grounding).",
                    "mitigation": "Lower generation temperature, reinforce strict citation constraints, and add verification post-processing."
                })
                continue

            # Otherwise deemed successful
            successful_samples += 1

        total_failures = total_samples - successful_samples
        summary = {}
        for mode, examples in failure_buckets.items():
            cnt = len(examples)
            summary[mode] = {
                "count": cnt,
                "percentage": round((cnt / total_samples) * 100, 1) if total_samples > 0 else 0.0,
                "examples": examples[:5]  # Top 5 illustrative examples
            }

        return {
            "total_samples": total_samples,
            "successful_samples": successful_samples,
            "total_failures": total_failures,
            "success_rate_pct": round((successful_samples / total_samples) * 100, 1) if total_samples > 0 else 0.0,
            "failure_breakdown": summary
        }


failure_analyzer = FailureAnalyzer()
