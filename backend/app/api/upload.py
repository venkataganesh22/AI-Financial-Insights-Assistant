import pandas as pd
from fastapi import APIRouter, UploadFile, File, Header, HTTPException, status
from typing import Optional, Dict, Any
from app.auth.auth import decode_access_token
from app.services.transaction_service import get_user_csv_path, load_user_transactions, calculate_dashboard_metrics

router = APIRouter(tags=["CSV Upload"])

def get_current_user_email(authorization: Optional[str] = Header(None)) -> str:
    """Extracts authenticated user email from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        # Fallback to demo account for unauthenticated demo upload testing
        return "student@example.com"
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return "student@example.com"
    return payload["sub"]

@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """
    Uploads transaction CSV file for authenticated user.
    Validates CSV format, cleans data, saves user file, and returns updated metrics.
    """
    user_email = get_current_user_email(authorization)

    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid CSV file (.csv)."
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded CSV file is empty."
            )

        # Write uploaded file to user's isolated directory
        csv_path = get_user_csv_path(user_email)
        with open(csv_path, "wb") as f:
            f.write(content)

        # Validate and clean data using transaction service
        df = load_user_transactions(user_email)
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV contains no valid transaction rows after parsing."
            )

        metrics = calculate_dashboard_metrics(df)

        return {
            "message": "CSV uploaded and analyzed successfully!",
            "filename": file.filename,
            "total_transactions": len(df),
            "metrics": metrics
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process CSV file: {str(e)}"
        )
