// src/components/ScoreDisplay/ScoreDisplay.js - Updated for dark mode
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import './ScoreDisplay.css';

const ScoreDisplay = ({ selectedArea, onRemoveArea }) => {
  const { theme } = useContext(ThemeContext);

  // If no area is selected, show a default message
  if (!selectedArea) {
    return (
      <div className={`score-display ${theme}`}>
        <div className="score-display-empty">
          <div className="empty-icon">🔍</div>
          <p>Select an area on the map to view detailed walkability scores or use the "Analyze any location" option</p>
        </div>
      </div>
    );
  }

  // Function to get status text based on score value
  const getStatusText = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Very Good";
    if (score >= 60) return "Good";
    if (score >= 50) return "Average";
    if (score >= 40) return "Below Average";
    if (score >= 30) return "Poor";
    return "Very Poor";
  };

  // Function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 60) return '#4CAF50'; // Green
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  // Handle removing the current area
  const handleRemove = () => {
    if (onRemoveArea && selectedArea) {
      onRemoveArea(selectedArea.id);
    }
  };

  return (
    <div className={`score-display ${theme}`}>
      <div className="score-header">
        <h2>Area Walkability Analysis</h2>
        <p className="location-name">{selectedArea.name || 'Selected Area'}</p>
        
        <button 
          className="remove-area-btn" 
          onClick={handleRemove}
          title="Remove this area from the map"
        >
          Remove from Map
        </button>
      </div>

      <div className="overall-score">
        <div 
          className="score-circle"
          style={{ 
            backgroundColor: getScoreColor(selectedArea.overallScore),
            color: selectedArea.overallScore >= 60 ? '#333' : 'white'
          }}
        >
          {selectedArea.overallScore}
        </div>
        <div className="score-details">
          <h3>Overall Walkability</h3>
          <p className="status">{getStatusText(selectedArea.overallScore)}</p>
        </div>
      </div>

      <div className="score-categories">
        <div className="category">
          <div className="category-header">
            <span className="category-icon">🚶</span>
            <h4>Sidewalks</h4>
          </div>
          <div className="score-bar-container">
            <div 
              className="score-bar" 
              style={{ 
                width: `${selectedArea.sidewalkScore}%`, 
                backgroundColor: getScoreColor(selectedArea.sidewalkScore) 
              }}
            ></div>
          </div>
          <span className="category-score">{getStatusText(selectedArea.sidewalkScore)}</span>
        </div>

        <div className="category">
          <div className="category-header">
            <span className="category-icon">🚥</span>
            <h4>Crosswalks</h4>
          </div>
          <div className="score-bar-container">
            <div 
              className="score-bar" 
              style={{ 
                width: `${selectedArea.crosswalkScore}%`, 
                backgroundColor: getScoreColor(selectedArea.crosswalkScore) 
              }}
            ></div>
          </div>
          <span className="category-score">{getStatusText(selectedArea.crosswalkScore)}</span>
        </div>

        <div className="category">
          <div className="category-header">
            <span className="category-icon">🔦</span>
            <h4>Lighting</h4>
          </div>
          <div className="score-bar-container">
            <div 
              className="score-bar" 
              style={{ 
                width: `${selectedArea.lightingScore}%`, 
                backgroundColor: getScoreColor(selectedArea.lightingScore) 
              }}
            ></div>
          </div>
          <span className="category-score">{getStatusText(selectedArea.lightingScore)}</span>
        </div>

        <div className="category">
          <div className="category-header">
            <span className="category-icon">🚌</span>
            <h4>Transit Access</h4>
          </div>
          <div className="score-bar-container">
            <div 
              className="score-bar" 
              style={{ 
                width: `${selectedArea.transitScore}%`, 
                backgroundColor: getScoreColor(selectedArea.transitScore) 
              }}
            ></div>
          </div>
          <span className="category-score">{getStatusText(selectedArea.transitScore)}</span>
        </div>

        <div className="category">
          <div className="category-header">
            <span className="category-icon">🌿</span>
            <h4>Air Quality</h4>
          </div>
          <div className="score-bar-container">
            <div 
              className="score-bar" 
              style={{ 
                width: `${selectedArea.airQualityScore}%`, 
                backgroundColor: getScoreColor(selectedArea.airQualityScore) 
              }}
            ></div>
          </div>
          <span className="category-score">{getStatusText(selectedArea.airQualityScore)}</span>
        </div>
      </div>

      <div className="ai-insights">
        <h3>AI Insights</h3>
        <div className="insight-content">
          <p>{selectedArea.aiInsights || "Our AI has analyzed this area and found it to be generally safe for pedestrians, with adequate sidewalk coverage. Consider using caution at night due to limited street lighting in some sections."}</p>
        </div>
      </div>

      <div className="user-reports">
        <h3>Recent User Reports</h3>
        {selectedArea.userReports && selectedArea.userReports.length > 0 ? (
          <ul className="reports-list">
            {selectedArea.userReports.map((report, index) => (
              <li key={index} className="report-item">
                <div className="report-header">
                  <span className="report-type" style={{
                    backgroundColor: report.type.includes('light') ? '#FFC107' :
                                     report.type.includes('sidewalk') ? '#4CAF50' :
                                     report.type.includes('cross') ? '#3F51B5' : '#FF5722'
                  }}>
                    {report.type.replace('_', ' ')}
                  </span>
                  <span className="report-severity">Severity: {report.severity}</span>
                </div>
                <p className="report-description">{report.description}</p>
                <span className="report-date">{report.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-reports">
            <p>No recent reports for this area</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;