import re
from typing import List, Dict, Any, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter

DEFAULT_CHUNK_SIZE = 800
DEFAULT_CHUNK_OVERLAP = 150

STRATEGY_FIXED_NO_OVERLAP = "fixed_no_overlap"
STRATEGY_FIXED_OVERLAP = "fixed_overlap"
STRATEGY_SEMANTIC_PARAGRAPH = "semantic_paragraph"

SUPPORTED_STRATEGIES = [
    STRATEGY_FIXED_NO_OVERLAP,
    STRATEGY_FIXED_OVERLAP,
    STRATEGY_SEMANTIC_PARAGRAPH
]


class ChunkingService:
    def __init__(self, chunk_size: int = DEFAULT_CHUNK_SIZE, chunk_overlap: int = DEFAULT_CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self._init_splitters()

    def _init_splitters(self):
        # Strategy B (Default): Recursive character with overlap
        self.splitter_overlap = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        # Strategy A: Fixed-size without overlap
        self.splitter_no_overlap = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=0,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def estimate_token_count(self, text: str) -> int:
        """Estimates token count (approx. 4 characters per token or word count based)."""
        if not text:
            return 0
        words = text.split()
        return max(len(words), len(text) // 4)

    def _extract_section_title(self, text: str, current_title: str = "") -> str:
        """Heuristically extracts section or markdown header from text snippet."""
        for line in text.splitlines():
            line_str = line.strip()
            if line_str.startswith("#"):
                return line_str.lstrip("#").strip()
            if line_str.isupper() and 4 < len(line_str) < 60:
                return line_str.strip()
        return current_title

    def _chunk_semantic_paragraph(
        self,
        text: str,
        target_size: int = 700,
        max_size: int = 950
    ) -> List[Dict[str, Any]]:
        """
        Strategy C: Paragraph-aware semantic chunking.
        Respects natural paragraph boundaries, Markdown headings, and keeps sentences intact.
        """
        paragraphs = re.split(r"\n\s*\n", text)
        chunks = []
        curr_buffer = []
        curr_len = 0
        current_section = ""

        for p in paragraphs:
            clean_p = p.strip()
            if not clean_p:
                continue

            current_section = self._extract_section_title(clean_p, current_section)
            p_len = len(clean_p)

            # If a single paragraph is larger than max_size, split by sentences
            if p_len > max_size:
                # Flush pending buffer first
                if curr_buffer:
                    merged = " ".join(curr_buffer).strip()
                    if merged:
                        chunks.append({"text": merged, "section_title": current_section})
                    curr_buffer = []
                    curr_len = 0

                sentences = re.split(r"(?<=[.?!])\s+", clean_p)
                s_buffer = []
                s_len = 0
                for s in sentences:
                    clean_s = s.strip()
                    if not clean_s:
                        continue
                    if s_len + len(clean_s) > max_size and s_buffer:
                        chunks.append({"text": " ".join(s_buffer).strip(), "section_title": current_section})
                        s_buffer = [clean_s]
                        s_len = len(clean_s)
                    else:
                        s_buffer.append(clean_s)
                        s_len += len(clean_s)
                if s_buffer:
                    chunks.append({"text": " ".join(s_buffer).strip(), "section_title": current_section})
                continue

            # Check if adding this paragraph exceeds target_size
            if curr_len + p_len > target_size and curr_buffer:
                merged = " ".join(curr_buffer).strip()
                if merged:
                    chunks.append({"text": merged, "section_title": current_section})
                curr_buffer = [clean_p]
                curr_len = p_len
            else:
                curr_buffer.append(clean_p)
                curr_len += p_len

        if curr_buffer:
            merged = " ".join(curr_buffer).strip()
            if merged:
                chunks.append({"text": merged, "section_title": current_section})

        return chunks

    def chunk_text(
        self,
        text: str,
        strategy: str = STRATEGY_FIXED_OVERLAP,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Splits text into chunks using the specified chunking strategy.
        Preserves backward compatibility while supporting multi-strategy experimentation.
        """
        pages = [{"page_number": 1, "text": text}]
        return self.chunk_document_pages(
            pages=pages,
            strategy=strategy,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )

    def chunk_document_pages(
        self,
        pages: List[Dict[str, Any]],
        strategy: str = STRATEGY_FIXED_OVERLAP,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Splits page-aware documents into chunks while preserving page numbers,
        section headings, and chunk index sequences.
        """
        if not pages:
            return []

        c_size = chunk_size or self.chunk_size
        c_overlap = chunk_overlap if chunk_overlap is not None else self.chunk_overlap

        # Build custom splitter if custom sizes were specified
        if strategy == STRATEGY_FIXED_NO_OVERLAP:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=c_size if chunk_size else 500,
                chunk_overlap=0,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
        elif strategy == STRATEGY_FIXED_OVERLAP:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=c_size,
                chunk_overlap=c_overlap,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
        else:
            splitter = None

        all_chunks = []
        global_idx = 0
        current_section = ""

        for page in pages:
            page_num = page.get("page_number", 1)
            page_text = page.get("text", "").strip()
            if not page_text:
                continue

            current_section = self._extract_section_title(page_text, current_section)

            if strategy == STRATEGY_SEMANTIC_PARAGRAPH:
                raw_pieces = self._chunk_semantic_paragraph(page_text, target_size=c_size, max_size=c_size + 200)
                for item in raw_pieces:
                    raw_str = item["text"].strip()
                    sec = item["section_title"] or current_section
                    if not raw_str:
                        continue
                    all_chunks.append({
                        "chunk_index": global_idx,
                        "chunk_text": raw_str,
                        "character_count": len(raw_str),
                        "token_count": self.estimate_token_count(raw_str),
                        "page_number": page_num,
                        "section_title": sec,
                        "strategy": strategy
                    })
                    global_idx += 1
            else:
                raw_pieces = splitter.split_text(page_text)
                for piece in raw_pieces:
                    raw_str = piece.strip()
                    if not raw_str:
                        continue
                    current_section = self._extract_section_title(raw_str, current_section)
                    all_chunks.append({
                        "chunk_index": global_idx,
                        "chunk_text": raw_str,
                        "character_count": len(raw_str),
                        "token_count": self.estimate_token_count(raw_str),
                        "page_number": page_num,
                        "section_title": current_section,
                        "strategy": strategy
                    })
                    global_idx += 1

        return all_chunks


default_chunking_service = ChunkingService()

