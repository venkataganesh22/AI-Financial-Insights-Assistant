from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any
from app.auth.auth import (
    load_users, save_users, verify_password, hash_password,
    create_access_token, decode_access_token, sanitize_email_for_folder
)
from app.config import TRANSACTIONS_DIR, SAMPLE_DATA_FILE

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    """Authenticates user and returns JWT token."""
    email = payload.email.lower().strip()
    users = load_users()

    if email not in users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user = users[email]
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(data={"sub": user["email"], "name": user["name"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest):
    """Registers new user, hashes password, initializes isolated folder."""
    email = payload.email.lower().strip()
    users = load_users()

    if email in users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    user_id = f"user_{len(users) + 1}"
    hashed_pwd = hash_password(payload.password)

    new_user = {
        "id": user_id,
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hashed_pwd
    }

    users[email] = new_user
    save_users(users)

    # Initialize isolated transaction directory & seed with sample CSV
    folder = sanitize_email_for_folder(email)
    user_dir = TRANSACTIONS_DIR / folder
    user_dir.mkdir(parents=True, exist_ok=True)
    user_csv = user_dir / "transactions.csv"
    if SAMPLE_DATA_FILE.exists() and not user_csv.exists():
        user_csv.write_bytes(SAMPLE_DATA_FILE.read_bytes())

    token = create_access_token(data={"sub": email, "name": payload.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": payload.name,
            "email": email
        }
    }
