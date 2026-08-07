from app.services.ai_provider.base import AIProvider


class GroqProvider(AIProvider):
    """Handles generation/validation only — Groq has no embeddings endpoint.
    generate_questions/classify_bloom_level/check_answerability/check_grammar
    get real implementations in Week 6-8. Until then they inherit
    NotImplementedError from AIProvider's defaults.
    """

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
