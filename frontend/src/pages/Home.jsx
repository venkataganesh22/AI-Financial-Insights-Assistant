import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Chat from '../components/Chat';
import Dashboard from '../components/Dashboard';
import UploadCSV from '../components/UploadCSV';

export default function Home({ user, token, onLogout, apiUrl }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);

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
      />

      <div className="main-wrapper">
        <Navbar activeTab={activeTab} user={user} />

        {activeTab === 'chat' && (
          <Chat 
            messages={messages} 
            setMessages={setMessages} 
            token={token}
            apiUrl={apiUrl} 
          />
        )}

        {(activeTab === 'dashboard' || activeTab === 'insights') && (
          <Dashboard 
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
      </div>
    </div>
  );
}
