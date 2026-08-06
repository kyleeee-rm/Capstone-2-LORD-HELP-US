from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Every provider (local, groq, openai, ...) implements this interface.
    Six methods total per AI_PROVIDER_ABSTRACTION.md — only embed_text() and
    embed_batch() are implemented for Week 4. The rest raise
    NotImplementedError until Month 2's generation/validation work needs
    them, at which point whichever provider is active must implement them
    for real.
    """

    @abstractmethod
    def embed_text(self, text: str) -> list[float]:
        ...

    @abstractmethod
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        ...

    def generate_questions(self, *args, **kwargs):
        raise NotImplementedError("generate_questions() not yet implemented for this provider.")

    def classify_bloom_level(self, *args, **kwargs):
        raise NotImplementedError("classify_bloom_level() not yet implemented for this provider.")

    def check_answerability(self, *args, **kwargs):
        raise NotImplementedError("check_answerability() not yet implemented for this provider.")

    def check_grammar(self, *args, **kwargs):
        raise NotImplementedError("check_grammar() not yet implemented for this provider.")