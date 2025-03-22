// src/components/Map/RouteOptions.js
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import './RouteOptions.css';

const RouteOptions = ({ selectedRouteType, onRouteTypeChange }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`route-options-container ${theme}`}>
      <div className="route-options-header">
        <h3>Route Type</h3>
      </div>
      <div className="route-options-buttons">
        <button 
          className={`route-option ${selectedRouteType === 'fastest' ? 'active' : ''}`}
          onClick={() => onRouteTypeChange('fastest')}
        >
          <span className="route-option-icon">⚡</span>
          <span className="route-option-label">Fastest</span>
        </button>
        
        <button 
          className={`route-option ${selectedRouteType === 'safest' ? 'active' : ''}`}
          onClick={() => onRouteTypeChange('safest')}
        >
          <span className="route-option-icon">🛡️</span>
          <span className="route-option-label">Safest</span>
        </button>
        
        <button 
          className={`route-option ${selectedRouteType === 'scenic' ? 'active' : ''}`}
          onClick={() => onRouteTypeChange('scenic')}
        >
          <span className="route-option-icon">🌳</span>
          <span className="route-option-label">Scenic</span>
        </button>
        
        <button 
          className={`route-option ${selectedRouteType === 'accessible' ? 'active' : ''}`}
          onClick={() => onRouteTypeChange('accessible')}
        >
          <span className="route-option-icon">♿</span>
          <span className="route-option-label">Accessible</span>
        </button>
      </div>
    </div>
  );
};

export default RouteOptions;