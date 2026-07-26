from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

DEFAULT_CHUNK_SIZE = 800
DEFAULT_CHUNK_OVERLAP = 150


class ChunkingService:
    def __init__(self, chunk_size: int = DEFAULT_CHUNK_SIZE, chunk_overlap: int = DEFAULT_CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def estimate_token_count(self, text: str) -> int:
        """Estimates token count (approx. 4 characters per token or word count based)."""
        if not text:
            return 0
        words = text.split()
        return max(len(words), len(text) // 4)

    def chunk_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Splits text into chunks preserving semantic boundaries.
        Returns list of dicts with chunk_index, chunk_text, character_count, token_count.
        """
        if not text or not text.strip():
            return []

        raw_chunks = self.splitter.split_text(text)
        chunks = []

        for idx, chunk_str in enumerate(raw_chunks):
            clean_chunk = chunk_str.strip()
            if not clean_chunk:
                continue
            char_cnt = len(clean_chunk)
            tok_cnt = self.estimate_token_count(clean_chunk)

            chunks.append({
                "chunk_index": idx,
                "chunk_text": clean_chunk,
                "character_count": char_cnt,
                "token_count": tok_cnt
            })

        return chunks


default_chunking_service = ChunkingService()
