// src/components/Map/Map.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

// This component will handle map position updates
function SetViewOnChange({ coords }) {
  const map = useMap();
  map.setView(coords, map.getZoom());
  return null;
}

const WalkabilityMap = ({ 
  walkabilityData, 
  onAreaSelect, 
  selectedRouteType, 
  userLocation,
  selectedRoute,
  onCalculateRoute 
}) => {
  // Default coordinates (can be set to user's location later)
  const [position, setPosition] = useState([40.7128, -74.0060]); // NYC default
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [isSettingDestination, setIsSettingDestination] = useState(false);
  const mapRef = useRef(null);

  // Update position when userLocation changes
  useEffect(() => {
    if (userLocation) {
      setPosition(userLocation);
    }
  }, [userLocation]);

  // Get color based on walkability score
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Yellow
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  // Handle map click for setting destination
  const handleMapClick = (e) => {
    if (isSettingDestination) {
      const { lat, lng } = e.latlng;
      setDestinationMarker([lat, lng]);
      
      // Calculate route if we have both origin and destination
      if (userLocation) {
        onCalculateRoute(userLocation, [lat, lng]);
      }
      
      setIsSettingDestination(false);
    }
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

  return (
    <div className="map-container">
      <div className="destination-controls">
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
            onClick={() => setIsSettingDestination(!isSettingDestination)}
          >
            {isSettingDestination ? 'Click on map to set destination' : 'Set destination on map'}
          </button>
          {destinationMarker && (
            <button 
              className="clear-destination-btn" 
              onClick={() => {
                setDestinationMarker(null);
                setDestinationAddress('');
              }}
            >
              Clear destination
            </button>
          )}
        </div>
      </div>
      
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }} 
        ref={mapRef}
        whenCreated={(map) => {
          map.on('click', handleMapClick);
          mapRef.current = map;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
        
        {/* Display walkability score markers */}
        {walkabilityData.map(point => (
          <Marker 
            key={point.id} 
            position={point.position}
            icon={L.divIcon({
              className: 'score-marker',
              html: `<div style="background-color: ${getScoreColor(point.score)};">${point.score}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })}
            eventHandlers={{
              click: () => {
                onAreaSelect(point.id);
              }
            }}
          >
            <Popup>
              <div>
                <h3>Walkability Score: {point.score}/100</h3>
                <p>{point.description}</p>
              </div>
            </Popup>
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
          <span>Excellent (80-100)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FFC107' }}></div>
          <span>Good (60-79)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
          <span>Fair (40-59)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
          <span>Poor (0-39)</span>
        </div>
      </div>
    </div>
  );
};

export default WalkabilityMap;