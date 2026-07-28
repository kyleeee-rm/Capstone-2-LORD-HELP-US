from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.exceptions import AppError, app_error_handler
from app.routers import auth, subject, subject_folder, materials

app = FastAPI(title="Examina API")

app.add_exception_handler(AppError, app_error_handler)
app.include_router(auth.router)
app.include_router(subject.router)
app.include_router(subject_folder.router)
app.include_router(materials.router)

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
