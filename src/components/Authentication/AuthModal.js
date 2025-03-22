// src/components/Authentication/AuthModal.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Auth.css';

const AuthModal = ({ show, onClose, initialMode = 'signup' }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (show) {
      setMode(initialMode);
    }
  }, [initialMode, show]);

  if (!show) return null;

  const switchToLogin = () => setMode('login');
  const switchToSignup = () => setMode('signup');

  return (
    <div className="modal-backdrop">
      {mode === 'login' && (
        <Login onClose={onClose} onSwitchToSignup={switchToSignup} />
      )}

      {mode === 'signup' && (
        <Signup onClose={onClose} onSwitchToLogin={switchToLogin} />
      )}
    </div>
  );
};

export default AuthModal;
