import jwt
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.faculty import Faculty  # CHANGED: was app.models.user import User


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Faculty:  # CHANGED: return type was User
    if not authorization or not authorization.startswith("Bearer "):
        raise AppError(401, "unauthorized", "Missing or malformed Authorization header.")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise AppError(401, "unauthorized", "Access token expired.")
    except jwt.InvalidTokenError:
        raise AppError(401, "unauthorized", "Invalid access token.")

    # CHANGED: db.get(Faculty, ...) - was db.get(User, ...). Works the same
    # way regardless of PK column name; db.get() looks up by primary key.
    faculty = db.get(Faculty, payload["sub"])
    if faculty is None:
        raise AppError(401, "unauthorized", "User no longer exists.")

    return faculty
