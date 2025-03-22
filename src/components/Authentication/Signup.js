// src/components/Authentication/Signup.js
import React, { useState } from 'react';
import { signUp } from '../../services/authService';
import './Auth.css';

const Signup = ({ onClose, onSwitchToLogin }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);

    try {
      const result = await signUp(email, password, displayName);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2>Create an Account</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSignup} className="auth-form">
        {error && <div className="auth-error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="displayName">Name</label>
          <input 
            type="text" 
            id="displayName" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <input 
            type="email" 
            id="signup-email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input 
            type="password" 
            id="signup-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <small className="form-hint">Must be at least 6 characters long</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input 
            type="password" 
            id="confirm-password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        
        <div className="terms-agreement">
          <p>By creating an account, you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        
        <div className="auth-switch">
          <p>Already have an account?</p>
          <button 
            type="button" 
            className="auth-switch-button" 
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;