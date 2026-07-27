import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MaterialUploadResponse(BaseModel):
    """Response for POST /subjects/{subject_id}/materials — matches
    API_CONTRACT-1.md's Week 3 shape. Field names on the wire (filename,
    status) intentionally differ from the DB column names (file_name,
    upload_status) - validation_alias bridges that without the contract
    needing to know or care about internal naming."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID = Field(validation_alias="material_id")
    subject_id: uuid.UUID
    filename: str = Field(validation_alias="file_name")
    lesson_label: str | None = None
    title: str
    description: str
    teaching_hours: Decimal
    status: str = Field(validation_alias="upload_status")
    uploaded_at: datetime


class MaterialListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID = Field(validation_alias="material_id")
    filename: str = Field(validation_alias="file_name")
    lesson_label: str | None = None
    status: str = Field(validation_alias="upload_status")
    # Always 0 until Week 4's MaterialChunks table exists to count against.
    chunk_count: int = 0
    uploaded_at: datetime


class MaterialListResponse(BaseModel):
    materials: list[MaterialListItem]


class MaterialStatusResponse(BaseModel):
    """Response for the polling endpoint. progress_pct is a rough stepped
    estimate (see STATUS_PROGRESS in routers/materials.py) - contract shows
    it as an example value, not an exact formula, so this is a reasonable
    placeholder until Week 4 gives us something real to compute against."""

    id: uuid.UUID
    status: str
    progress_pct: int
