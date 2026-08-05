from sentence_transformers import SentenceTransformer

from app.services.ai_provider.base import AIProvider
from app.services.ai_provider.config import settings


class LocalProvider(AIProvider):
    """Dev-only embedding provider running sentence-transformers in-process.
    No API key, no network call, no rate limits — good for local dev and
    demos. Model loads once per process and stays cached in memory.
    """

    def __init__(self) -> None:
        self._model = SentenceTransformer(settings.EMBEDDING_MODEL)

    def embed_text(self, text: str) -> list[float]:
        return self._model.encode(text, convert_to_numpy=False).tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        embeddings = self._model.encode(texts, convert_to_numpy=False)
        return [e.tolist() for e in embeddings]