// src/components/Authentication/Login.js
import React, { useState } from 'react';
import { signIn, resetPassword } from '../../services/authService';
import './Auth.css';

const Login = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setResetSent(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2>Login to WalkScore AI</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {resetSent ? (
        <div className="auth-success-message">
          <p>Password reset email sent! Check your inbox for further instructions.</p>
          <button 
            className="auth-button"
            onClick={() => setResetSent(false)}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <div className="auth-links">
            <button 
              type="button" 
              className="auth-link-button" 
              onClick={handleResetPassword}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="auth-switch">
            <p>Don't have an account?</p>
            <button 
              type="button" 
              className="auth-switch-button" 
              onClick={onSwitchToSignup}
            >
              Sign Up
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;