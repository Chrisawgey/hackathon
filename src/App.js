// src/App.js - Updated to support analyzing any location
import React, { useState, useEffect } from 'react';
import WalkabilityMap from './components/Map/Map';
import Navbar from './components/Navigation/Navbar';
import ScoreDisplay from './components/ScoreDisplay/ScoreDisplay';
import ReportForm from './components/UserReports/ReportForm';
import ScenicViews from './components/ScenicViews/ScenicViews';
import { subscribeToAuthChanges } from './services/authService';
import { submitWalkabilityReport } from './services/mockReportsService'; // Changed from reportsService to mockReportsService
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
  const [showScenicViews, setShowScenicViews] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true); // Track panel visibility
  const [isMobile, setIsMobile] = useState(false); // Track if we're on mobile
  
  // Check if we're on mobile and update state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // On mobile, default to having the panel hidden
      if (window.innerWidth <= 768) {
        setShowInfoPanel(false);
      } else {
        setShowInfoPanel(true);
      }
    };
    
    checkMobile(); // Check on initial load
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          // Default to Kean University if location access is denied
          const keanUniversityCoords = [40.6769, -74.2390]; // Kean University coordinates
          setUserLocation(keanUniversityCoords);
          loadWalkabilityData(keanUniversityCoords[0], keanUniversityCoords[1]);
        }
      );
    } else {
      // Geolocation not supported
      const keanUniversityCoords = [40.6769, -74.2390]; // Kean University coordinates
      setUserLocation(keanUniversityCoords);
      loadWalkabilityData(keanUniversityCoords[0], keanUniversityCoords[1]);
    }
  }, []);

  // Function to load walkability data for any location
  const loadWalkabilityData = async (latitude, longitude, shouldSelectArea = true) => {
    setLoading(true);
    try {
      // Get walkability score from the walkability service
      const scoreResult = await getWalkabilityScore(latitude, longitude);
      
      if (scoreResult.success) {
        // Create a data object for the new location
        const newScoreData = {
          id: scoreResult.score.id || `location-${Date.now()}`,
          position: [scoreResult.score.location.latitude || latitude, 
                     scoreResult.score.location.longitude || longitude],
          score: scoreResult.score.overallScore,
          description: scoreResult.score.aiInsights,
          name: `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          ...scoreResult.score
        };
        
        // Check if we already have this area in our data
        const existingAreaIndex = walkabilityData.findIndex(
          area => area.id === newScoreData.id
        );
        
        let updatedWalkabilityData;
        
        if (existingAreaIndex >= 0) {
          // Update existing area
          updatedWalkabilityData = [...walkabilityData];
          updatedWalkabilityData[existingAreaIndex] = newScoreData;
        } else {
          // Add new area
          updatedWalkabilityData = [...walkabilityData, newScoreData];
        }
        
        setWalkabilityData(updatedWalkabilityData);
        
        // If shouldSelectArea is true, select this area to show its details
        if (shouldSelectArea) {
          setSelectedArea(newScoreData);
          
          // On mobile, show the info panel when a new area is selected
          if (isMobile) {
            setShowInfoPanel(true);
          }
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
      // On mobile, show the info panel when an area is selected
      if (isMobile) {
        setShowInfoPanel(true);
      }
    }
  };
  
  // Handle removing a selected area
  const handleRemoveArea = (areaId) => {
    // Remove from walkability data
    setWalkabilityData(walkabilityData.filter(area => area.id !== areaId));
    
    // If this was the currently selected area, clear the selection
    if (selectedArea && selectedArea.id === areaId) {
      setSelectedArea(null);
    }
  };
  
  // Handle analyzing a new location
  const handleAnalyzeLocation = (latitude, longitude) => {
    // Load walkability data for the selected location
    loadWalkabilityData(latitude, longitude);
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
        
        // On mobile, show the info panel when a route is calculated
        if (isMobile) {
          setShowInfoPanel(true);
        }
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

  // Handle selecting a scenic spot as a destination
  const handleScenicSpotSelect = (location, name) => {
    if (location && location.length === 2) {
      // Calculate route from user location to the scenic spot
      if (userLocation) {
        calculateRoute(userLocation, location);
        
        // Hide the scenic views panel after selection
        setShowScenicViews(false);
      } else {
        alert("Could not determine your current location. Please try again.");
      }
    }
  };

  // Toggle the info panel visibility (mainly for mobile)
  const toggleInfoPanel = () => {
    setShowInfoPanel(!showInfoPanel);
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
        onShowScenicViews={() => {
          setShowScenicViews(!showScenicViews);
          // On mobile, always show the panel when scenic views is activated
          if (isMobile && !showScenicViews) {
            setShowInfoPanel(true);
          }
        }}
        showingScenicViews={showScenicViews}
      />
      
      <div className="main-content">
        <div className={`map-section ${isMobile && showInfoPanel ? 'map-section-collapsed' : ''}`}>
          <WalkabilityMap 
            walkabilityData={walkabilityData}
            onAreaSelect={handleAreaSelect}
            selectedRouteType={routeType}
            userLocation={userLocation}
            selectedRoute={selectedRoute ? selectedRoute.points : null}
            onCalculateRoute={calculateRoute}
            onRequestWalkabilityData={handleAnalyzeLocation}
          />
          
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading walkability data...</p>
            </div>
          )}
        </div>
        
        {/* Mobile toggle button for info panel */}
        {isMobile && selectedArea && !showInfoPanel && (
          <button 
            className="mobile-panel-toggle show-panel" 
            onClick={toggleInfoPanel}
            aria-label="Show details"
          >
            <span>↑ View Details ↑</span>
          </button>
        )}
        
        <div className={`info-panel ${!showInfoPanel ? 'info-panel-hidden' : ''}`}>
          {isMobile && (
            <button 
              className="mobile-panel-close"
              onClick={toggleInfoPanel}
              aria-label="Close panel"
            >
              ×
            </button>
          )}
          
          {showScenicViews ? (
            <ScenicViews onSelectDestination={handleScenicSpotSelect} />
          ) : selectedRoute ? (
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
              onRemoveArea={handleRemoveArea}
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