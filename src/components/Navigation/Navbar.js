// src/components/Navigation/Navbar.js
import React, { useState, useEffect } from 'react';
import { subscribeToAuthChanges, logOut, getCurrentUser } from '../../services/authService';
import AuthModal from '../Authentication/AuthModal';
import './Navbar.css';

const Navbar = ({ onRouteTypeChange, onReportIssue, onShowScenicViews, showingScenicViews }) => {
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

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
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="logo">🚶</span>
          <h1>WalkScore AI</h1>
        </div>

        <div className="menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
          <div className="route-selection">
            <label>Route Type:</label>
            <select onChange={(e) => onRouteTypeChange(e.target.value)}>
              <option value="fastest">Fastest</option>
              <option value="safest">Safest</option>
              <option value="scenic">Most Scenic</option>
              <option value="accessible">Most Accessible</option>
            </select>
          </div>

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
              <button className="profile-btn">My Profile</button>
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