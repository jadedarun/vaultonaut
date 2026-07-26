from typing import List, Dict, Any


class CitationService:
    def format_citations(self, raw_citations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Formats structured citation objects for API response payload.
        """
        formatted = []
        for cit in raw_citations:
            formatted.append({
                "source_num": cit.get("source_num"),
                "document_title": cit.get("document_title", "Document"),
                "filename": cit.get("filename", "File"),
                "category": cit.get("category", "General"),
                "chunk_index": cit.get("chunk_index", 0),
                "similarity_score": round(float(cit.get("similarity_score", 0.0)), 4),
                "vector_id": cit.get("vector_id"),
                "snippet": cit.get("snippet", "")
            })
        return formatted


citation_service = CitationService()
