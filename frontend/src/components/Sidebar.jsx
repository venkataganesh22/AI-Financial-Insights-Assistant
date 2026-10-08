import React from 'react';
import { 
  MessageSquarePlus, LayoutDashboard, Upload, Sparkles, LogOut, 
  DollarSign, X, ChevronRight, User 
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  user, 
  onNewChat,
  mobileOpen,
  setMobileOpen
}) {

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      onNewChat();
    }
    if (setMobileOpen) {
      setMobileOpen(false); // Auto close mobile drawer on selection
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div>
          <div className="sidebar-brand-wrapper">
            <div className="sidebar-brand">
              <div className="brand-logo">₹</div>
              <span>AI Finance</span>
            </div>
            
            {/* Mobile close button */}
            <button 
              className="mobile-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <button 
              className="sidebar-btn sidebar-new-chat" 
              onClick={() => handleTabClick('chat')}
            >
              <MessageSquarePlus size={18} />
              <span>New Chat</span>
            </button>

            <button 
              className={`sidebar-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => handleTabClick('chat')}
            >
              <Sparkles size={18} />
              <span>AI Assistant</span>
            </button>

            <button 
              className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabClick('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button 
              className={`sidebar-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => handleTabClick('upload')}
            >
              <Upload size={18} />
              <span>Upload CSV</span>
            </button>

            <button 
              className={`sidebar-btn ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => handleTabClick('insights')}
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

          <button className="sidebar-btn logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
