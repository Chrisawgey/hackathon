// src/components/Map/Map.js - Updated with RouteOptions
import React, { useState, useEffect, useRef, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ThemeContext } from '../../context/ThemeContext';
import RouteOptions from './RouteOptions';
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
  onRequestWalkabilityData,
  onRouteTypeChange
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
  const { theme } = useContext(ThemeContext);
  
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

  const getRouteColor = (routeType) => {
    switch (routeType) {
      case 'safest':
        return '#4CAF50'; // Green
      case 'scenic':
        return '#3F51B5'; // Indigo
      case 'accessible':
        return '#9C27B0'; // Purple
      default:
        return '#3a86ff'; // Blue (fastest)
    }
  };

  // Get the appropriate tile layer based on theme
  const getTileLayer = () => {
    if (theme === 'dark') {
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  const getTileAttribution = () => {
    if (theme === 'dark') {
      return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  };

  // Show route options only when a route is active or we're setting a destination
  const showRouteOptions = selectedRoute || isSettingDestination || destinationMarker;

  return (
    <div className={`map-container ${theme}`}>
      <div className={`destination-controls ${theme}`}>
        <form onSubmit={handleAddressSearch} className="destination-search">
          <input
            type="text"
            placeholder="Enter destination address..."
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            aria-label="Destination address"
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
            {isSettingDestination ? 'Click on map' : 'Set destination'}
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
            {isAnalysisMode ? 'Click to analyze' : 'Analyze location'}
          </button>
          
          {(destinationMarker || selectedRoute) && (
            <button 
              className="clear-destination-btn"
              onClick={() => {
                setDestinationMarker(null);
                setDestinationAddress('');
                if (onCalculateRoute) {
                  // Clear the route by setting it to null
                  onCalculateRoute(null, null);
                }
              }}
            >
              Clear route
            </button>
          )}
        </div>
      </div>
      
      {/* Route options component */}
      {showRouteOptions && (
        <RouteOptions 
          selectedRouteType={selectedRouteType} 
          onRouteTypeChange={onRouteTypeChange} 
        />
      )}
      
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }} 
        ref={mapRef}
        zoomControl={!isMobile} // Hide default zoom controls on mobile
      >
        <TileLayer
          attribution={getTileAttribution()}
          url={getTileLayer()}
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
          <Marker 
            position={userLocation} 
            icon={userIcon}
            eventHandlers={{
              click: () => {
                if (mapRef.current) {
                  const leafletMap = mapRef.current.getContainer()._leaflet_id ? 
                    mapRef.current : mapRef.current._leafletMap;
                  if (leafletMap) {
                    leafletMap.closePopup();
                  }
                }
              }
            }}
          >
            <Popup>
              <div>You are here</div>
            </Popup>
          </Marker>
        )}
        
        {/* Destination marker */}
        {destinationMarker && (
          <Marker position={destinationMarker}>
            <Popup>
              <div>Destination</div>
            </Popup>
          </Marker>
        )}
        
        {/* Analysis marker */}
        {analysisMarker && (
          <Marker position={analysisMarker} icon={analysisIcon}>
            <Popup>
              <div>Analyzing walkability here</div>
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
                  const leafletMap = mapRef.current.getContainer()._leaflet_id ? 
                    mapRef.current : mapRef.current._leafletMap;
                  if (leafletMap) {
                    leafletMap.closePopup();
                  }
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
            color={getRouteColor(selectedRouteType)} 
            weight={6} 
            opacity={0.7} 
          />
        )}
      </MapContainer>
      
      <div className={`walkability-legend ${theme}`}>
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

      {/* Mobile-optimized zoom controls at bottom-right */}
      {isMobile && (
        <div className="mobile-zoom-controls">
          <button 
            className="zoom-control zoom-in"
            onClick={() => {
              if (mapRef.current) {
                const leafletMap = mapRef.current.getContainer()._leaflet_id ? 
                  mapRef.current : mapRef.current._leafletMap;
                if (leafletMap) {
                  leafletMap.zoomIn();
                }
              }
            }}
            aria-label="Zoom in"
          >
            +
          </button>
          <button 
            className="zoom-control zoom-out"
            onClick={() => {
              if (mapRef.current) {
                const leafletMap = mapRef.current.getContainer()._leaflet_id ? 
                  mapRef.current : mapRef.current._leafletMap;
                if (leafletMap) {
                  leafletMap.zoomOut();
                }
              }
            }}
            aria-label="Zoom out"
          >
            -
          </button>
        </div>
      )}
    </div>
  );
};

export default WalkabilityMap;