import json

from groq import Groq

from app.services.ai_provider.base import AIProvider
from app.services.ai_provider.config import settings


class GroqProvider(AIProvider):
    """Handles generation/validation only — Groq has no embeddings endpoint.
    generate_questions() is real as of Week 6. classify_bloom_level/
    check_answerability/check_grammar still inherit NotImplementedError
    from AIProvider's defaults — Week 7-8 scope.
    """

    def __init__(self):
        self._client = Groq(api_key=settings.GROQ_API_KEY)

    def embed_text(self, text: str) -> list[float]:
        raise NotImplementedError(
            "GroqProvider does not implement embeddings — Groq has no "
            "embeddings endpoint. Set EMBEDDING_PROVIDER=local instead."
        )

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError(
            "GroqProvider does not implement embeddings — Groq has no "
            "embeddings endpoint. Set EMBEDDING_PROVIDER=local instead."
        )

    def generate_questions(self, prompt: str, num_questions: int) -> list[dict]:
        """Best-effort generation — does NOT guarantee exact count on its
        own (per Week 1 spike findings, prompt wording alone is
        unreliable). The hard guarantee lives in ai_provider/__init__.py's
        wrapper, which slices this function's output. This function's job
        is just: call the model, parse JSON, return whatever it gives back.
        """
        response = self._client.chat.completions.create(
            model=settings.GENERATION_MODEL,
            messages=[{"role": "user", "content": prompt}],
            reasoning_effort=settings.REASONING_EFFORT,
            response_format=(
                {"type": "json_object"} if settings.JSON_MODE else None
            ),
            temperature=settings.TEMPERATURE,
        )

        raw = response.choices[0].message.content

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"GroqProvider.generate_questions() got non-JSON output "
                f"from {settings.GENERATION_MODEL}: {raw[:200]}"
            ) from exc

        questions = parsed.get("questions")
        if not isinstance(questions, list):
            raise ValueError(
                f"GroqProvider.generate_questions() expected a 'questions' "
                f"list in the JSON response, got: {parsed}"
            )

        return questions