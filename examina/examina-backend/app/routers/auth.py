from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppError
from app.core.security import (
    create_access_token,
    generate_raw_refresh_token,
    hash_password,
    hash_refresh_token,
    needs_rehash,
    refresh_token_expiry,
    verify_password,
)
from app.db.session import get_db
from app.deps import get_current_user
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        path=settings.REFRESH_COOKIE_PATH,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )


def _issue_refresh_token(db: Session, user_id, response: Response) -> RefreshToken:
    raw = generate_raw_refresh_token()
    row = RefreshToken(
        user_id=user_id,
        token_hash=hash_refresh_token(raw),
        expires_at=refresh_token_expiry(),
    )
    db.add(row)
    db.flush()  # populate row.id without committing yet — caller commits
    _set_refresh_cookie(response, raw)
    return row


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise AppError(400, "weak_password", "Password must be at least 8 characters.")

    existing = db.scalar(select(User).where(User.username == payload.username))
    if existing is not None:
        raise AppError(400, "username_taken", "That username is already registered.")

    user = User(
        username=payload.username,
        first_name=payload.first_name,
        last_name=payload.last_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == payload.username))

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise AppError(401, "invalid_credentials", "Incorrect username or password.")

    if needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(payload.password)

    access_token, expires_in = create_access_token(user.id)
    _issue_refresh_token(db, user.id, response)
    db.commit()

    return LoginResponse(
        access_token=access_token,
        expires_in=expires_in,
        user=UserOut.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not raw_token:
        raise AppError(401, "invalid_refresh_token", "No refresh token cookie present.")

    token_hash = hash_refresh_token(raw_token)
    row = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))

    if row is None:
        raise AppError(401, "invalid_refresh_token", "Refresh token not recognized.")

    now = datetime.now(timezone.utc)

    if row.revoked_at is not None:
        # This exact token was already rotated away once. Seeing it again means
        # someone (attacker or a stale second device) is replaying an old
        # refresh token — treat it as compromise and kill every active session
        # for this user, not just this one.
        db.query(RefreshToken).filter(
            RefreshToken.user_id == row.user_id,
            RefreshToken.revoked_at.is_(None),
        ).update({"revoked_at": now})
        db.commit()
        response.delete_cookie(settings.REFRESH_COOKIE_NAME, path=settings.REFRESH_COOKIE_PATH)
        raise AppError(401, "refresh_token_expired", "Refresh token has been revoked. Please log in again.")

    if row.expires_at < now:
        raise AppError(401, "refresh_token_expired", "Refresh token has expired.")

    user = db.get(User, row.user_id)
    if user is None:
        raise AppError(401, "invalid_refresh_token", "User no longer exists.")

    # Rotate: this token is now spent, a new one takes over with a fresh
    # 30-day window — this is what gives you "30 days of inactivity" logout
    # rather than a hard 30-day cliff from original login.
    new_row = _issue_refresh_token(db, user.id, response)
    row.revoked_at = now
    row.replaced_by_id = new_row.id
    db.commit()

    access_token, expires_in = create_access_token(user.id)
    return TokenResponse(access_token=access_token, expires_in=expires_in)


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    raw_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if raw_token:
        token_hash = hash_refresh_token(raw_token)
        row = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        if row is not None and row.revoked_at is None:
            row.revoked_at = datetime.now(timezone.utc)
            db.commit()

    response.delete_cookie(settings.REFRESH_COOKIE_NAME, path=settings.REFRESH_COOKIE_PATH)
    return MessageResponse(message="Logged out successfully.")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
