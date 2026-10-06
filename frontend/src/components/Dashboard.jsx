import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ShieldAlert, Sparkles, PieChartIcon, BarChart3 } from 'lucide-react';
import { CategoryPieChart, MonthlyTrendChart } from './Charts';

export default function Dashboard({ token, apiUrl }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/analyze`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!res.ok) throw new Error('Failed to fetch financial analysis');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Could not load financial insights. Please ensure transaction CSV is uploaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [token, apiUrl]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#A1A1A1' }}>
        <Sparkles size={32} className="animate-spin" color="#3B82F6" style={{ margin: '0 auto 12px' }} />
        <div>Computing KMeans Clusters and Overspending ML model...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
        <div>{error || 'No data available'}</div>
      </div>
    );
  }

  const { metrics, cluster, overspending, bullet_insights } = data;

  return (
    <div className="dashboard-view">
      {/* Top Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Income</div>
          <div className="metric-value">₹{metrics.total_income.toLocaleString('en-IN')}</div>
          <div className="metric-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> Recorded Income
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Expenses</div>
          <div className="metric-value">₹{metrics.total_expenses.toLocaleString('en-IN')}</div>
          <div className="metric-sub negative" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingDown size={14} /> Total Outflow
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Net Savings</div>
          <div className="metric-value" style={{ color: metrics.net_savings >= 0 ? '#10B981' : '#EF4444' }}>
            ₹{metrics.net_savings.toLocaleString('en-IN')}
          </div>
          <div className="metric-sub">
            Savings Rate: <strong style={{ color: '#FFF' }}>{metrics.savings_rate}%</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Largest Category</div>
          <div className="metric-value" style={{ fontSize: '1.2rem' }}>{metrics.largest_category}</div>
          <div className="metric-sub">
            ₹{metrics.largest_category_amount.toLocaleString('en-IN')} spent
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChartIcon size={18} color="#3B82F6" />
            <span>Category Spending Breakdown</span>
          </div>
          <CategoryPieChart categoryBreakdown={metrics.category_breakdown} />
        </div>

        <div className="chart-card">
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#10B981" />
            <span>Monthly Income vs Expenses</span>
          </div>
          <MonthlyTrendChart monthlyTrends={metrics.monthly_trends} />
        </div>
      </div>

      {/* ML Persona KMeans Clustering */}
      <div className="insights-section">
        <div className="cluster-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#3B82F6" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>KMeans Spending Behavior Profile</h3>
            </div>
            <span className="cluster-tag">{cluster.cluster_name}</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#D1D5DB' }}>
            {cluster.description}
          </p>

          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic', borderTop: '1px solid #333', paddingTop: '8px' }}>
            Disclaimer: {cluster.disclaimer}
          </div>
        </div>

        {/* ML Overspending Alert */}
        {overspending.overspending_count > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#EF4444" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>ML Overspending Flagged Transactions</h3>
            </div>

            <div className="overspending-table-wrapper">
              <table className="overspending-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Cat. Avg</th>
                    <th>Reason / Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {overspending.flagged_transactions.map((tx, idx) => (
                    <tr key={idx}>
                      <td>{tx.date}</td>
                      <td style={{ fontWeight: 600 }}>{tx.description}</td>
                      <td>{tx.category}</td>
                      <td style={{ color: '#EF4444', fontWeight: 600 }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                      <td>₹{tx.category_average.toLocaleString('en-IN')}</td>
                      <td style={{ fontSize: '0.8rem', color: '#A1A1A1' }}>{tx.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bullet Key Insights */}
        <div style={{
          backgroundColor: '#1C1C1C',
          border: '1px solid #2A2A2A',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexdirection: 'column',
          gap: '12px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFF' }}>Key Financial Insights</h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#D1D5DB' }}>
            {bullet_insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
