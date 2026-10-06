import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.config import TRANSACTIONS_DIR, SAMPLE_DATA_FILE
from app.auth.auth import sanitize_email_for_folder

COLUMN_MAPPINGS = {
    'amount': ['amount', 'Amount', 'transaction_amount', 'amt', 'value', 'price'],
    'description': ['description', 'Description', 'merchant', 'desc', 'particulars', 'title', 'narrative'],
    'category': ['category', 'Category', 'cat', 'spending_category', 'type_category'],
    'date': ['date', 'Date', 'txn_date', 'transaction_date', 'time', 'timestamp'],
    'type': ['type', 'Type', 'transaction_type', 'credit_debit', 'income_expense']
}

def get_user_csv_path(user_email: str) -> Path:
    """Returns absolute path to user's uploaded transactions CSV file."""
    folder = sanitize_email_for_folder(user_email)
    user_dir = TRANSACTIONS_DIR / folder
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir / "transactions.csv"

def load_user_transactions(user_email: str) -> pd.DataFrame:
    """
    Loads and cleans transaction dataset for specific user.
    Falls back to sample dataset if user hasn't uploaded a CSV yet.
    """
    csv_path = get_user_csv_path(user_email)
    
    if not csv_path.exists() or csv_path.stat().st_size == 0:
        # Fallback to sample data for seamless initial preview
        if SAMPLE_DATA_FILE.exists():
            csv_path.write_bytes(SAMPLE_DATA_FILE.read_bytes())
        else:
            return pd.DataFrame(columns=['date', 'description', 'category', 'amount', 'type'])

    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        raise ValueError(f"Failed to parse CSV file: {str(e)}")

    if df.empty:
        return pd.DataFrame(columns=['date', 'description', 'category', 'amount', 'type'])

    # Flexible column mapping
    renamed_cols = {}
    for standard_col, list_of_aliases in COLUMN_MAPPINGS.items():
        for col in df.columns:
            if col.strip().lower() in [a.lower() for a in list_of_aliases]:
                renamed_cols[col] = standard_col
                break

    df = df.rename(columns=renamed_cols)

    # Ensure required columns exist
    for req in ['date', 'description', 'category', 'amount', 'type']:
        if req not in df.columns:
            df[req] = '' if req in ['description', 'category', 'type', 'date'] else 0.0

    # Data cleaning & type conversion
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
    df['description'] = df['description'].astype(str).str.strip().fillna('Unknown')
    df['category'] = df['category'].astype(str).str.strip().str.capitalize().fillna('Other')
    df['type'] = df['type'].astype(str).str.strip().str.lower()
    
    # Standardize transaction type (income vs expense / credit vs debit)
    def normalize_type(row):
        t = str(row['type']).lower()
        if t in ['income', 'credit', 'salary', 'deposit']:
            return 'income'
        return 'expense'

    df['type'] = df.apply(normalize_type, axis=1)

    # Parse dates
    df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.strftime('%Y-%m-%d').fillna('2026-01-01')

    return df

def calculate_dashboard_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculates summary financial statistics formatted for Indian users (₹)."""
    if df.empty:
        return {
            "total_income": 0,
            "total_expenses": 0,
            "net_savings": 0,
            "savings_rate": 0.0,
            "largest_category": "N/A",
            "largest_category_amount": 0,
            "avg_monthly_spending": 0,
            "total_transactions": 0,
            "category_breakdown": {},
            "monthly_trends": []
        }

    income_df = df[df['type'] == 'income']
    expense_df = df[df['type'] == 'expense']

    total_income = float(income_df['amount'].sum())
    total_expenses = float(expense_df['amount'].sum())
    net_savings = total_income - total_expenses

    savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0.0

    # Category breakdown for expenses
    cat_summary = expense_df.groupby('category')['amount'].sum().sort_values(ascending=False).to_dict()
    
    largest_category = "N/A"
    largest_category_amount = 0.0
    if cat_summary:
        largest_category = list(cat_summary.keys())[0]
        largest_category_amount = float(list(cat_summary.values())[0])

    # Monthly trends calculation
    df['month'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m')
    monthly_grouped = df.groupby(['month', 'type'])['amount'].sum().unstack(fill_value=0).reset_index()
    
    monthly_trends = []
    for _, row in monthly_grouped.iterrows():
        monthly_trends.append({
            "month": str(row['month']),
            "income": float(row.get('income', 0)),
            "expenses": float(row.get('expense', 0))
        })

    num_months = max(len(monthly_trends), 1)
    avg_monthly_spending = round(total_expenses / num_months, 2)

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate": savings_rate,
        "largest_category": largest_category,
        "largest_category_amount": round(largest_category_amount, 2),
        "avg_monthly_spending": avg_monthly_spending,
        "total_transactions": len(df),
        "category_breakdown": {k: round(float(v), 2) for k, v in cat_summary.items()},
        "monthly_trends": monthly_trends
    }
