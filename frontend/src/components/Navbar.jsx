import React from 'react';
import { Sparkles, ShieldAlert, Menu, DollarSign, LayoutDashboard, Upload, MessageSquare } from 'lucide-react';

export default function Navbar({ activeTab, user, onToggleMobileMenu }) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'chat': return 'AI Financial Assistant';
      case 'dashboard': return 'Financial Overview & Charts';
      case 'upload': return 'Upload Statements CSV';
      case 'insights': return 'ML Machine Learning Insights';
      default: return 'AI Financial Insights Assistant';
    }
  };

  return (
    <div className="navbar-container">
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="nav-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#3B82F6" />
            <span>{getTabTitle()}</span>
          </div>
        </div>

        {user && (
          <div className="nav-user-greeting">
            Welcome, <span style={{ color: '#FFF', fontWeight: 600 }}>{user.name}</span>
          </div>
        )}
      </div>

      <div className="disclaimer-banner">
        <ShieldAlert size={14} color="#F59E0B" style={{ flexShrink: 0 }} />
        <span>Educational financial insights only. Not professional financial advice.</span>
      </div>
    </div>
  );
}
