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
    GENERATION_MODEL: str = "llama-3.3-70b-versatile"

    TEMPERATURE: float = 0.2
    JSON_MODE: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = AIProviderSettings()