// src/components/ScenicViews/ScenicViews.js
import React from 'react';
import './ScenicViews.css';

const ScenicViews = () => {
  const scenicSpots = [
    {
      id: 1,
      name: "Liberty Hall Museum Gardens",
      description: "Historic gardens with seasonal flowers and trees",
      walkabilityScore: 88,
      bestTimeToVisit: "Spring and Fall",
    },
    {
      id: 2,
      name: "Elizabeth River Trail",
      description: "Peaceful pathway along the river with natural views",
      walkabilityScore: 82,
      bestTimeToVisit: "Morning or late afternoon",
    },
    {
      id: 3,
      name: "Kean University Quad",
      description: "Open green space in the heart of campus",
      walkabilityScore: 95,
      bestTimeToVisit: "Midday",
    },
    {
      id: 4,
      name: "Merck Building Overlook",
      description: "Modern architecture with scenic campus views",
      walkabilityScore: 90,
      bestTimeToVisit: "Sunset",
    }
  ];

  return (
    <div className="scenic-views">
      <h2>Scenic Walking Spots Near Kean University</h2>
      <p className="scenic-intro">
        Discover these beautiful locations perfect for walking around Kean University campus.
        Each location has been rated for walkability and best visiting times.
      </p>
      
      <div className="scenic-spots-container">
        {scenicSpots.map(spot => (
          <div key={spot.id} className="scenic-spot">
            <div className="scenic-spot-placeholder">
              {/* In a real app, this would be an actual image */}
              <div className="placeholder-text">{spot.name}</div>
            </div>
            <div className="scenic-details">
              <h3>{spot.name}</h3>
              <p>{spot.description}</p>
              <div className="scenic-meta">
                <span className="walkability">
                  <strong>Walkability:</strong> {spot.walkabilityScore}/100
                </span>
                <span className="best-time">
                  <strong>Best Time:</strong> {spot.bestTimeToVisit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="scenic-tips">
        <h3>Walking Tips for Kean University</h3>
        <ul>
          <li>The campus is generally flat and easy to navigate</li>
          <li>Well-lit paths make evening walks safe</li>
          <li>Most scenic areas are accessible from the main campus</li>
          <li>Consider using the campus shuttle for longer distances</li>
          <li>Liberty Hall Museum area is particularly beautiful in spring</li>
        </ul>
      </div>
    </div>
  );
};

export default ScenicViews;