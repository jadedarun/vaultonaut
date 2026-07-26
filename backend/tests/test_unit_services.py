import pytest
from unittest.mock import MagicMock, patch
from app.services.chunking_service import ChunkingService
from app.services.rag.providers.gemini_provider import GeminiProvider

def test_chunking_service_bounds():
    chunker = ChunkingService(chunk_size=800, chunk_overlap=150)
    sample_text = "Vaultonaut is an AI-powered Personal Knowledge Operating System. " * 30
    chunks = chunker.chunk_text(sample_text)
    
    assert len(chunks) > 0
    for chunk in chunks:
        assert len(chunk["chunk_text"]) <= 900  # Reasonable overlap allowance

def test_gemini_provider_mock():
    with patch("app.services.rag.providers.gemini_provider.genai") as mock_genai:
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "This is a mocked Gemini grounded response."
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        provider = GeminiProvider()
        response_payload = provider.generate_response("System prompt", "User question")

        assert isinstance(response_payload, dict)
        assert response_payload["content"] == "This is a mocked Gemini grounded response."
        assert response_payload["provider"] == "Google Gemini"
