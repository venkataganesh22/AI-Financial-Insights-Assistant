import React from 'react';
import { MessageSquarePlus, LayoutDashboard, Upload, Sparkles, LogOut, User, DollarSign } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, user, onNewChat }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#FFF',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem'
          }}>
            ₹
          </div>
          <span>AI Finance</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className="sidebar-btn sidebar-new-chat" 
            onClick={() => { setActiveTab('chat'); onNewChat(); }}
          >
            <MessageSquarePlus size={18} />
            <span>New Chat</span>
          </button>

          <button 
            className={`sidebar-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <Sparkles size={18} />
            <span>AI Assistant</span>
          </button>

          <button 
            className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`sidebar-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={18} />
            <span>Upload CSV</span>
          </button>

          <button 
            className={`sidebar-btn ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <DollarSign size={18} />
            <span>ML Insights</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">
        {user && (
          <div className="user-profile-badge">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        )}

        <button className="sidebar-btn" onClick={onLogout} style={{ color: '#EF4444' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
