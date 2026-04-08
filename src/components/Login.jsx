import React, { useState } from 'react';
import eggLogo from '../assets/egg_logo.svg';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      // Dummy authentication
      if (email === 'admin@necc.com' && password === 'admin123') {
        onLogin();
      } else {
        setError('Invalid email or password. Try: admin@necc.com / admin123');
      }
    }, 1200);
  };

  return (
    <div className="login-container">
      <div className="login-glass-card animate-in">
        <div className="login-header">
          <img src={eggLogo} alt="NECC Logo" className="login-logo" />
          <h2>Welcome Back</h2>
          <p>Sign in to access the NECC Dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
