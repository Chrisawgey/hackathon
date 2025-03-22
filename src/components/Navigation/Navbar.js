// src/components/Navigation/Navbar.js
import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ onRouteTypeChange, onReportIssue }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mock login function (to be replaced with Firebase Auth)
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Mock logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
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

        <button className="report-btn" onClick={onReportIssue}>
          Report Issue
        </button>

        {isLoggedIn ? (
          <div className="auth-section">
            <button className="profile-btn">My Profile</button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-section">
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
            <button className="signup-btn">Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;