from typing import Optional
from app.services.rag.providers.base_provider import BaseLLMProvider
from app.services.rag.providers.gemini_provider import GeminiProvider


class LLMProviderFactory:
    """
    Factory for retrieving active LLM provider.
    Allows future addition of OpenAIProvider, ClaudeProvider, etc. without modifying RAG business logic.
    """

    @staticmethod
    def get_provider(provider_type: str = "gemini") -> BaseLLMProvider:
        provider_key = provider_type.lower().strip()
        if provider_key in ("gemini", "google"):
            return GeminiProvider()
        else:
            # Default fallback to Gemini
            return GeminiProvider()
