import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [page, setPage] = useState('login'); // 'login', 'register', 'home'

  useEffect(() => {
    // Load saved auth session from localStorage
    const savedToken = localStorage.getItem('finance_ai_token');
    const savedUser = localStorage.getItem('finance_ai_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setPage('home');
      } catch (e) {
        localStorage.removeItem('finance_ai_token');
        localStorage.removeItem('finance_ai_user');
      }
    }
  }, []);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('finance_ai_token', newToken);
    localStorage.setItem('finance_ai_user', JSON.stringify(newUser));
    setPage('home');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('finance_ai_token');
    localStorage.removeItem('finance_ai_user');
    setPage('login');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0B0B0B' }}>
      {page === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onNavigateRegister={() => setPage('register')}
          apiUrl={API_URL}
        />
      )}

      {page === 'register' && (
        <Register 
          onNavigateLogin={() => setPage('login')}
          apiUrl={API_URL}
        />
      )}

      {page === 'home' && (
        <Home 
          user={user}
          token={token}
          onLogout={handleLogout}
          apiUrl={API_URL}
        />
      )}
    </div>
  );
}
