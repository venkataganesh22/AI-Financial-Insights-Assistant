import re
import requests
import pandas as pd
from typing import Dict, Any, List
from app.config import GEMINI_API_KEY
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
        'my income', 'my salary', 'my saving', 'my savings', 'largest', 'biggest', 'top',
        'swiggy', 'zomato', 'uber', 'ola', 'amazon', 'flipkart', 'dmart', 'blinkit', 'zepto',
        'food', 'rent', 'shopping', 'bills', 'transport', 'entertainment', 'when', 'date',
        'why are my expenses', 'overspend', 'how much did i', 'my total', 'how much did i save',
        'analyze my', 'my cluster', 'my pattern', 'highest', 'this month', 'recent', 'breakdown',
        'where did my money go', 'which category', 'outflow', 'transactions'
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
    Main chatbot handler routing user queries to transaction analyzer or RAG pipeline.
    """
    query_type = classify_query(message)
    df = load_user_transactions(user_email)

    if query_type == "PERSONAL_TRANSACTION_QUERY" or (not df.empty and ("spend" in message.lower() or "transaction" in message.lower() or "swiggy" in message.lower() or "top" in message.lower() or "when" in message.lower())):
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
            "response": "Hello! I am your AI Financial Insights Assistant. You can ask me about your personal spending (e.g., 'What are my top 3 spendings?', 'When did I make transactions to Swiggy?', 'How much did I spend on Food?') or general finance topics (e.g., 'What is an emergency fund?', 'What is SIP?').",
            "type": "general",
            "disclaimer": "This application provides educational financial insights and is not a substitute for professional financial advice."
        }

def process_personal_transaction_query(df: pd.DataFrame, query: str) -> str:
    """Answers user's specific questions regarding their transaction CSV using Pandas & Gemini AI."""
    if df.empty:
        return "No transaction records found. Please upload your transaction CSV file to analyze your spending."

    q_lower = query.lower().strip()
    metrics = calculate_dashboard_metrics(df)
    insights_res = generate_financial_insights(df)
    expense_df = df[df['type'] == 'expense'].copy()

    # 1. Check for Top / Largest / Highest spendings query
    if any(k in q_lower for k in ['top', 'largest', 'biggest', 'highest', 'most expensive', 'most spent', 'major']):
        if not expense_df.empty:
            top_txs = expense_df.sort_values(by='amount', ascending=False).head(5)
            rows_formatted = []
            for _, r in top_txs.iterrows():
                rows_formatted.append(f"- **₹{r['amount']:,.2f}** on *{r['description']}* ({r['category']}) on **{r['date']}**")
            
            summary = f"### Top 5 Highest Transactions\n" + "\n".join(rows_formatted)
            summary += f"\n\n*Largest overall category*: **{metrics['largest_category']}** (₹{metrics['largest_category_amount']:,.2f})"
            return summary

    # 2. Dynamic Merchant Check (matches any merchant in dataset or query)
    unique_descriptions = expense_df['description'].unique() if not expense_df.empty else []
    matched_merchant = None

    for desc in unique_descriptions:
        if str(desc).lower() in q_lower or (len(str(desc)) > 3 and str(desc).lower() in q_lower):
            matched_merchant = str(desc)
            break

    if not matched_merchant:
        for m in ['swiggy', 'zomato', 'uber', 'ola', 'amazon', 'flipkart', 'dmart', 'blinkit', 'zepto', 'croma', 'airtel', 'jio', 'rent', 'groceries', 'utilities']:
            if m in q_lower:
                matched_merchant = m
                break

    if matched_merchant:
        m_df = expense_df[expense_df['description'].str.lower().str.contains(matched_merchant.lower())]
        if m_df.empty and 'category' in expense_df.columns:
            m_df = expense_df[expense_df['category'].str.lower().str.contains(matched_merchant.lower())]
            
        count = len(m_df)
        if count > 0:
            total = m_df['amount'].sum()
            tx_details = []
            for _, r in m_df.iterrows():
                tx_details.append(f"- **{r['date']}**: ₹{r['amount']:,.2f} (*{r['description']}*)")
            
            tx_str = "\n".join(tx_details)
            return f"### {matched_merchant.capitalize()} Transactions ({count} found)\nTotal Spent: **₹{total:,.2f}**\n\n**Transaction Dates & Breakdown:**\n{tx_str}"
        else:
            return f"You have no recorded transactions for **{matched_merchant.capitalize()}** in your uploaded CSV."

    # 3. Dynamic Category Check
    unique_categories = expense_df['category'].unique() if not expense_df.empty else []
    matched_category = None
    for cat in unique_categories:
        if str(cat).lower() in q_lower:
            matched_category = str(cat)
            break

    if not matched_category:
        for c in ['food', 'shopping', 'transport', 'bills', 'rent', 'entertainment', 'healthcare', 'investment', 'utilities', 'groceries']:
            if c in q_lower:
                matched_category = c
                break

    if matched_category:
        c_df = expense_df[expense_df['category'].str.lower().str.contains(matched_category.lower())]
        count = len(c_df)
        total = c_df['amount'].sum()
        pct = round((total / metrics['total_expenses'] * 100), 1) if metrics['total_expenses'] > 0 else 0
        
        tx_details = []
        for _, r in c_df.head(5).iterrows():
            tx_details.append(f"- **{r['date']}**: ₹{r['amount']:,.2f} (*{r['description']}*)")
        
        tx_str = "\n".join(tx_details) if tx_details else "No individual details."
        return f"### {matched_category.capitalize()} Category Summary\nTotal Spent: **₹{total:,.2f}** ({pct}% of total expenses across {count} transactions).\n\n**Recent Transactions:**\n{tx_str}"

    # 4. Overspending & Anomaly check
    if any(k in q_lower for k in ['overspend', 'anomaly', 'unusual', 'high spend', 'flagged', 'spike']):
        over_res = insights_res['overspending']
        if over_res['overspending_count'] > 0:
            lines = [f"- **{t['date']}**: ₹{t['amount']:,.2f} for *{t['description']}* (Avg for {t['category']} is ₹{t['category_average']:,.2f}) — {t['reason']}" for t in over_res['flagged_transactions']]
            return f"### ML Overspending Alerts ({over_res['overspending_count']} Flagged)\n" + "\n".join(lines)
        else:
            return "No overspending anomalies detected in your transactions. Your spending appears within normal statistical limits."

    # 5. Net Savings / Income check
    if any(k in q_lower for k in ['save', 'saving', 'savings', 'net']):
        return f"Your total recorded income is **₹{metrics['total_income']:,.2f}** and total expenses are **₹{metrics['total_expenses']:,.2f}**, leaving **Net Savings of ₹{metrics['net_savings']:,.2f}** (Savings Rate: **{metrics['savings_rate']}%**)."

    # 6. Fallback with Gemini LLM if API Key present
    if GEMINI_API_KEY:
        try:
            summary_ctx = f"Total Income: ₹{metrics['total_income']}, Total Expenses: ₹{metrics['total_expenses']}, Net Savings: ₹{metrics['net_savings']}, Savings Rate: {metrics['savings_rate']}%, Largest Category: {metrics['largest_category']} (₹{metrics['largest_category_amount']}), Transactions Count: {len(df)}."
            sample_txs = df.head(15).to_dict(orient='records')
            
            prompt = f"""You are a helpful AI Finance Assistant.
Answer the user's question about their personal transaction dataset concisely and accurately in markdown format.

User Question: {query}

User Summary Data:
{summary_ctx}

Sample Transactions:
{sample_txs}
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            print(f"Gemini Chat Error: {e}")

    # Standard complete summary fallback
    return f"### Financial Summary Overview\n- **Total Income**: ₹{metrics['total_income']:,.2f}\n- **Total Expenses**: ₹{metrics['total_expenses']:,.2f}\n- **Net Savings**: ₹{metrics['net_savings']:,.2f} (Savings Rate: **{metrics['savings_rate']}%**)\n- **Largest Category**: {metrics['largest_category']} (₹{metrics['largest_category_amount']:,.2f})\n- **ML Persona**: {insights_res['cluster']['cluster_name']}"
