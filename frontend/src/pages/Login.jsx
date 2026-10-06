import React, { useState } from 'react';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess, onNavigateRegister, apiUrl }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      onLoginSuccess(data.access_token, data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#FFF',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.2rem',
            margin: '0 auto 8px'
          }}>
            ₹
          </div>
          <h1>Welcome back</h1>
          <p>Understand your money with AI.</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#7F1D1D',
            border: '1px solid #DC2626',
            color: '#FECACA',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="upload-btn" 
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo credentials box */}
        <div className="demo-credentials-box">
          <div style={{ fontWeight: 600, color: '#FFF', marginBottom: '4px' }}>
            DEMO ONLY Accounts (Click to autofill):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              type="button"
              onClick={() => fillDemo('student@example.com', 'Student@123')}
              style={{
                background: '#1F1F1F',
                border: '1px solid #333',
                color: '#DDD',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>student@example.com</span>
              <span style={{ color: '#888' }}>Student@123</span>
            </button>

            <button 
              type="button"
              onClick={() => fillDemo('rahul@example.com', 'Rahul@123')}
              style={{
                background: '#1F1F1F',
                border: '1px solid #333',
                color: '#DDD',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>rahul@example.com</span>
              <span style={{ color: '#888' }}>Rahul@123</span>
            </button>

            <button 
              type="button"
              onClick={() => fillDemo('priya@example.com', 'Priya@123')}
              style={{
                background: '#1F1F1F',
                border: '1px solid #333',
                color: '#DDD',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>priya@example.com</span>
              <span style={{ color: '#888' }}>Priya@123</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#A1A1A1' }}>
          Don't have an account?{' '}
          <span 
            onClick={onNavigateRegister}
            style={{ color: '#FFF', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}
