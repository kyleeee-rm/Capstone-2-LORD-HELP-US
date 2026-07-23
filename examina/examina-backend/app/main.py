from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.exceptions import AppError, app_error_handler
from app.routers import auth

app = FastAPI(title="Examina API")

app.add_exception_handler(AppError, app_error_handler)
app.include_router(auth.router)

# Dev-only wide-open CORS. Tighten this before Month 4 deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "backend"}