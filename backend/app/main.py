import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.api import auth, upload, analyze, chat
from app.rag.vector_store import global_vector_store
from app.auth.auth import load_users

app = FastAPI(
    title="AI-Powered Financial Insights Assistant",
    description="Personal finance analysis, KMeans spending clustering, ML overspending detection, and RAG chatbot API.",
    version="1.0.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to pre-seed demo users & initialize RAG vector store
@app.on_event("startup")
def startup_event():
    print("Initializing application users and RAG Vector Store...")
    load_users()
    global_vector_store.initialize()
    print("Startup complete.")

# Include API Routers
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(chat.router)

@app.get("/health")
def health_check():
    """Health check endpoint for Render deployment monitoring."""
    return {
        "status": "healthy",
        "app": "AI-Powered Financial Insights Assistant",
        "version": "1.0.0"
    }

# Check if static frontend build directory exists for single-service deployment
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
