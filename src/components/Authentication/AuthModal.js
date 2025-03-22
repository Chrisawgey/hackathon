// src/components/Authentication/AuthModal.js
import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Auth.css';

const AuthModal = ({ show, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);

  if (!show) {
    return null;
  }

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  const handleSwitchToSignup = () => {
    setMode('signup');
  };

  return (
    <div className="modal-backdrop">
      {mode === 'login' ? (
        <Login 
          onClose={onClose} 
          onSwitchToSignup={handleSwitchToSignup} 
        />
      ) : (
        <Signup 
          onClose={onClose} 
          onSwitchToLogin={handleSwitchToLogin} 
        />
      )}
    </div>
  );
};

export default AuthModal;