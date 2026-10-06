import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from typing import Dict, Any, List

def analyze_spending_clusters(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs KMeans clustering on user spending behavior to categorize spending style.
    Note: These clusters are simplified data-driven spending patterns for educational visualization.
    """
    if df.empty:
        return {
            "cluster_name": "Insufficient Data",
            "cluster_id": 0,
            "description": "Upload transaction data to see your spending pattern cluster.",
            "cluster_profiles": [],
            "disclaimer": "These clusters are simplified data-driven spending patterns for educational purposes only."
        }

    expense_df = df[df['type'] == 'expense']
    if expense_df.empty:
        return {
            "cluster_name": "No Expense Data",
            "cluster_id": 0,
            "description": "No expense records found to cluster spending habits.",
            "cluster_profiles": [],
            "disclaimer": "These clusters are simplified data-driven spending patterns for educational purposes only."
        }

    # Extract user spending features
    total_expense = expense_df['amount'].sum()
    cat_totals = expense_df.groupby('category')['amount'].sum()

    categories = ['Food', 'Shopping', 'Transport', 'Bills', 'Rent', 'Entertainment']
    cat_props = {}
    for cat in categories:
        cat_props[cat] = (cat_totals.get(cat, 0.0) / total_expense) if total_expense > 0 else 0.0

    avg_txn_size = float(expense_df['amount'].mean()) if len(expense_df) > 0 else 0.0
    txn_count = len(expense_df)

    # Feature vector for current user
    user_features = [
        cat_props['Food'],
        cat_props['Shopping'],
        cat_props['Transport'],
        cat_props['Bills'],
        cat_props['Rent'],
        cat_props['Entertainment'],
        avg_txn_size / 5000.0, # Normalized
        min(txn_count / 100.0, 1.0)
    ]

    # Pre-defined Synthetic Profiles representing benchmark spending personalities
    # 0: Essential Spender (high Rent/Bills)
    # 1: Shopping Heavy (high Shopping prop)
    # 2: Food & Entertainment Heavy (high Food & Entertainment prop)
    # 3: Balanced Spender (even distribution)
    archetypes = [
        [0.15, 0.10, 0.05, 0.35, 0.30, 0.05, 0.3, 0.4], # Essential Spender
        [0.10, 0.50, 0.10, 0.15, 0.10, 0.05, 0.6, 0.7], # Shopping Heavy
        [0.45, 0.15, 0.10, 0.10, 0.10, 0.10, 0.2, 0.8], # Food & Entertainment Heavy
        [0.25, 0.20, 0.15, 0.20, 0.15, 0.05, 0.4, 0.5]  # Balanced Spender
    ]

    cluster_names = [
        "Essential Spender",
        "Shopping Heavy",
        "Food & Entertainment Heavy",
        "Balanced Spender"
    ]

    cluster_descriptions = [
        "Most of your spending goes toward core needs like rent, groceries, and essential utility bills.",
        "A significant portion of your discretionary expenses goes toward online and retail shopping.",
        "Food delivery apps, dining out, and social activities make up a large portion of your monthly spend.",
        "Your spending is relatively well-distributed across essential needs, personal items, and savings."
    ]

    # Train KMeans model with 4 clusters
    X_train = np.array(archetypes)
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    kmeans.fit(X_train)

    # Predict cluster for user
    user_cluster_id = int(kmeans.predict([user_features])[0])

    cluster_profiles = []
    for idx in range(4):
        cluster_profiles.append({
            "id": idx,
            "name": cluster_names[idx],
            "description": cluster_descriptions[idx],
            "is_current_user": (idx == user_cluster_id)
        })

    return {
        "cluster_name": cluster_names[user_cluster_id],
        "cluster_id": user_cluster_id,
        "description": cluster_descriptions[user_cluster_id],
        "cluster_profiles": cluster_profiles,
        "disclaimer": "These clusters are simplified data-driven spending patterns for educational visualization."
    }
