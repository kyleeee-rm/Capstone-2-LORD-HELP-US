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
from app.models.faculty import Faculty  # CHANGED: was app.models.user import User
from app.models.refresh_token import RefreshToken
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


def _issue_refresh_token(db: Session, faculty_id, response: Response) -> RefreshToken:
    # CHANGED: param renamed user_id -> faculty_id; RefreshToken.faculty_id
    # instead of RefreshToken.user_id
    raw = generate_raw_refresh_token()
    row = RefreshToken(
        faculty_id=faculty_id,
        token_hash=hash_refresh_token(raw),
        expires_at=refresh_token_expiry(),
    )
    db.add(row)
    db.flush()  # populate row.id without committing yet - caller commits
    _set_refresh_cookie(response, raw)
    return row


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise AppError(400, "weak_password", "Password must be at least 8 characters.")

    # CHANGED: lookup by email, was username. Error code email_taken, was
    # username_taken - update API_CONTRACT-1.md to match.
    existing = db.scalar(select(Faculty).where(Faculty.email == payload.email))
    if existing is not None:
        raise AppError(400, "email_taken", "That email is already registered.")

    # CHANGED: Faculty(...) was User(...). password_hash field name changed
    # (was hashed_password). role/status NOT taken from payload - always
    # server-assigned defaults (see Faculty model: role="faculty",
    # status="active").
    faculty = Faculty(
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        password_hash=hash_password(payload.password),
    )
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return faculty


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    # CHANGED: lookup by email, was username.
    faculty = db.scalar(select(Faculty).where(Faculty.email == payload.email))

    if faculty is None or not verify_password(payload.password, faculty.password_hash):
        raise AppError(401, "invalid_credentials", "Incorrect email or password.")

    # TODO(status-check): team decided NOT to enforce `faculty.status` at
    # login yet (column exists, defaults to "active", nothing rejects
    # "inactive"/"suspended" today). When there's an actual reason to
    # deactivate an account (e.g. an admin panel), add here:
    #
    #   if faculty.status != "active":
    #       raise AppError(403, "account_inactive", "This account is not active.")
    #
    # This also needs a new error code added to API_CONTRACT-1.md when it
    # lands - it's not documented there yet.

    if needs_rehash(faculty.password_hash):
        faculty.password_hash = hash_password(payload.password)

    access_token, expires_in = create_access_token(faculty.faculty_id)
    _issue_refresh_token(db, faculty.faculty_id, response)
    db.commit()

    return LoginResponse(
        access_token=access_token,
        expires_in=expires_in,
        user=UserOut.model_validate(faculty),
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
        # CHANGED: filter on RefreshToken.faculty_id, was RefreshToken.user_id
        db.query(RefreshToken).filter(
            RefreshToken.faculty_id == row.faculty_id,
            RefreshToken.revoked_at.is_(None),
        ).update({"revoked_at": now})
        db.commit()
        response.delete_cookie(settings.REFRESH_COOKIE_NAME, path=settings.REFRESH_COOKIE_PATH)
        raise AppError(401, "refresh_token_expired", "Refresh token has been revoked. Please log in again.")

    if row.expires_at < now:
        raise AppError(401, "refresh_token_expired", "Refresh token has expired.")

    # CHANGED: db.get(Faculty, row.faculty_id) - was db.get(User, row.user_id)
    faculty = db.get(Faculty, row.faculty_id)
    if faculty is None:
        raise AppError(401, "invalid_refresh_token", "User no longer exists.")

    new_row = _issue_refresh_token(db, faculty.faculty_id, response)
    row.revoked_at = now
    row.replaced_by_id = new_row.id
    db.commit()

    access_token, expires_in = create_access_token(faculty.faculty_id)
    return TokenResponse(access_token=access_token, expires_in=expires_in)


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),  # CHANGED: type was User
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
def me(current_user: Faculty = Depends(get_current_user)):  # CHANGED: type was User
    return current_user
