import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from typing import Dict, Any, List

def detect_overspending(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Detects potential overspending transactions using a simple ML classifier (DecisionTree)
    trained on synthetic threshold features.
    
    Disclaimer: Demonstration ML model, not a commercial credit risk or banking model.
    """
    if df.empty:
        return {
            "flagged_transactions": [],
            "overspending_count": 0,
            "total_overspent_amount": 0.0,
            "disclaimer": "Demonstration ML model for educational insights."
        }

    expense_df = df[df['type'] == 'expense'].copy()
    if expense_df.empty:
        return {
            "flagged_transactions": [],
            "overspending_count": 0,
            "total_overspent_amount": 0.0,
            "disclaimer": "Demonstration ML model for educational insights."
        }

    # Compute historical category averages
    category_means = expense_df.groupby('category')['amount'].transform('mean')
    expense_df['category_avg'] = category_means

    # Generate synthetic binary training labels based on transparent rule:
    # 1 if amount > category_avg * 1.4 AND amount > 500, else 0
    # Rent and Investments are excluded from overspending flag
    def label_rule(row):
        cat = str(row['category']).capitalize()
        if cat in ['Rent', 'Investment', 'Salary']:
            return 0
        if row['amount'] > row['category_avg'] * 1.4 and row['amount'] > 500:
            return 1
        return 0

    y_synthetic = expense_df.apply(label_rule, axis=1)

    # Feature matrix: [amount, category_avg, ratio_to_avg]
    expense_df['ratio'] = expense_df['amount'] / (expense_df['category_avg'] + 1e-5)
    X = expense_df[['amount', 'category_avg', 'ratio']].values

    # Train Decision Tree Classifier
    clf = DecisionTreeClassifier(max_depth=3, random_state=42)
    clf.fit(X, y_synthetic)

    # Predict overspending probability/label
    predictions = clf.predict(X)
    expense_df['is_overspending'] = predictions

    flagged = expense_df[expense_df['is_overspending'] == 1]

    flagged_list = []
    for _, row in flagged.iterrows():
        cat_avg = round(float(row['category_avg']), 2)
        amt = round(float(row['amount']), 2)
        diff = round(amt - cat_avg, 2)
        flagged_list.append({
            "date": str(row['date']),
            "description": str(row['description']),
            "category": str(row['category']),
            "amount": amt,
            "category_average": cat_avg,
            "excess_amount": max(diff, 0.0),
            "reason": f"Amount ₹{amt:,.2f} is significantly higher than your average {str(row['category'])} spend of ₹{cat_avg:,.2f}."
        })

    return {
        "flagged_transactions": flagged_list,
        "overspending_count": len(flagged_list),
        "total_overspent_amount": round(float(flagged['amount'].sum() - flagged['category_avg'].sum()), 2) if not flagged.empty else 0.0,
        "disclaimer": "Demonstration ML model trained on synthetic category benchmarks for educational insights."
    }
