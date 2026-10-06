import pandas as pd
from typing import Dict, Any, List
from app.services.transaction_service import calculate_dashboard_metrics, load_user_transactions
from app.ml.clustering import analyze_spending_clusters
from app.ml.overspending import detect_overspending

def generate_financial_insights(df: pd.DataFrame) -> Dict[str, Any]:
    """Generates complete financial insights combining metrics, KMeans cluster, overspending ML, and bullet insights."""
    metrics = calculate_dashboard_metrics(df)
    cluster_res = analyze_spending_clusters(df)
    overspending_res = detect_overspending(df)

    insights: List[str] = []

    if df.empty:
        insights.append("No transaction data available yet. Please upload a CSV to view detailed insights.")
        return {
            "metrics": metrics,
            "cluster": cluster_res,
            "overspending": overspending_res,
            "bullet_insights": insights,
            "disclaimer": "This application provides educational financial insights and is not a substitute for professional financial advice."
        }

    total_exp = metrics["total_expenses"]
    total_inc = metrics["total_income"]
    savings_rate = metrics["savings_rate"]
    cat_breakdown = metrics["category_breakdown"]

    # 1. Savings insight
    if savings_rate > 30:
        insights.append(f"Great job! Your savings rate is approximately {savings_rate}%, which exceeds the recommended 20% benchmark.")
    elif savings_rate > 0:
        insights.append(f"Your savings rate is currently {savings_rate}%. Aiming for 20% or higher will help build long-term wealth.")
    else:
        insights.append("Your expenses currently exceed or equal your income. Consider reviewing discretionary costs.")

    # 2. Food spending percentage
    food_spend = cat_breakdown.get('Food', 0.0)
    if total_exp > 0 and food_spend > 0:
        food_pct = round((food_spend / total_exp) * 100, 1)
        insights.append(f"You spent ₹{food_spend:,.2f} ({food_pct}%) of your total expenses on food & dining.")

    # 3. Largest spending category
    if metrics["largest_category"] != "N/A":
        insights.append(f"Your largest single spending category is {metrics['largest_category']} at ₹{metrics['largest_category_amount']:,.2f}.")

    # 4. Average monthly spend
    if metrics["avg_monthly_spending"] > 0:
        insights.append(f"Your average monthly spending across recorded months is ₹{metrics['avg_monthly_spending']:,.2f}.")

    # 5. KMeans Persona Insight
    insights.append(f"ML Clustering analysis categorizes your overall profile as: '{cluster_res['cluster_name']}' - {cluster_res['description']}")

    # 6. Overspending Alert
    if overspending_res["overspending_count"] > 0:
        insights.append(f"ML Overspending detector flagged {overspending_res['overspending_count']} transactions with higher-than-usual category spend.")

    return {
        "metrics": metrics,
        "cluster": cluster_res,
        "overspending": overspending_res,
        "bullet_insights": insights,
        "disclaimer": "This application provides educational financial insights and is not a substitute for professional financial advice."
    }
