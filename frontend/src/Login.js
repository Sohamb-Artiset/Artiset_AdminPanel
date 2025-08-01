import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Distribution_pg_2/home.css';
import ArtisetLogo from './img/Artiset_Logo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Hardcoded accounts
  const adminAccount = { email: 'admin@example.com', password: 'pass@word' };
  const deniedAccount = { email: 'user@example.com', password: 'user123' };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === adminAccount.email && password === adminAccount.password) {
      setMessage('Login successful! Welcome, Admin.');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else if (email === deniedAccount.email && password === deniedAccount.password) {
      setMessage('Access Denied.');
    } else {
      setMessage('Invalid credentials.');
    }
  };

  return (
    <div className="home-container login-center">
      <div className="main login-center">
        <div className="content login-center">
          <div className="message-container login-center">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img 
                src={ArtisetLogo} 
                alt="Artiset Logo" 
                style={{ width: '120px', height: 'auto', marginBottom: 16 }} 
              />
            </div>
            <form onSubmit={handleSubmit}>
              <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login</h2>
              
              <div style={{ marginBottom: 16 }}>
                <label>Email:</label>
                <input
                  type="email"
                  className="search-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <label>Password:</label>
                <input
                  type="password"
                  className="search-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="message-button">
                Login
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <button 
                  type="button" 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#1d6ed6', 
                    cursor: 'pointer', 
                    fontSize: 14,
                    textDecoration: 'underline'
                  }}
                  onClick={() => alert('Forgot password functionality coming soon!')}
                >
                  Forgot Password?
                </button>
              </div>
              
              

              {message && (
                <div style={{ marginTop: 20, textAlign: 'center', color: message === 'Login successful! Welcome, Admin.' ? 'green' : 'red' }}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
