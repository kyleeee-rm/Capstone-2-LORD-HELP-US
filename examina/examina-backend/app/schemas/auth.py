import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    # NOTE: no min_length constraint here on purpose. The contract defines a
    # specific `400 weak_password` error — if we let Pydantic reject short
    # passwords, FastAPI returns a 422 in its own error shape instead, which
    # breaks the contract. The length check happens in the route handler
    # instead, so it can raise AppError(400, "weak_password", ...).
    password: str = Field(min_length=1, max_length=256)
    first_name: str = Field(min_length=1, max_length=128)
    last_name: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str

    model_config = {"from_attributes": True}


class RegisterResponse(UserOut):
    created_at: datetime


class LoginRequest(BaseModel):
    username: str
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
