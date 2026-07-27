from fastapi import APIRouter
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/subjects", tags=["subjects"])

subjects_db: dict[str, dict] = {}


class SubjectCreate(BaseModel):
    name: str


@router.get("")
def list_subjects():
    return list(subjects_db.values())


@router.post("")
def create_subject(payload: SubjectCreate):
    subject_id = str(uuid.uuid4())
    subject = {"id": subject_id, "name": payload.name}
    subjects_db[subject_id] = subject
    return subject


@router.get("/{subject_id}")
def get_subject(subject_id: str):
    subject = subjects_db.get(subject_id)
    if not subject:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject
