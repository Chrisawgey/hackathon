// src/components/Navigation/Navbar.js - Route options removed
import React, { useState, useEffect, useContext } from 'react';
import { subscribeToAuthChanges, logOut, getCurrentUser } from '../../services/authService';
import AuthModal from '../Authentication/AuthModal';
import { ThemeContext } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ onReportIssue, onShowScenicViews, showingScenicViews }) => {
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Subscribe to authentication state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignupClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logOut();
  };

  return (
    <>
      <nav className={`navbar ${theme}`}>
        <div className="navbar-brand">
          <span className="logo">🚶</span>
          <h1>WalkScore AI</h1>
        </div>

        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>

        <div className="menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
          <button 
            className={`scenic-views-btn ${showingScenicViews ? 'active' : ''}`} 
            onClick={onShowScenicViews}
          >
            {showingScenicViews ? 'Hide Scenic Views' : 'Show Scenic Views'}
          </button>

          <button className="report-btn" onClick={onReportIssue}>
            Report Issue
          </button>

          {user ? (
            <div className="auth-section">
              <div className="user-greeting">
                {user.displayName ? `Hi, ${user.displayName.split(' ')[0]}` : 'My Account'}
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-section">
              <button className="login-btn" onClick={handleLoginClick}>
                Login
              </button>
              <button className="signup-btn" onClick={handleSignupClick}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <AuthModal 
        show={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode} 
      />
    </>
  );
};

export default Navbar;