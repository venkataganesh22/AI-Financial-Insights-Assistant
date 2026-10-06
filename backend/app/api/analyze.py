from fastapi import APIRouter, Header
from typing import Optional, Dict, Any
from app.auth.auth import decode_access_token
from app.services.transaction_service import load_user_transactions, calculate_dashboard_metrics
from app.ml.analysis import generate_financial_insights

router = APIRouter(tags=["Analysis & Dashboard"])

def get_current_user_email(authorization: Optional[str] = Header(None)) -> str:
    """Extracts authenticated user email from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        return "student@example.com"
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return "student@example.com"
    return payload["sub"]

@router.get("/dashboard")
def get_dashboard(authorization: Optional[str] = Header(None)):
    """Returns summary financial dashboard metrics for logged-in user."""
    user_email = get_current_user_email(authorization)
    df = load_user_transactions(user_email)
    metrics = calculate_dashboard_metrics(df)
    return {
        "user_email": user_email,
        "metrics": metrics
    }

@router.get("/analyze")
def get_analysis(authorization: Optional[str] = Header(None)):
    """Returns detailed financial analysis including KMeans persona, overspending ML, and bullet insights."""
    user_email = get_current_user_email(authorization)
    df = load_user_transactions(user_email)
    insights = generate_financial_insights(df)
    return insights
