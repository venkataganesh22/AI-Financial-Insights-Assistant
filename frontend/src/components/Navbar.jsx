import React from 'react';
import { Sparkles, ShieldAlert } from 'lucide-react';

export default function Navbar({ activeTab, user }) {
  return (
    <div>
      <div className="navbar">
        <div className="nav-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#3B82F6" />
          <span>AI Financial Insights Assistant</span>
        </div>
        {user && (
          <div style={{ fontSize: '0.85rem', color: '#A1A1A1' }}>
            Welcome, <span style={{ color: '#FFF', fontWeight: 600 }}>{user.name}</span>
          </div>
        )}
      </div>
      <div className="disclaimer-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldAlert size={14} color="#F59E0B" />
        <span>This application provides educational financial insights and is not a substitute for professional financial advice.</span>
      </div>
    </div>
  );
}
