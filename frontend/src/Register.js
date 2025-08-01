import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Distribution_pg_2/home.css';
import ArtisetLogo from './img/Artiset_Logo.png';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }
    
    // Here you would typically send the registration data to your backend
    setMessage('Registration successful! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
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
              <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Register</h2>
              
              <div style={{ marginBottom: 16 }}>
                <label>Username:</label>
                <input
                  type="text"
                  className="search-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              
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
              
              <div style={{ marginBottom: 16 }}>
                <label>Password:</label>
                <input
                  type="password"
                  className="search-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <label>Confirm Password:</label>
                <input
                  type="password"
                  className="search-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="message-button">
                Register
              </button>
              
              <div style={{ textAlign: 'center', fontSize: 14, marginTop: 16 }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: '#1d6ed6', textDecoration: 'underline' }}>
                  Login here
                </a>
              </div>

              {message && (
                <div style={{ marginTop: 20, textAlign: 'center', color: message.includes('successful') ? 'green' : 'red' }}>
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

export default Register;
