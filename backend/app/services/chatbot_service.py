import re
import pandas as pd
from typing import Dict, Any
from app.services.transaction_service import load_user_transactions, calculate_dashboard_metrics
from app.ml.analysis import generate_financial_insights
from app.rag.rag_pipeline import query_rag_pipeline

def classify_query(query: str) -> str:
    """
    Classifies user prompt into query categories:
    A. PERSONAL_TRANSACTION_QUERY
    B. GENERAL_FINANCE_QUERY
    C. UNKNOWN
    """
    q_lower = query.lower().strip()

    # Personal transaction keywords
    personal_keywords = [
        'my spend', 'my spending', 'i spend', 'did i spend', 'my expense', 'my expenses',
        'my income', 'my salary', 'my saving', 'my savings', 'largest expense', 'biggest expense',
        'swiggy', 'zomato', 'uber', 'ola', 'amazon', 'flipkart', 'dmart', 'blinkit', 'zepto',
        'food', 'rent', 'shopping', 'bills', 'transport', 'entertainment',
        'why are my expenses', 'overspend', 'how much did i', 'my total', 'how much did i save',
        'analyze my', 'my cluster', 'my pattern'
    ]

    # General personal finance educational keywords
    general_keywords = [
        'what is', 'explain', 'how does', 'difference between', 'definition of',
        'sip', 'mutual fund', 'index fund', 'emergency fund', 'fd', 'fixed deposit',
        'ppf', 'epf', 'nps', 'inflation', 'tax', 'income tax', '50/30/20',
        'budgeting', 'itr', 'investing', 'credit card'
    ]

    for kw in personal_keywords:
        if kw in q_lower:
            return "PERSONAL_TRANSACTION_QUERY"

    for kw in general_keywords:
        if kw in q_lower:
            return "GENERAL_FINANCE_QUERY"

    return "UNKNOWN"

def handle_chat_message(user_email: str, message: str) -> Dict[str, Any]:
    """
    Main chatbot handler that routes user queries to Pandas/ML engine or RAG pipeline.
    """
    query_type = classify_query(message)
    df = load_user_transactions(user_email)

    if query_type == "PERSONAL_TRANSACTION_QUERY":
        response_text = process_personal_transaction_query(df, message)
        return {
            "response": response_text,
            "type": "transaction",
            "disclaimer": "This application provides educational financial insights and is not a substitute for professional financial advice."
        }

    elif query_type == "GENERAL_FINANCE_QUERY":
        rag_res = query_rag_pipeline(message)
        return {
            "response": rag_res["answer"],
            "type": "rag",
            "sources": rag_res["sources"],
            "disclaimer": rag_res["disclaimer"]
        }

    else:
        # Default helpful assistant response
        return {
            "response": "Hello! I am your AI Financial Insights Assistant. You can ask me about your personal spending (e.g., 'How much did I spend on Swiggy?', 'What is my savings rate?') or general Indian personal finance topics (e.g., 'What is an emergency fund?', 'What is SIP?').",
            "type": "general",
            "disclaimer": "This application provides educational financial insights and is not a substitute for professional financial advice."
        }

def process_personal_transaction_query(df: pd.DataFrame, query: str) -> str:
    """Answers user's specific questions regarding their transaction CSV using pandas and ML insights."""
    if df.empty:
        return "No transaction records found. Please upload your transaction CSV file to analyze your spending."

    q_lower = query.lower()
    metrics = calculate_dashboard_metrics(df)
    insights_res = generate_financial_insights(df)

    expense_df = df[df['type'] == 'expense']

    # Specific merchant check (e.g., Swiggy, Zomato, Uber, Amazon)
    for merchant in ['swiggy', 'zomato', 'uber', 'ola', 'amazon', 'flipkart', 'dmart', 'blinkit', 'zepto', 'croma', 'airtel', 'jio']:
        if merchant in q_lower:
            m_df = expense_df[expense_df['description'].str.lower().str.contains(merchant)]
            total = m_df['amount'].sum()
            count = len(m_df)
            if count > 0:
                return f"You spent ₹{total:,.2f} across {count} transactions on {merchant.capitalize()}."
            else:
                return f"You have no recorded transactions for {merchant.capitalize()} in your CSV."

    # Specific category check
    for cat in ['food', 'shopping', 'transport', 'bills', 'rent', 'entertainment', 'healthcare', 'investment']:
        if cat in q_lower:
            c_df = expense_df[expense_df['category'].str.lower() == cat]
            total = c_df['amount'].sum()
            pct = round((total / metrics['total_expenses'] * 100), 1) if metrics['total_expenses'] > 0 else 0
            return f"You spent ₹{total:,.2f} on {cat.capitalize()} ({pct}% of your total expenses)."

    # Savings query
    if 'save' in q_lower or 'savings' in q_lower:
        return f"Your total net savings is ₹{metrics['net_savings']:,.2f}, representing a savings rate of {metrics['savings_rate']}% of your income."

    # Largest expense query
    if 'largest' in q_lower or 'biggest' in q_lower or 'most' in q_lower:
        return f"Your largest spending category is {metrics['largest_category']} at ₹{metrics['largest_category_amount']:,.2f}."

    # Overspending query
    if 'overspend' in q_lower or 'too much' in q_lower or 'high' in q_lower:
        over_count = insights_res['overspending']['overspending_count']
        if over_count > 0:
            top_over = insights_res['overspending']['flagged_transactions'][0]
            return f"ML Overspending detector flagged {over_count} high transactions. Example: {top_over['reason']}"
        else:
            return f"No major overspending anomalies detected. Your top category is {metrics['largest_category']}."

    # General spending summary fallback
    return f"Summary of your finances: Total Income ₹{metrics['total_income']:,.2f}, Total Expenses ₹{metrics['total_expenses']:,.2f}, Net Savings ₹{metrics['net_savings']:,.2f} (Savings Rate: {metrics['savings_rate']}%). Cluster profile: {insights_res['cluster']['cluster_name']}."
