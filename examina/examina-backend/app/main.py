from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import subjects, materials

app = FastAPI(title="Examina API")

# Dev-only wide-open CORS. Tighten this before Month 4 deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subjects.router)
app.include_router(materials.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "backend"}