// src/components/Map/Map.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Analysis pin icon
const analysisIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// This component will handle map position updates
function SetViewOnChange({ coords }) {
  const map = useMap();
  map.setView(coords, map.getZoom());
  return null;
}

// This component handles map click events
function MapClickHandler({ 
  isSettingDestination, 
  onMapClick,
  isAnalysisMode,
  onAnalysisClick
}) {
  const map = useMapEvents({
    click: (e) => {
      if (isSettingDestination) {
        onMapClick(e);
      } else if (isAnalysisMode) {
        onAnalysisClick(e);
      }
    }
  });
  
  return null;
}

const WalkabilityMap = ({ 
  walkabilityData, 
  onAreaSelect, 
  selectedRouteType, 
  userLocation,
  selectedRoute,
  onCalculateRoute,
  onRequestWalkabilityData
}) => {
  // Default coordinates (can be set to user's location later)
  const [position, setPosition] = useState([40.7128, -74.0060]); // NYC default
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [isSettingDestination, setIsSettingDestination] = useState(false);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [analysisMarker, setAnalysisMarker] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef(null);

  // Check if we're on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile(); // Check on initial load
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update position when userLocation changes
  useEffect(() => {
    if (userLocation) {
      setPosition(userLocation);
    }
  }, [userLocation]);
  
  // Clear destination marker when route is no longer selected
  useEffect(() => {
    if (!selectedRoute) {
      setDestinationMarker(null);
      setDestinationAddress('');
    }
  }, [selectedRoute]);

  // Get color based on walkability score
  const getScoreColor = (score) => {
    if (score >= 70) return '#4CAF50'; // Green
    if (score >= 40) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  // Handle map click for setting destination
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setDestinationMarker([lat, lng]);
    
    // Calculate route if we have both origin and destination
    if (userLocation) {
      onCalculateRoute(userLocation, [lat, lng]);
    }
    
    setIsSettingDestination(false);
  };

  // Handle map click for analysis
  const handleAnalysisClick = (e) => {
    const { lat, lng } = e.latlng;
    
    // Set the analysis marker
    setAnalysisMarker([lat, lng]);
    
    // Request walkability data for this location
    if (onRequestWalkabilityData) {
      onRequestWalkabilityData(lat, lng);
      
      // Clear the marker after a short delay (enough time for visual feedback)
      setTimeout(() => {
        setAnalysisMarker(null);
      }, 500);
    }
    
    // Exit analysis mode
    setIsAnalysisMode(false);
  };

  // Handle setting destination from address search
  const handleAddressSearch = async (e) => {
    e.preventDefault();
    
    if (!destinationAddress.trim()) return;
    
    try {
      // In a real app, this would use a geocoding service like Google Maps or Mapbox
      // For the MVP, we'll simulate a geocoding response
      
      // Random location within ~1km of the user's location
      const jitterLat = (Math.random() - 0.5) * 0.02;
      const jitterLng = (Math.random() - 0.5) * 0.02;
      
      const geocodedLocation = [
        position[0] + jitterLat,
        position[1] + jitterLng
      ];
      
      setDestinationMarker(geocodedLocation);
      
      // Calculate route if we have both origin and destination
      if (userLocation) {
        onCalculateRoute(userLocation, geocodedLocation);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      alert("Could not find that address. Please try another location.");
    }
  };

  // Create a custom score marker icon with improved mobile interactions
  const createScoreMarkerIcon = (score) => {
    const scoreColor = getScoreColor(score);
    
    return L.divIcon({
      className: `score-marker ${isMobile ? 'score-marker-mobile' : ''}`,
      html: `<div style="background-color: ${scoreColor};">${score}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  return (
    <div className="map-container theme">
      <div className="destination-controls theme">
        <form onSubmit={handleAddressSearch} className="destination-search">
          <input
            type="text"
            placeholder="Enter destination address..."
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
          />
          <button type="submit">Find Route</button>
        </form>
        <div className="destination-buttons">
          <button 
            className={`set-destination-btn ${isSettingDestination ? 'active' : ''}`} 
            onClick={() => {
              setIsSettingDestination(!isSettingDestination);
              if (!isSettingDestination) {
                setIsAnalysisMode(false);
              }
            }}
          >
            {isSettingDestination ? 'Click on map to set destination' : 'Set destination on map'}
          </button>
          
          <button 
            className={`analysis-btn ${isAnalysisMode ? 'active' : ''}`}
            onClick={() => {
              setIsAnalysisMode(!isAnalysisMode);
              if (!isAnalysisMode) {
                setIsSettingDestination(false);
              }
            }}
          >
            {isAnalysisMode ? 'Click on map to analyze' : 'Analyze any location'}
          </button>
          

        </div>
      </div>
      
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }} 
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Add the map click handlers */}
        <MapClickHandler 
          isSettingDestination={isSettingDestination}
          isAnalysisMode={isAnalysisMode}
          onMapClick={handleMapClick}
          onAnalysisClick={handleAnalysisClick}
        />
        
        {/* Update view when position changes */}
        <SetViewOnChange coords={position} />
        
        {/* User's current location */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              You are here
            </Popup>
          </Marker>
        )}
        
        {/* Destination marker */}
        {destinationMarker && (
          <Marker position={destinationMarker}>
            <Popup>
              Destination
            </Popup>
          </Marker>
        )}
        
        {/* Analysis marker */}
        {analysisMarker && (
          <Marker position={analysisMarker} icon={analysisIcon}>
            <Popup>
              Analyzing walkability here
            </Popup>
          </Marker>
        )}
        
        {/* Display walkability score markers */}
        {walkabilityData.map(point => (
          <Marker 
            key={point.id} 
            position={point.position}
            icon={createScoreMarkerIcon(point.score)}
            eventHandlers={{
              click: () => {
                onAreaSelect(point.id);
                // On mobile, we don't want to show the popup to avoid confusing the user
                if (isMobile && mapRef.current) {
                  const map = mapRef.current;
                  map._leaflet_id && map._leaflet.closePopup();
                }
              }
            }}
          >
            {!isMobile && (
              <Popup>
                <div>
                  <h3>Walkability Score: {point.score}/100</h3>
                  <p>{point.description}</p>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
        
        {/* Display selected route */}
        {selectedRoute && (
          <Polyline 
            positions={selectedRoute} 
            color={selectedRouteType === 'safest' ? '#4CAF50' : 
                  selectedRouteType === 'scenic' ? '#3F51B5' : 
                  selectedRouteType === 'accessible' ? '#9C27B0' : 
                  '#3388ff'} 
            weight={6} 
            opacity={0.7} 
          />
        )}
      </MapContainer>
      
      <div className="walkability-legend">
        <h4>Walkability Score</h4>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
          <span>Good (70-100)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FFC107' }}></div>
          <span>Moderate (40-69)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
          <span>Poor (0-39)</span>
        </div>
      </div>
      
      {isAnalysisMode && (
        <div className="analysis-overlay">
          <div className="analysis-instructions">
            <p>Click anywhere on the map to analyze walkability</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkabilityMap;