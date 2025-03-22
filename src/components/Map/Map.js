// src/components/Map/Map.js
import React, { useState, useEffect } from 'react';
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

// This component will handle map position updates
function SetViewOnChange({ coords }) {
  const map = useMap();
  map.setView(coords, map.getZoom());
  return null;
}

const WalkabilityMap = () => {
  // Default coordinates (can be set to user's location later)
  const [position, setPosition] = useState([40.7128, -74.0060]); // NYC default
  const [walkabilityData, setWalkabilityData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Detect user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Mock walkability data for demonstration
  useEffect(() => {
    // This would come from our AI model and Firebase in the real app
    const mockWalkabilityData = [
      { id: 1, position: [40.7135, -74.0070], score: 85, description: "Great walkability, wide sidewalks" },
      { id: 2, position: [40.7140, -74.0050], score: 45, description: "Poor crosswalks, limited accessibility" },
      { id: 3, position: [40.7120, -74.0040], score: 68, description: "Good sidewalks, some obstructions" },
      { id: 4, position: [40.7115, -74.0080], score: 92, description: "Excellent pedestrian area, well lit" },
      { id: 5, position: [40.7150, -74.0070], score: 32, description: "Construction blocking sidewalks" }
    ];
    
    setWalkabilityData(mockWalkabilityData);
  }, []);

  // Get color based on walkability score
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Yellow
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div className="map-container">
      <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Update view when position changes */}
        <SetViewOnChange coords={position} />
        
        {/* User's current location */}
        <Marker position={position}>
          <Popup>
            You are here
          </Popup>
        </Marker>
        
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
          >
            <Popup>
              <div>
                <h3>Walkability Score: {point.score}/100</h3>
                <p>{point.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Display selected route (would come from the AI recommendations) */}
        {selectedRoute && (
          <Polyline positions={selectedRoute} color="#3388ff" weight={6} opacity={0.7} />
        )}
      </MapContainer>
    </div>
  );
};

export default WalkabilityMap;