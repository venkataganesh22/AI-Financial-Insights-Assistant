import os
from pathlib import Path
from typing import List, Dict, Any
from app.config import DOCUMENTS_DIR, ROOT_DOCUMENTS_DIR

def load_and_split_documents(chunk_size: int = 500, chunk_overlap: int = 100) -> List[Dict[str, Any]]:
    """
    Loads all .txt financial educational documents and splits them into clean text chunks with metadata.
    """
    docs_paths = []
    
    # Search in app data directory and root documents directory
    for folder in [DOCUMENTS_DIR, ROOT_DOCUMENTS_DIR]:
        if folder.exists():
            for file in folder.glob("*.txt"):
                docs_paths.append(file)

    # Deduplicate by filename
    seen_names = set()
    unique_paths = []
    for p in docs_paths:
        if p.name not in seen_names:
            seen_names.add(p.name)
            unique_paths.append(p)

    chunks = []
    for filepath in unique_paths:
        try:
            content = filepath.read_text(encoding="utf-8")
            title = filepath.stem.replace("_", " ").title()
            
            # Simple text splitter algorithm
            paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
            for idx, p in enumerate(paragraphs):
                chunks.append({
                    "id": f"{filepath.stem}_{idx}",
                    "text": p,
                    "source": title,
                    "filename": filepath.name
                })
        except Exception as e:
            print(f"Error reading {filepath}: {e}")

    return chunks
