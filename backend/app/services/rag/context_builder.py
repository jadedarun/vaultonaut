from typing import List, Dict, Any, Tuple


class ContextBuilderService:
    def format_context(self, retrieved_chunks: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Deduplicates, sorts, and formats retrieved ChromaDB chunks into a clean context block.
        Returns (formatted_context_string, structured_citations_list).
        """
        if not retrieved_chunks:
            return "", []

        # Deduplicate chunks by vector_id or chunk text
        seen_texts = set()
        deduped_chunks = []
        for chunk in retrieved_chunks:
            txt = chunk.get("chunk_text", "").strip()
            if txt and txt not in seen_texts:
                seen_texts.add(txt)
                deduped_chunks.append(chunk)

        # Sort by similarity score descending
        sorted_chunks = sorted(
            deduped_chunks,
            key=lambda c: c.get("similarity_score", 0.0),
            reverse=True
        )

        context_blocks = []
        citations = []

        for idx, chunk in enumerate(sorted_chunks, 1):
            meta = chunk.get("metadata", {})
            doc_title = meta.get("title") or meta.get("original_filename") or "Document"
            filename = meta.get("original_filename") or "File"
            category = meta.get("category", "General")
            chunk_idx = meta.get("chunk_index", 0)
            page_number = meta.get("page_number", 1)
            section_title = meta.get("section_title", "")
            score = chunk.get("similarity_score", 0.0)

            section_line = f"Section: {section_title}\n" if section_title else ""
            block = (
                f"--- SOURCE ITEM {idx} ---\n"
                f"Document Title: {doc_title}\n"
                f"Filename: {filename}\n"
                f"Page: {page_number}\n"
                f"{section_line}"
                f"Category: {category}\n"
                f"Chunk Index: {chunk_idx}\n"
                f"Similarity Score: {score}\n"
                f"Content:\n{chunk.get('chunk_text', '')}\n"
            )
            context_blocks.append(block)

            citations.append({
                "source_num": idx,
                "document_title": doc_title,
                "filename": filename,
                "category": category,
                "page_number": page_number,
                "section_title": section_title,
                "chunk_index": chunk_idx,
                "similarity_score": score,
                "vector_id": chunk.get("vector_id"),
                "snippet": chunk.get("chunk_text", "")[:250],
                "chunk_text": chunk.get("chunk_text", "")
            })

        formatted_context_str = "\n\n".join(context_blocks)
        return formatted_context_str, citations


context_builder_service = ContextBuilderService()

