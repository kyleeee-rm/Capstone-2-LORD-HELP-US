from pydantic_settings import BaseSettings


class AIProviderSettings(BaseSettings):
    """Reads AI provider config from env. This is the ONLY file allowed to
    know provider/model names or embedding dimensions — see
    AI_PROVIDER_ABSTRACTION.md. Everything outside ai_provider/ must go
    through the functions in __init__.py instead.
    """

    EMBEDDING_PROVIDER: str = "local"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    GENERATION_PROVIDER: str = "groq"
    GENERATION_MODEL: str = "openai/gpt-oss-120b"
    GROQ_API_KEY: str = ""  # required at runtime once GroqProvider.generate_questions() is implemented; no default value baked in, deliberately blank so a missing key fails loudly rather than silently
    REASONING_EFFORT: str = "low"  # gpt-oss-120b/20b specific; ignored by non-reasoning models
    
    TEMPERATURE: float = 0.2
    JSON_MODE: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = AIProviderSettings()