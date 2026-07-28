from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SubjectCreate(BaseModel):
    subject_code: str
    subject_name: str
    course: str
    section: str
    semester: str
    academic_year: str


class SubjectUpdate(BaseModel):
    subject_code: str | None = None
    subject_name: str | None = None
    course: str | None = None
    section: str | None = None
    semester: str | None = None
    academic_year: str | None = None


class SubjectResponse(BaseModel):
    subject_id: UUID
    faculty_id: UUID
    subject_code: str
    subject_name: str
    course: str
    section: str
    semester: str
    academic_year: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)