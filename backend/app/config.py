import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = BASE_DIR / "app"
DATA_DIR = APP_DIR / "data"
TRANSACTIONS_DIR = DATA_DIR / "transactions"
DOCUMENTS_DIR = DATA_DIR / "documents"
ROOT_DOCUMENTS_DIR = BASE_DIR.parent / "documents"
USERS_FILE = APP_DIR / "auth" / "users.json"
SAMPLE_DATA_FILE = BASE_DIR.parent / "sample_data" / "transactions.csv"

# Create directories if they do not exist
TRANSACTIONS_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Security and API keys
SECRET_KEY = os.getenv("SECRET_KEY", "finance-insights-super-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

# Gemini API Key (optional for LLM, graceful fallback available)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
