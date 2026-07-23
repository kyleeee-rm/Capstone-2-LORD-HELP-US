import jwt
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise AppError(401, "unauthorized", "Missing or malformed Authorization header.")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise AppError(401, "unauthorized", "Access token expired.")
    except jwt.InvalidTokenError:
        raise AppError(401, "unauthorized", "Invalid access token.")

    user = db.get(User, payload["sub"])
    if user is None:
        raise AppError(401, "unauthorized", "User no longer exists.")

    return user
