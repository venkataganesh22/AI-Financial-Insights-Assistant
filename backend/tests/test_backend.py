import os
import pytest
import pandas as pd
from app.auth.auth import load_users, hash_password, verify_password
from app.services.transaction_service import calculate_dashboard_metrics, load_user_transactions
from app.ml.clustering import analyze_spending_clusters
from app.ml.overspending import detect_overspending
from app.services.chatbot_service import classify_query, handle_chat_message

def test_auth_hashing():
    pwd = "Student@123"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_user_loading():
    users = load_users()
    assert "student@example.com" in users
    assert "rahul@example.com" in users
    assert "priya@example.com" in users

def test_transaction_metrics():
    df = load_user_transactions("student@example.com")
    assert not df.empty
    metrics = calculate_dashboard_metrics(df)
    assert metrics["total_income"] >= 0
    assert metrics["total_expenses"] >= 0
    assert "savings_rate" in metrics

def test_kmeans_clustering():
    df = load_user_transactions("student@example.com")
    clusters = analyze_spending_clusters(df)
    assert "cluster_name" in clusters
    assert len(clusters["cluster_profiles"]) == 4

def test_overspending_detection():
    df = load_user_transactions("student@example.com")
    over = detect_overspending(df)
    assert "flagged_transactions" in over
    assert "disclaimer" in over

def test_query_router():
    assert classify_query("How much did I spend on Swiggy?") == "PERSONAL_TRANSACTION_QUERY"
    assert classify_query("What is an emergency fund?") == "GENERAL_FINANCE_QUERY"
    assert classify_query("Hello there") == "UNKNOWN"

def test_chatbot_service():
    res = handle_chat_message("student@example.com", "What is an emergency fund?")
    assert res["type"] == "rag"
    assert "emergency" in res["response"].lower() or "fund" in res["response"].lower()
