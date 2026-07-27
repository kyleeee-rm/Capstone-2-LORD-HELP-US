from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SubjectFolderBase(BaseModel):
    folder_name: str
    description: str | None = None


class SubjectFolderCreate(SubjectFolderBase):
    subject_id: UUID


class SubjectFolderUpdate(BaseModel):
    folder_name: str | None = None
    description: str | None = None


class SubjectFolderResponse(SubjectFolderBase):
    folder_id: UUID
    subject_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)