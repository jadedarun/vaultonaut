import re
import unicodedata


def preprocess_text(raw_text: str) -> str:
    """
    Production-quality text cleaning and preprocessing:
    - Normalizes Unicode to NFC.
    - Removes non-printable control characters (except newline, tab, carriage return).
    - Trims line-end whitespace.
    - Collapses 3+ consecutive newlines to maximum 2 newlines (preserving paragraph boundaries).
    - Preserves markdown structure, headings, lists, and code blocks.
    """
    if not raw_text:
        return ""

    # 1. Unicode Normalization
    text = unicodedata.normalize("NFC", raw_text)

    # 2. Control Character Filter (keep \n \t \r)
    text = "".join(ch for ch in text if ch in ("\n", "\t", "\r") or (ord(ch) >= 32 and ord(ch) != 127))

    # 3. Clean line trailing whitespace
    lines = [line.rstrip() for line in text.splitlines()]
    text = "\n".join(lines)

    # 4. Collapse 3+ consecutive newlines into 2 (paragraphs)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()
