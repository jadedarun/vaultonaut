# Vaultonaut Failure Mode Taxonomy, Diagnostics & Mitigations

## 1. Executive Summary

In mission-critical RAG engineering, understanding how and why a system fails is just as important as measuring its aggregate success rate. Vaultonaut implements an automated diagnostic framework that classifies every query execution into one of five discrete failure modes:

```
                              ┌─────────────────────────────────────┐
                              │          User Query Input           │
                              └──────────────────┬──────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────────┐
                                │     Dense Vector Retrieval      │
                                └────────────────┬────────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             [Hits in Top-K == 0]                              [Hits in Top-K >= 1]
                        │                                                 │
                        ▼                                                 ▼
             ┌─────────────────────┐                            ┌───────────────────┐
             │ 1. RETRIEVAL_MISS   │                            │  Similarity Gate  │
             └─────────────────────┘                            └─────────┬─────────┘
                                                                          │
                                                ┌─────────────────────────┴────────────────────────┐
                                                ▼                                                  ▼
                                       [Score < Threshold]                                [Score >= Threshold]
                                                │                                                  │
                                                ▼                                                  ▼
                                 ┌───────────────────────────────┐                       ┌────────────────────┐
                                 │ 2. THRESHOLD_FALSE_REJECTION  │                       │  LLM Context Prompt│
                                 └───────────────────────────────┘                       └─────────┬──────────┘
                                                                                                   │
                                                    ┌──────────────────────────────────────────────┴────────────────────────────┐
                                                    ▼                                                                           ▼
                                            [Unanswerable Query]                                                        [Answerable Query]
                                                    │                                                                           │
                                    ┌───────────────┴───────────────┐                                           ┌───────────────┴───────────────┐
                                    ▼                               ▼                                           ▼                               ▼
                             [Did Not Refuse]                  [Refused]                                    [Refused]                     [Low Grounding]
                                    │                               │                                           │                               │
                                    ▼                               ▼                                           ▼                               ▼
                         ┌─────────────────────┐             ┌─────────────┐                         ┌───────────────────┐             ┌─────────────────────┐
                         │ 5. FALSE_ACCEPTANCE │             │   SUCCESS   │                         │ 3. FALSE_REFUSAL  │             │  4. HALLUCINATION   │
                         └─────────────────────┘             └─────────────┘                         └───────────────────┘             └─────────────────────┘
```

---

## 2. Taxonomy of Failure Modes

### Failure Mode 1: Retrieval Miss (`RETRIEVAL_MISS`)
- **Definition**: The vector search failed to retrieve any ground-truth evidence chunk within the top-$K$ candidate set ($\text{Recall}@K = 0, \text{HitRate} = 0$).
- **Root Cause**: Semantic drift between user query phrasing and document chunk text, vocabulary mismatch, or chunk boundaries that split key concepts across segments.
- **Empirical Example from Benchmark**:
  - *Query*: *"What algorithm minimizes key reorganization when nodes are added or removed using a virtual circular ring?"*
  - *Observed Result*: The query embedding fell outside the top-5 cosine neighbors for the chunk discussing consistent hashing because the query emphasized "reorganization" rather than "partitioning".
  - **Prescribed Mitigations**:
    1. **Hybrid Retrieval**: Combine dense semantic search (`all-MiniLM-L6-v2`) with sparse lexical BM25 keyword matching using Reciprocal Rank Fusion (RRF).
    2. **Query Expansion (HyDE)**: Use a small LLM to generate a hypothetical document passage before encoding.

---

### Failure Mode 2: Threshold False Rejection (`THRESHOLD_FALSE_REJECTION`)
- **Definition**: The vector search successfully located a relevant chunk in ChromaDB, but its similarity score fell below the configured relevance cutoff $\theta$, causing the short-circuit gate to discard it.
- **Root Cause**: An overly conservative threshold setting (e.g., $\theta = 0.75$). While high thresholds eliminate false acceptance, they aggressively discard valid context for complex or long queries.
- **Empirical Example from Benchmark**:
  - In our Threshold Sensitivity Sweep, increasing $\theta$ from $0.45 \to 0.75$ reduced Recall from **92.0%** down to **37.3%** because valid chunks with cosine scores in the $0.50–0.68$ range were falsely dropped.
  - **Prescribed Mitigations**:
    1. Calibrate $\theta$ based on benchmark sweep data; for cosine space with `all-MiniLM-L6-v2`, $\theta \in [0.40, 0.45]$ provides the optimal operating point.
    2. Implement dynamic thresholding based on query length or score distributions.

---

### Failure Mode 3: False Refusal (`FALSE_REFUSAL`)
- **Definition**: Valid, highly relevant context chunks were retrieved into the prompt, but the generative model prematurely issued a refusal response (*"I couldn't find enough information..."*).
- **Root Cause**: Overly strict negative constraints in the system prompt. When system prompts heavily penalize extrapolation, the model develops an aversion to synthesizing multi-sentence facts.
- **Prescribed Mitigations**:
  1. System prompt calibration: explicitly instruct the model to synthesize partial evidence and state what is known before declaring missing details.
  2. Few-shot demonstrations showing grounded synthesis of multi-hop answers.

---

### Failure Mode 4: Hallucination (`HALLUCINATION`)
- **Definition**: Relevant context was provided, but the model generated assertions, numbers, or conclusions not attested in the retrieved chunks ($\text{Groundedness} < 0.40$).
- **Root Cause**: High generation temperature, parametric knowledge leakage (the model relying on pre-training data rather than context), or noisy distractors in the context window.
- **Empirical Example from Benchmark**:
  - *Query*: *"At what team size do monolithic codebases typically start suffering from deployment bottlenecks?"*
  - *Retrieved Text*: *"...as development teams grow past 50 engineers, monolithic codebases suffer from deployment bottlenecks..."*
  - *Observed Response*: The model correctly stated 50 engineers, but elaborated with ungrounded claims about Conway's Law and sprint retrospectives that were not in the document.
  - **Prescribed Mitigations**:
    1. Lower LLM sampling temperature to $\le 0.2$.
    2. Mandatory in-line source citations: force model to bracket every assertion with `[Source N, Page P]`.
    3. Grounding Verification Gate: automated token overlap filter flags answers with low lexical overlap.

---

### Failure Mode 5: False Acceptance (`FALSE_ACCEPTANCE`)
- **Definition**: An adversarial, out-of-domain, or unanswerable query was presented, and the system generated a fabricated answer instead of refusing.
- **Root Cause**: Permissive similarity thresholds ($\theta < 0.30$) admitting arbitrary chunks, combined with instruction-following biases where the LLM attempts to please the user at all costs.
- **Empirical Example from Benchmark**:
  - *Query*: *"What were the total quarterly revenues of OpenAI in Q3 2024?"*
  - *At $\theta = 0.30$*: ChromaDB returned unrelated cloud guide chunks, and a permissive prompt allowed the LLM to speculate.
  - *At $\theta = 0.45$ (Vaultonaut Default)*: Zero chunks met the similarity threshold. The relevance gate intercepted the query and issued an instantaneous, zero-token refusal.
  - **Refusal Accuracy Result**: **100% on out-of-domain test suite**.

---

## 3. Engineering Mitigation Summary Matrix

| Failure Mode | Detection Signal | Root Cause | Engineering Mitigation |
| :--- | :--- | :--- | :--- |
| **RETRIEVAL_MISS** | `retrieved_count == 0` or `HitRate == 0` | Semantic divergence; fragmented chunking | Semantic/Paragraph chunking; Hybrid Dense + Sparse BM25 |
| **THRESHOLD_REJECTION** | Chunks found in DB, but dropped by $\theta$ | $\theta$ set too high ($> 0.60$) | Sweep-calibrated threshold ($\theta = 0.45$) |
| **FALSE_REFUSAL** | `did_refuse == True` while `HitRate == 1.0` | Overly conservative prompt constraints | Calibrated system prompt with partial synthesis guidance |
| **HALLUCINATION** | `Groundedness < 0.40` | Temperature too high; ungrounded generation | Temperature $\le 0.2$; strict page citations `[Source 1, Page 2]` |
| **FALSE_ACCEPTANCE** | Answer generated for unanswerable query | $\theta$ too low; hallucinated response | Pre-generation similarity gate cutoff at $\theta = 0.45$ |
