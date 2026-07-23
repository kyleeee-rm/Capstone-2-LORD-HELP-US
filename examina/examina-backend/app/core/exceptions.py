from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Raise this anywhere in a route to produce a contract-shaped error:
    {"error": "...", "message": "...", "details": {...}}

    FastAPI's default HTTPException wraps everything in {"detail": ...},
    which does NOT match API_CONTRACT-1.md's error shape — that's why this
    exists instead of just using HTTPException everywhere.
    """

    def __init__(self, status_code: int, error: str, message: str, details: dict | None = None):
        self.status_code = status_code
        self.error = error
        self.message = message
        self.details = details or {}


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.error, "message": exc.message, "details": exc.details},
    )
