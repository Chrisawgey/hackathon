// src/App.js
import React, { useState, useEffect } from 'react';
import WalkabilityMap from './components/Map/Map';
import Navbar from './components/Navigation/Navbar';
import ScoreDisplay from './components/ScoreDisplay/ScoreDisplay';
import ReportForm from './components/UserReports/ReportForm';
import { getWalkabilityData, getAreaById, submitReport, getRouteRecommendation } from './services/mapService';
import { calculateWalkabilityScore, getOptimizedRoute } from './services/aiService';
import './App.css';

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [routeType, setRouteType] = useState('fastest');
  const [walkabilityData, setWalkabilityData] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const data = await getWalkabilityData(latitude, longitude);
      setWalkabilityData(data);
    } catch (error) {
      console.error("Error loading walkability data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting an area on the map
  const handleAreaSelect = async (areaId) => {
    try {
      const areaData = await getAreaById(areaId);
      setSelectedArea(areaData);
    } catch (error) {
      console.error("Error fetching area details:", error);
    }
  };

  // Handle route type change
  const handleRouteTypeChange = (type) => {
    setRouteType(type);
    // In a real app, this would trigger new route calculations
    console.log(`Route type changed to: ${type}`);
  };

  // Handle report submission
  const handleReportSubmit = async (reportData) => {
    try {
      const response = await submitReport(reportData);
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
        onReportIssue={() => setShowReportForm(true)}
      />
      
      <div className="main-content">
        <div className="map-section">
          <WalkabilityMap 
            walkabilityData={walkabilityData}
            onAreaSelect={handleAreaSelect}
            selectedRouteType={routeType}
            userLocation={userLocation}
          />
          
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading walkability data...</p>
            </div>
          )}
        </div>
        
        <div className="info-panel">
          <ScoreDisplay 
            selectedArea={selectedArea}
          />
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