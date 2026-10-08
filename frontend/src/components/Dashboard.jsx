import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, PiggyBank, 
  Sparkles, PieChartIcon, BarChart3, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { CategoryPieChart, MonthlyTrendChart } from './Charts';

export default function Dashboard({ token, apiUrl }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/dashboard`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!res.ok) throw new Error('Failed to fetch financial dashboard metrics');
      const result = await res.json();
      setData(result.metrics);
    } catch (err) {
      console.error(err);
      setError('Could not load financial metrics. Please ensure transaction CSV is uploaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, apiUrl]);

  if (loading) {
    return (
      <div className="state-container">
        <Sparkles size={36} className="animate-spin" color="#3B82F6" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFF' }}>Loading Dashboard Metrics...</div>
        <div style={{ fontSize: '0.85rem', color: '#A1A1A1', marginTop: '6px' }}>
          Calculating cash flows, category totals, and monthly trends
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="state-container error">
        <AlertCircle size={36} color="#EF4444" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{error || 'No data available'}</div>
        <button className="retry-btn" onClick={fetchDashboardData}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const metrics = data;
  const categoriesList = Object.entries(metrics.category_breakdown || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="dashboard-view">
      {/* Top Welcome / Header */}
      <div className="dashboard-header-row">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFF' }}>Financial Overview</h2>
          <p style={{ fontSize: '0.85rem', color: '#A1A1A1', marginTop: '2px' }}>
            Real-time financial summary, income vs expense tracking, and spending allocation.
          </p>
        </div>
        <div className="total-tx-badge">
          <CreditCard size={14} />
          <span>{metrics.total_transactions} Total Transactions</span>
        </div>
      </div>

      {/* Top Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Income</span>
            <div className="metric-icon-bg green">
              <ArrowUpRight size={18} color="#10B981" />
            </div>
          </div>
          <div className="metric-value">₹{metrics.total_income.toLocaleString('en-IN')}</div>
          <div className="metric-sub green">
            <TrendingUp size={14} /> Recorded Cash Inflow
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Expenses</span>
            <div className="metric-icon-bg red">
              <ArrowDownRight size={18} color="#EF4444" />
            </div>
          </div>
          <div className="metric-value">₹{metrics.total_expenses.toLocaleString('en-IN')}</div>
          <div className="metric-sub red">
            <TrendingDown size={14} /> Total Cash Outflow
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Net Savings</span>
            <div className="metric-icon-bg blue">
              <PiggyBank size={18} color="#3B82F6" />
            </div>
          </div>
          <div className="metric-value" style={{ color: metrics.net_savings >= 0 ? '#10B981' : '#EF4444' }}>
            ₹{metrics.net_savings.toLocaleString('en-IN')}
          </div>
          <div className="metric-sub neutral">
            Savings Rate: <strong style={{ color: '#FFF' }}>{metrics.savings_rate}%</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Avg Monthly Outflow</span>
            <div className="metric-icon-bg purple">
              <Wallet size={18} color="#8B5CF6" />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.35rem' }}>
            ₹{metrics.avg_monthly_spending.toLocaleString('en-IN')}
          </div>
          <div className="metric-sub neutral">
            Largest: <strong style={{ color: '#FFF' }}>{metrics.largest_category}</strong> (₹{metrics.largest_category_amount.toLocaleString('en-IN')})
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={18} color="#3B82F6" />
              <span className="chart-title">Category Spending Distribution</span>
            </div>
          </div>
          <div className="chart-body">
            <CategoryPieChart categoryBreakdown={metrics.category_breakdown} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#10B981" />
              <span className="chart-title">Monthly Cash Flow Comparison</span>
            </div>
          </div>
          <div className="chart-body">
            <MonthlyTrendChart monthlyTrends={metrics.monthly_trends} />
          </div>
        </div>
      </div>

      {/* Breakdown List Section */}
      <div className="dashboard-section-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFF', marginBottom: '16px' }}>
          Top Expense Categories Breakdown
        </h3>
        <div className="categories-progress-list">
          {categoriesList.map(([catName, amount], idx) => {
            const percentage = metrics.total_expenses > 0 
              ? Math.min(Math.round((amount / metrics.total_expenses) * 100), 100) 
              : 0;
            return (
              <div key={idx} className="category-progress-item">
                <div className="category-info-row">
                  <span className="cat-name">{catName}</span>
                  <span className="cat-amount">
                    ₹{amount.toLocaleString('en-IN')} <span className="cat-pct">({percentage}%)</span>
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: idx === 0 ? '#3B82F6' : idx === 1 ? '#10B981' : idx === 2 ? '#F59E0B' : '#8B5CF6'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
