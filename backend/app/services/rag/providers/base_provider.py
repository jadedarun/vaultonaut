from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class BaseLLMProvider(ABC):
    """
    Abstract base class for LLM Provider abstraction.
    Allows seamless swapping between Gemini, OpenAI, Claude, Llama without altering business logic.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def default_model_name(self) -> str:
        pass

    @abstractmethod
    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates text completion from LLM.
        Returns dict containing 'content', 'model', 'latency_ms', and 'token_usage'.
        """
        pass
