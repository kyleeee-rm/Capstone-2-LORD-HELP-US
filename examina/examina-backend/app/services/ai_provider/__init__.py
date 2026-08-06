"""Public interface for AI provider calls. Everything outside this package
must import ONLY from here — never a provider module directly, never a
provider SDK. See AI_PROVIDER_ABSTRACTION.md.

Provider is selected once, at import time, based on AI_PROVIDER env var.
Add new providers to _PROVIDERS as they're built (groq for generation,
openai for the Week 16 switch).
"""

from app.services.ai_provider.base import AIProvider
from app.services.ai_provider.config import settings
from app.services.ai_provider.local_provider import LocalProvider

_PROVIDERS: dict[str, type[AIProvider]] = {
    "local": LocalProvider,
}

if settings.AI_PROVIDER not in _PROVIDERS:
    raise RuntimeError(
        f"Unknown AI_PROVIDER '{settings.AI_PROVIDER}'. "
        f"Available: {list(_PROVIDERS.keys())}"
    )

_provider: AIProvider = _PROVIDERS[settings.AI_PROVIDER]()


def embed_text(text: str) -> list[float]:
    return _provider.embed_text(text)


def embed_batch(texts: list[str]) -> list[list[float]]:
    return _provider.embed_batch(texts)


def generate_questions(*args, **kwargs):
    return _provider.generate_questions(*args, **kwargs)


def classify_bloom_level(*args, **kwargs):
    return _provider.classify_bloom_level(*args, **kwargs)


def check_answerability(*args, **kwargs):
    return _provider.check_answerability(*args, **kwargs)


def check_grammar(*args, **kwargs):
    return _provider.check_grammar(*args, **kwargs)