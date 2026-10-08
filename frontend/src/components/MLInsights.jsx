import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldAlert, Cpu, AlertTriangle, CheckCircle2, 
  TrendingUp, RefreshCw, BarChart2, Zap, HelpCircle
} from 'lucide-react';

export default function MLInsights({ token, apiUrl }) {
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
      if (!res.ok) throw new Error('Failed to fetch ML insights');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Could not load ML insights. Please ensure transaction CSV is uploaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [token, apiUrl]);

  if (loading) {
    return (
      <div className="state-container">
        <Sparkles size={36} className="animate-spin" color="#3B82F6" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFF' }}>Running Machine Learning Analysis...</div>
        <div style={{ fontSize: '0.85rem', color: '#A1A1A1', marginTop: '6px' }}>
          Clustering spending features with KMeans & evaluating Z-score transaction anomalies
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="state-container error">
        <AlertTriangle size={36} color="#EF4444" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{error || 'No ML insights available'}</div>
        <button className="retry-btn" onClick={fetchAnalysis}>
          <RefreshCw size={14} /> Retry Analysis
        </button>
      </div>
    );
  }

  const { cluster, overspending, bullet_insights, metrics } = data;

  return (
    <div className="ml-insights-view">
      {/* Header Banner */}
      <div className="ml-header-banner">
        <div className="ml-header-content">
          <div className="ml-badge">
            <Cpu size={14} /> Machine Learning Engine v1.0
          </div>
          <h2 className="ml-title">AI & ML Financial Intelligence</h2>
          <p className="ml-subtitle">
            Automated spending persona clustering, anomaly detection models, and predictive risk scoring based on your transaction history.
          </p>
        </div>
      </div>

      {/* KMeans Spending Behavior Profile Hero Card */}
      <div className="ml-cluster-card">
        <div className="ml-cluster-header">
          <div className="ml-cluster-title-group">
            <div className="cluster-icon-wrapper">
              <Zap size={22} color="#3B82F6" />
            </div>
            <div>
              <span className="cluster-meta-label">KMeans Machine Learning Cluster</span>
              <h3 className="cluster-name">{cluster.cluster_name}</h3>
            </div>
          </div>
          <span className="cluster-badge">{cluster.cluster_name}</span>
        </div>

        <p className="cluster-description">
          {cluster.description}
        </p>

        <div className="cluster-stats-row">
          <div className="cluster-stat">
            <span className="stat-label">Model Algorithm</span>
            <span className="stat-value">KMeans (k=3 Clusters)</span>
          </div>
          <div className="cluster-stat">
            <span className="stat-label">Evaluated Feature Vector</span>
            <span className="stat-value">Savings Rate, Food Ratio, Outflow</span>
          </div>
          <div className="cluster-stat">
            <span className="stat-label">Profile Risk Index</span>
            <span className="stat-value" style={{ 
              color: cluster.cluster_name.includes('High') ? '#EF4444' : cluster.cluster_name.includes('Moderate') ? '#F59E0B' : '#10B981' 
            }}>
              {cluster.cluster_name.includes('High') ? 'High Attention' : cluster.cluster_name.includes('Moderate') ? 'Moderate' : 'Optimal'}
            </span>
          </div>
        </div>

        <div className="cluster-disclaimer">
          <HelpCircle size={12} style={{ flexShrink: 0 }} />
          <span>{cluster.disclaimer}</span>
        </div>
      </div>

      {/* ML Overspending & Anomaly Detection */}
      <div className="ml-section">
        <div className="ml-section-header">
          <div className="section-title">
            <ShieldAlert size={20} color="#EF4444" />
            <h3>ML Overspending & Anomaly Detection</h3>
          </div>
          <span className="anomaly-count-pill" style={{
            backgroundColor: overspending.overspending_count > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: overspending.overspending_count > 0 ? '#EF4444' : '#10B981',
            border: `1px solid ${overspending.overspending_count > 0 ? '#EF4444' : '#10B981'}`
          }}>
            {overspending.overspending_count > 0 ? `${overspending.overspending_count} Anomalies Detected` : 'Zero Anomalies'}
          </span>
        </div>

        {overspending.overspending_count === 0 ? (
          <div className="no-anomalies-card">
            <CheckCircle2 size={32} color="#10B981" />
            <div>
              <h4 style={{ color: '#FFF', fontWeight: 600 }}>No Overspending Anomalies Flagged</h4>
              <p style={{ color: '#A1A1A1', fontSize: '0.85rem', marginTop: '4px' }}>
                All recorded transaction amounts are within normal statistical thresholds (mean ± 1.5x standard deviation) for their respective categories.
              </p>
            </div>
          </div>
        ) : (
          <div className="overspending-table-wrapper">
            <div className="table-responsive">
              <table className="overspending-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Merchant / Description</th>
                    <th>Category</th>
                    <th>Actual Amount</th>
                    <th>Category Avg</th>
                    <th>Flagged ML Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {overspending.flagged_transactions.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="date-cell">{tx.date}</td>
                      <td className="desc-cell">{tx.description}</td>
                      <td>
                        <span className="category-pill">{tx.category}</span>
                      </td>
                      <td className="amount-cell">₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                      <td className="avg-cell">₹{Number(tx.category_average).toLocaleString('en-IN')}</td>
                      <td className="reason-cell">{tx.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* AI Key Insights & Recommendations */}
      <div className="ml-section">
        <div className="ml-section-header">
          <div className="section-title">
            <Sparkles size={20} color="#3B82F6" />
            <h3>ML Generated Recommendations & Action Items</h3>
          </div>
        </div>

        <div className="insights-grid">
          {bullet_insights && bullet_insights.map((insight, idx) => (
            <div className="insight-card" key={idx}>
              <div className="insight-number">{idx + 1}</div>
              <div className="insight-text">{insight}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Diagnostics Info Card */}
      <div className="model-info-card">
        <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={16} color="#3B82F6" /> How our ML Models Work
        </h4>
        <p style={{ fontSize: '0.82rem', color: '#A1A1A1', lineHeight: '1.5' }}>
          Our financial engine utilizes standard Machine Learning primitives. <strong>KMeans Clustering</strong> groups user behaviors into distinct financial personas (Saver, Balanced, High-Spend) based on savings rate and spending velocity. The <strong>Anomaly Detector</strong> checks each transaction against category standard deviations and upper-bound interquartile ranges (IQR) to identify impulse spikes.
        </p>
      </div>
    </div>
  );
}
