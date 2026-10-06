import json
import hashlib
import hmac
import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.config import USERS_FILE, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, TRANSACTIONS_DIR, SAMPLE_DATA_FILE

# Hash password using PBKDF2 with SHA256 (no external C library compiled dependencies needed, built-in python hashlib)
def hash_password(password: str, salt: bytes = None) -> str:
    """Hashes password securely with salt using PBKDF2 HMAC SHA256."""
    if salt is None:
        salt = os.urandom(16)
    hash_bytes = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + "$" + hash_bytes.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against stored salt$hash."""
    try:
        salt_hex, hash_hex = hashed_password.split("$")
        salt = bytes.fromhex(salt_hex)
        expected_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000).hex()
        return hmac.compare_digest(hash_hex, expected_hash)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a JWT access token for authenticated user."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def load_users() -> Dict[str, Dict[str, Any]]:
    """Loads users dictionary from users.json file."""
    if not USERS_FILE.parent.exists():
        USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        
    if not USERS_FILE.exists():
        users = {}
        # Pre-seed demo users
        demo_users = [
            {"id": "user_student", "name": "Student", "email": "student@example.com", "password": "Student@123"},
            {"id": "user_rahul", "name": "Rahul", "email": "rahul@example.com", "password": "Rahul@123"},
            {"id": "user_priya", "name": "Priya", "email": "priya@example.com", "password": "Priya@123"}
        ]
        for u in demo_users:
            users[u["email"].lower()] = {
                "id": u["id"],
                "name": u["name"],
                "email": u["email"].lower(),
                "password_hash": hash_password(u["password"])
            }
            # Pre-seed sample transactions for demo accounts
            user_dir = TRANSACTIONS_DIR / u["email"].lower().replace("@", "_").replace(".", "_")
            user_dir.mkdir(parents=True, exist_ok=True)
            user_csv = user_dir / "transactions.csv"
            if SAMPLE_DATA_FILE.exists() and not user_csv.exists():
                user_csv.write_bytes(SAMPLE_DATA_FILE.read_bytes())
                
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2)
        return users
    
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_users(users: Dict[str, Dict[str, Any]]):
    """Saves users dictionary to users.json file."""
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

def sanitize_email_for_folder(email: str) -> str:
    """Converts email into safe directory name."""
    return email.lower().strip().replace("@", "_").replace(".", "_")
