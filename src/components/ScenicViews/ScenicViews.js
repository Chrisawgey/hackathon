// src/components/ScenicViews/ScenicViews.js
import React from 'react';
import './ScenicViews.css';

const ScenicViews = ({ onSelectDestination }) => {
  const scenicSpots = [
    {
      id: 1,
      name: "Liberty Hall Museum Gardens",
      description: "Historic gardens with seasonal flowers and trees. Perfect for a peaceful stroll with beautiful landscaping and historical significance.",
      walkabilityScore: 88,
      bestTimeToVisit: "Spring and Fall",
      location: [40.6730, -74.2330],
      distance: "0.8 km",
      features: ["Historical site", "Gardens", "Photography spots"]
    },
    {
      id: 2,
      name: "Elizabeth River Trail",
      description: "Peaceful pathway along the river with natural views. This scenic trail offers a tranquil escape with wildlife spotting opportunities.",
      walkabilityScore: 82,
      bestTimeToVisit: "Morning or late afternoon",
      location: [40.6800, -74.2340],
      distance: "0.5 km",
      features: ["River views", "Wildlife", "Jogging path"]
    },
    {
      id: 3,
      name: "Kean University Quad",
      description: "Open green space in the heart of campus. This central gathering place is surrounded by beautiful architecture and seasonal plantings.",
      walkabilityScore: 95,
      bestTimeToVisit: "Midday",
      location: [40.6774, -74.2392],
      distance: "0.1 km",
      features: ["Open space", "Campus views", "Social area"]
    },
    {
      id: 4,
      name: "Merck Building Overlook",
      description: "Modern architecture with scenic campus views. This elevated spot provides a panoramic perspective of the campus and surrounding area.",
      walkabilityScore: 90,
      bestTimeToVisit: "Sunset",
      location: [40.6766, -74.2404],
      distance: "0.2 km",
      features: ["Panoramic views", "Architecture", "Sunset spot"]
    }
  ];

  const handleSpotClick = (location, name) => {
    if (onSelectDestination) {
      onSelectDestination(location, name);
    }
  };

  return (
    <div className="scenic-views">
      <div className="scenic-header">
        <h2>Scenic Walking Spots</h2>
        <p className="scenic-intro">
          Discover beautiful locations perfect for walking around Kean University campus.
          Click on any spot to set it as your destination.
        </p>
      </div>
      
      <div className="scenic-spots-container">
        {scenicSpots.map(spot => (
          <div 
            key={spot.id} 
            className="scenic-spot"
            onClick={() => handleSpotClick(spot.location, spot.name)}
          >
            <div className="scenic-spot-image" style={{
              background: `linear-gradient(120deg, #28a745, #3a86ff)`
            }}>
              <div className="scenic-spot-badge">{spot.walkabilityScore}</div>
              <div className="scenic-spot-name">{spot.name}</div>
            </div>
            
            <div className="scenic-details">
              <p className="scenic-description">{spot.description}</p>
              
              <div className="scenic-features">
                {spot.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
              
              <div className="scenic-meta">
                <div className="meta-item">
                  <span className="meta-icon">🕒</span>
                  <span className="meta-label">Best time:</span>
                  <span className="meta-value">{spot.bestTimeToVisit}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span className="meta-label">Distance:</span>
                  <span className="meta-value">{spot.distance}</span>
                </div>
              </div>
              
              <button className="go-button">
                Set as Destination
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="scenic-tips">
        <h3>Walking Tips for Kean University</h3>
        <ul>
          <li>The campus is generally flat and easy to navigate, with most walking paths connecting major buildings</li>
          <li>Well-lit paths make evening walks safe and enjoyable, especially around the central campus area</li>
          <li>Most scenic areas are accessible within a 10-minute walk from the main campus</li>
          <li>Consider using the campus shuttle for longer distances during extreme weather</li>
          <li>Liberty Hall Museum area is particularly beautiful in spring when the gardens are in bloom</li>
        </ul>
      </div>
    </div>
  );
};

export default ScenicViews;