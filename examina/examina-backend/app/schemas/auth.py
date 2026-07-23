import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    # CHANGED: replaces `username: str`. Now the login identity per ERD.
    email: EmailStr
    # NOTE: no min_length constraint here on purpose - see note in
    # routers/auth.py's register(). Pydantic rejecting short passwords would
    # produce a 422 in FastAPI's default shape, not the contract's
    # `400 weak_password` shape.
    password: str = Field(min_length=1, max_length=256)
    first_name: str = Field(min_length=1, max_length=128)
    last_name: str = Field(min_length=1, max_length=128)
    # role/status intentionally NOT accepted here - server-assigned defaults
    # only. Letting registration set its own role/status would be a
    # privilege-escalation bug.


class UserOut(BaseModel):
    # CHANGED: from_attributes lets this build from an ORM object;
    # populate_by_name + validation_alias lets the API keep a stable `id`
    # field even though the DB column is now `faculty_id`, so the API
    # contract doesn't have to change again if the PK name ever moves.
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID = Field(validation_alias="faculty_id")
    email: EmailStr
    first_name: str
    last_name: str


class RegisterResponse(UserOut):
    created_at: datetime


class LoginRequest(BaseModel):
    # CHANGED: replaces `username: str`
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class MessageResponse(BaseModel):
    message: str
