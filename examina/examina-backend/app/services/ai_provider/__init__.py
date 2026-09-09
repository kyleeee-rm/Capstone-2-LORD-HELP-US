"""Public interface for AI provider calls. Everything outside this package
must import ONLY from here — never a provider module directly, never a
provider SDK. See AI_PROVIDER_ABSTRACTION.md.

Two providers are selected independently, at import time:
  - EMBEDDING_PROVIDER controls embed_text()/embed_batch()
  - GENERATION_PROVIDER controls generate_questions(), classify_bloom_level(),
    check_answerability(), check_grammar()
No single provider is assumed to implement both roles — Groq has no
embeddings endpoint, so 'groq' only ever appears in _GENERATION_PROVIDERS.
"""

from app.services.ai_provider.base import AIProvider
from app.services.ai_provider.config import settings
from app.services.ai_provider.local_provider import LocalProvider
from app.services.ai_provider.groq_provider import GroqProvider

_EMBEDDING_PROVIDERS: dict[str, type[AIProvider]] = {
    "local": LocalProvider,
}

_GENERATION_PROVIDERS: dict[str, type[AIProvider]] = {
    "groq": GroqProvider,
}

if settings.EMBEDDING_PROVIDER not in _EMBEDDING_PROVIDERS:
    raise RuntimeError(
        f"Unknown EMBEDDING_PROVIDER '{settings.EMBEDDING_PROVIDER}'. "
        f"Available: {list(_EMBEDDING_PROVIDERS.keys())}"
    )

if settings.GENERATION_PROVIDER not in _GENERATION_PROVIDERS:
    raise RuntimeError(
        f"Unknown GENERATION_PROVIDER '{settings.GENERATION_PROVIDER}'. "
        f"Available: {list(_GENERATION_PROVIDERS.keys())}"
    )

_embedding_provider: AIProvider = _EMBEDDING_PROVIDERS[settings.EMBEDDING_PROVIDER]()
_generation_provider: AIProvider = _GENERATION_PROVIDERS[settings.GENERATION_PROVIDER]()


def embed_text(text: str) -> list[float]:
    return _embedding_provider.embed_text(text)


def embed_batch(texts: list[str]) -> list[list[float]]:
    return _embedding_provider.embed_batch(texts)

def get_embedding_metadata() -> dict[str, str | int]:
    """Returns the active embedding model name + dimension, for callers
    that need to tag data with it (e.g. ChromaDB collection metadata).
    This is the ONLY sanctioned way for code outside ai_provider/ to learn
    this info — never import ai_provider.config directly."""
    return {
        "embedding_model": settings.EMBEDDING_MODEL,
        "embedding_dimension": settings.EMBEDDING_DIMENSION,
    }

def generate_questions(prompt: str, num_questions: int) -> list[dict]:
    """Guarantees the caller never receives more than num_questions items,
    regardless of provider behavior. Per Week 1 spike findings
    (week1_spike_findings.md, Section 8): prompt wording alone proved
    unreliable for exact count control (returned 19-22 for a requested 20)
    even with explicit stop-condition phrasing. This slice is the
    provider-agnostic safety net — every provider implementation still
    needs its own best-effort prompt/parsing logic, but this is the one
    place the guarantee is actually enforced."""
    questions = _generation_provider.generate_questions(prompt, num_questions)
    return questions[:num_questions]


def classify_bloom_level(*args, **kwargs):
    return _generation_provider.classify_bloom_level(*args, **kwargs)


def check_answerability(*args, **kwargs):
    return _generation_provider.check_answerability(*args, **kwargs)


def check_grammar(*args, **kwargs):
    return _generation_provider.check_grammar(*args, **kwargs)
