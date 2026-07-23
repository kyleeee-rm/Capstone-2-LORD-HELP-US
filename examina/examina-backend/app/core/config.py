from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Overridden by docker-compose's `environment:` block for the backend
    # service in real runs — this default only matters if you run the app
    # outside Compose (e.g. a bare `uvicorn` for a quick script).
    DATABASE_URL: str = "postgresql+psycopg://examina:examina_dev_password@db:5432/examina"

    # No default on purpose — app should fail to boot rather than run with a
    # blank/guessable JWT secret.
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    REFRESH_COOKIE_NAME: str = "refresh_token"
    REFRESH_COOKIE_PATH: str = "/api/auth/refresh"

    # Browsers only treat http://localhost as a secure context, not a LAN IP
    # like http://192.168.x.x. Since this project needs real-phone testing
    # for the OMR scanning UI, keep this True by default (safe/production),
    # but let it be flipped to False via .env for a specific LAN-testing
    # session — never commit COOKIE_SECURE=false.
    COOKIE_SECURE: bool = True


settings = Settings()
