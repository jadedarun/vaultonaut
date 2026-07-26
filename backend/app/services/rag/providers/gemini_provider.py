import time
from typing import Optional, Dict, Any
from app.config.settings import settings
from app.core.logging import logger
from app.services.rag.providers.base_provider import BaseLLMProvider

try:
    import google.generativeai as genai
except ImportError:
    genai = None


class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self._configured = False
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"

        if genai is not None and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self._configured = True
                logger.info(f"GeminiProvider initialized with model '{self.model_name}'.")
            except Exception as err:
                logger.error(f"Failed to configure Gemini SDK: {err}")

    @property
    def provider_name(self) -> str:
        return "Google Gemini"

    @property
    def default_model_name(self) -> str:
        return self.model_name

    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        active_model_name = model_override or self.model_name

        if genai is None or not self.api_key:
            logger.warning("Gemini SDK or API key not available.")
            raise RuntimeError("Gemini API key is not configured in backend environment settings.")

        try:
            # Construct generation config
            gen_config = genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens or 2048
            )

            # Initialize generative model
            model = genai.GenerativeModel(
                model_name=active_model_name,
                generation_config=gen_config,
                system_instruction=system_prompt if system_prompt else None
            )

            response = model.generate_content(prompt)
            latency_ms = round((time.time() - start_time) * 1000, 2)

            text_content = response.text if response and hasattr(response, "text") else ""

            return {
                "content": text_content.strip(),
                "model": active_model_name,
                "provider": self.provider_name,
                "latency_ms": latency_ms,
                "token_usage": {
                    "prompt_tokens": getattr(response, "prompt_feedback", None) or 0,
                    "candidates_tokens": 0
                }
            }
        except Exception as err:
            logger.error(f"Gemini API generation error: {err}")
            raise RuntimeError(f"Gemini generation failed: {str(err)}")
