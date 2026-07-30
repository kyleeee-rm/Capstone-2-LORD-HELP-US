import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHash, VerifyMismatchError

from app.core.config import settings

_ph = PasswordHasher()  # sane defaults: time_cost=3, memory_cost=64MB, parallelism=4


# ---------------------------------------------------------------------------
# Passwords (argon2id) — slow-by-design, for low-entropy user secrets.
# ---------------------------------------------------------------------------

def hash_password(raw_password: str) -> str:
    return _ph.hash(raw_password)


def verify_password(raw_password: str, hashed_password: str) -> bool:
    try:
        return _ph.verify(hashed_password, raw_password)
    except (VerifyMismatchError, InvalidHash):
        return False


def needs_rehash(hashed_password: str) -> bool:
    """Call this after a successful login. If True, re-hash the raw password
    and save it — lets you bump argon2 cost params later without forcing a
    mass password reset."""
    return _ph.check_needs_rehash(hashed_password)


# ---------------------------------------------------------------------------
# Access tokens — stateless JWT, short-lived (15 min), never stored server-side.
# ---------------------------------------------------------------------------

def create_access_token(user_id) -> tuple[str, int]:
    expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expires_in


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("wrong token type")
    return payload


# ---------------------------------------------------------------------------
# Refresh tokens — opaque random string, DB-backed, 30-day sliding expiry,
# rotated on every use. High entropy already, so a fast hash (not argon2) is
# correct here — this just protects the DB row if it ever leaks, the same way
# you'd hash an API key rather than a password.
# ---------------------------------------------------------------------------

def generate_raw_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
