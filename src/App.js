// src/App.js
import React, { useState, useEffect } from 'react';
import WalkabilityMap from './components/Map/Map';
import Navbar from './components/Navigation/Navbar';
import ScoreDisplay from './components/ScoreDisplay/ScoreDisplay';
import ReportForm from './components/UserReports/ReportForm';
import { subscribeToAuthChanges } from './services/authService';
import { submitWalkabilityReport } from './services/reportsService';
import { getOptimizedRoute } from './services/routesService';
import { getWalkabilityScore } from './services/walkabilityService';
import './App.css';

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [routeType, setRouteType] = useState('fastest');
  const [walkabilityData, setWalkabilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  // Get user's location and load initial data
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          // Load walkability data for the user's location
          loadWalkabilityData(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to NYC if location access is denied
          setUserLocation([40.7128, -74.0060]);
          loadWalkabilityData(40.7128, -74.0060);
        }
      );
    } else {
      // Geolocation not supported
      setUserLocation([40.7128, -74.0060]);
      loadWalkabilityData(40.7128, -74.0060);
    }
  }, []);

  // Function to load walkability data
  const loadWalkabilityData = async (latitude, longitude) => {
    setLoading(true);
    try {
      // Get walkability score from the walkability service
      const scoreResult = await getWalkabilityScore(latitude, longitude);
      
      if (scoreResult.success) {
        // Transform the score into the format expected by the map component
        const scoreData = [{
          id: scoreResult.score.id || 'current-location',
          position: [scoreResult.score.location.latitude || latitude, 
                     scoreResult.score.location.longitude || longitude],
          score: scoreResult.score.overallScore,
          description: scoreResult.score.aiInsights,
          ...scoreResult.score
        }];
        
        setWalkabilityData(scoreData);
        
        // If there's a score, select it to show details
        if (scoreData.length > 0) {
          setSelectedArea(scoreData[0]);
        }
      } else {
        console.error("Error getting walkability score:", scoreResult.error);
      }
    } catch (error) {
      console.error("Error loading walkability data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting an area on the map
  const handleAreaSelect = async (areaId) => {
    // Find the area in the walkability data
    const area = walkabilityData.find(item => item.id === areaId);
    if (area) {
      setSelectedArea(area);
    }
  };

  // Handle route type change
  const handleRouteTypeChange = async (type) => {
    setRouteType(type);
    
    // If we have a selected route, recalculate with the new preference
    if (selectedRoute && selectedRoute.start && selectedRoute.end) {
      calculateRoute(selectedRoute.start, selectedRoute.end, type);
    }
  };

  // Function to calculate a route
  const calculateRoute = async (start, end, routePreference = routeType) => {
    setLoading(true);
    try {
      const result = await getOptimizedRoute(
        start[0], start[1], 
        end[0], end[1], 
        routePreference
      );
      
      if (result.success) {
        setSelectedRoute({
          start,
          end,
          preference: routePreference,
          ...result.route
        });
      } else {
        console.error("Error calculating route:", result.error);
        alert("Could not calculate route. Please try again.");
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (reportData) => {
    try {
      const response = await submitWalkabilityReport(reportData);
      if (response.success) {
        alert("Thank you for your report! It will help improve walkability in your area.");
        setShowReportForm(false);
        
        // Refresh walkability data to reflect new report
        if (userLocation) {
          loadWalkabilityData(userLocation[0], userLocation[1]);
        }
      } else {
        alert(`Failed to submit report: ${response.error}`);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred while submitting your report. Please try again.");
    }
  };

  return (
    <div className="app">
      <Navbar 
        onRouteTypeChange={handleRouteTypeChange}
        onReportIssue={() => {
          if (!user) {
            alert("Please log in to report an issue");
            return;
          }
          setShowReportForm(true);
        }}
      />
      
      <div className="main-content">
        <div className="map-section">
          <WalkabilityMap 
            walkabilityData={walkabilityData}
            onAreaSelect={handleAreaSelect}
            selectedRouteType={routeType}
            userLocation={userLocation}
            selectedRoute={selectedRoute ? selectedRoute.points : null}
            onCalculateRoute={calculateRoute}
          />
          
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading walkability data...</p>
            </div>
          )}
        </div>
        
        <div className="info-panel">
          {selectedRoute ? (
            <div className="route-info">
              <div className="route-info-header">
                <h3>Route Information</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setSelectedRoute(null)}
                >×</button>
              </div>
              
              <div className="route-metrics">
                <div className="metric">
                  <div className="metric-value">{selectedRoute.distance}</div>
                  <div className="metric-label">Distance</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{selectedRoute.duration}</div>
                  <div className="metric-label">Walking Time</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{selectedRoute.walkabilityScore}</div>
                  <div className="metric-label">Walkability</div>
                </div>
              </div>
              
              <div className="route-preferences">
                <div className={`preference-option ${selectedRoute.routeType === 'fastest' ? 'active' : ''}`}
                  onClick={() => handleRouteTypeChange('fastest')}>
                  Fastest
                </div>
                <div className={`preference-option ${selectedRoute.routeType === 'safest' ? 'active' : ''}`}
                  onClick={() => handleRouteTypeChange('safest')}>
                  Safest
                </div>
                <div className={`preference-option ${selectedRoute.routeType === 'scenic' ? 'active' : ''}`}
                  onClick={() => handleRouteTypeChange('scenic')}>
                  Scenic
                </div>
                <div className={`preference-option ${selectedRoute.routeType === 'accessible' ? 'active' : ''}`}
                  onClick={() => handleRouteTypeChange('accessible')}>
                  Accessible
                </div>
              </div>
              
              {selectedRoute.warnings && selectedRoute.warnings.length > 0 && (
                <div className="route-warning">
                  <strong>Warning:</strong> {selectedRoute.warnings[0]}
                </div>
              )}
            </div>
          ) : (
            <ScoreDisplay 
              selectedArea={selectedArea}
            />
          )}
        </div>
      </div>
      
      {showReportForm && (
        <div className="modal-backdrop">
          <ReportForm 
            onSubmit={handleReportSubmit}
            onClose={() => setShowReportForm(false)}
            currentLocation={userLocation}
          />
        </div>
      )}
    </div>
  );
}

export default App;