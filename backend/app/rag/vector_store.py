import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.rag.document_loader import load_and_split_documents

class SimpleVectorStore:
    """
    Lightweight, high-performance in-memory Vector Store using TF-IDF + Cosine Similarity.
    Requires zero heavy external DBs (no Chroma/FAISS binary dependency issues on Render).
    """
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        self.tfidf_matrix = None
        self.is_initialized = False

    def initialize(self):
        """Loads documents and builds vector index."""
        self.chunks = load_and_split_documents()
        if not self.chunks:
            self.is_initialized = False
            return

        texts = [c["text"] for c in self.chunks]
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)
        self.is_initialized = True

    def similarity_search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Finds top_k most relevant document chunks for the query."""
        if not self.is_initialized or self.tfidf_matrix is None or not self.chunks:
            self.initialize()
            if not self.is_initialized:
                return []

        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            if scores[idx] > 0.05: # Minimal relevance threshold
                chunk = self.chunks[idx].copy()
                chunk["score"] = float(scores[idx])
                results.append(chunk)

        return results

# Singleton vector store instance
global_vector_store = SimpleVectorStore()
