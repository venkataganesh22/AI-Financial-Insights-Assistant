import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Chat from '../components/Chat';
import Dashboard from '../components/Dashboard';
import MLInsights from '../components/MLInsights';
import UploadCSV from '../components/UploadCSV';

export default function Home({ user, token, onLogout, apiUrl }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleUploadSuccess = () => {
    // Automatically switch to dashboard after uploading CSV
    setTimeout(() => {
      setActiveTab('dashboard');
    }, 1000);
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout}
        user={user}
        onNewChat={handleNewChat}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="main-wrapper">
        <Navbar 
          activeTab={activeTab} 
          user={user} 
          onToggleMobileMenu={() => setMobileOpen(prev => !prev)}
        />

        <main className="content-area">
          {activeTab === 'chat' && (
            <Chat 
              messages={messages} 
              setMessages={setMessages} 
              token={token}
              apiUrl={apiUrl} 
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              token={token} 
              apiUrl={apiUrl} 
            />
          )}

          {activeTab === 'insights' && (
            <MLInsights 
              token={token} 
              apiUrl={apiUrl} 
            />
          )}

          {activeTab === 'upload' && (
            <UploadCSV 
              token={token} 
              apiUrl={apiUrl} 
              onUploadSuccess={handleUploadSuccess}
            />
          )}
        </main>
      </div>
    </div>
  );
}
