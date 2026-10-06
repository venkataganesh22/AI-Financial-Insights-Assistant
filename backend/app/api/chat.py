from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.auth.auth import decode_access_token
from app.services.chatbot_service import handle_chat_message

router = APIRouter(tags=["Chatbot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    type: str
    sources: Optional[List[str]] = None
    disclaimer: str

def get_current_user_email(authorization: Optional[str] = Header(None)) -> str:
    """Extracts authenticated user email from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        return "student@example.com"
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return "student@example.com"
    return payload["sub"]

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(
    payload: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Main chat endpoint handling personal spending queries and general RAG financial questions.
    """
    if not payload.message or not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat message cannot be empty."
        )

    user_email = get_current_user_email(authorization)
    result = handle_chat_message(user_email, payload.message.strip())

    return {
        "response": result["response"],
        "type": result["type"],
        "sources": result.get("sources"),
        "disclaimer": result.get("disclaimer", "This application provides educational financial insights and is not a substitute for professional financial advice.")
    }
