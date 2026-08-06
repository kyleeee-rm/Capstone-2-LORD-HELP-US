from pydantic_settings import BaseSettings


class AIProviderSettings(BaseSettings):
    """Reads AI provider config from env. This is the ONLY file allowed to
    know provider/model names or embedding dimensions — see
    AI_PROVIDER_ABSTRACTION.md. Everything outside ai_provider/ must go
    through the functions in __init__.py instead.
    """

    AI_PROVIDER: str = "local"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = AIProviderSettings()