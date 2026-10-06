import requests
from typing import Dict, Any, List
from app.config import GEMINI_API_KEY
from app.rag.vector_store import global_vector_store

def query_rag_pipeline(user_query: str) -> Dict[str, Any]:
    """
    RAG pipeline retrieving Indian financial knowledge chunks and synthesizing response using Gemini AI
    or structured educational fallback.
    """
    retrieved_chunks = global_vector_store.similarity_search(user_query, top_k=3)
    
    if not retrieved_chunks:
        return {
            "answer": "I couldn't find specific documentation covering this personal finance topic. However, a good starting principle is to maintain an emergency fund (3-6 months of expenses) and automate monthly savings via SIP.",
            "sources": [],
            "disclaimer": "This application provides educational financial insights and is not a substitute for professional financial advice."
        }

    sources = list(set([c["source"] for c in retrieved_chunks]))
    context_str = "\n\n".join([f"Source: {c['source']}\n{c['text']}" for c in retrieved_chunks])

    # If GEMINI_API_KEY is configured, call Gemini API
    ai_answer = None
    if GEMINI_API_KEY:
        try:
            prompt = f"""You are an educational AI Financial Assistant for Indian users. 
Answer the user's question clearly, concisely, and accurately based ONLY on the provided reference context.
Do NOT give personalized financial advice or guarantee specific returns.

Context:
{context_str}

User Question: {user_query}

Answer in simple markdown format:"""

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                data = res.json()
                ai_answer = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            print(f"Gemini API call error: {e}")

    # Fallback generator if Gemini API key is missing or offline
    if not ai_answer:
        # Create clear synthesis from retrieved chunks
        best_chunk = retrieved_chunks[0]
        secondary_text = f"\n\nAdditional details:\n{retrieved_chunks[1]['text']}" if len(retrieved_chunks) > 1 else ""
        ai_answer = f"{best_chunk['text']}{secondary_text}"

    # Format final sources block
    sources_text = "\n\n*Sources used:*\n" + "\n".join([f"- {s}" for s in sources])
    full_response = f"{ai_answer}{sources_text}"

    return {
        "answer": full_response,
        "sources": sources,
        "disclaimer": "This application provides educational financial insights and is not a substitute for professional financial advice."
    }
