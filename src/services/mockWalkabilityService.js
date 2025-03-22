// src/services/mockWalkabilityService.js
import { keanWalkabilityData, KEAN_UNIVERSITY_CENTER } from '../data/keanUniversityData';

// Find the closest Kean area to the given coordinates
const findClosestKeanArea = (latitude, longitude) => {
  let closestArea = null;
  let minDistance = Number.MAX_VALUE;
  
  keanWalkabilityData.forEach(area => {
    const latDiff = area.position[0] - latitude;
    const lngDiff = area.position[1] - longitude;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestArea = area;
    }
  });
  
  return {
    area: closestArea,
    distance: minDistance
  };
};

// Mock function to get walkability score without using Firebase
export const getWalkabilityScore = async (latitude, longitude) => {
  // Convert to numbers to ensure proper comparison
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      success: false,
      error: "Invalid coordinates provided"
    };
  }
  
  // Simulate some processing time to feel more realistic
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if this is close to a predefined Kean area
  const { area, distance } = findClosestKeanArea(latitude, longitude);
  
  // If we're within a reasonable distance of a predefined area, use that data
  if (area && distance < 0.01) { // ~1km threshold
    return {
      success: true,
      score: {
        id: area.id,
        location: { latitude: area.position[0], longitude: area.position[1] },
        name: area.name,
        overallScore: area.overallScore,
        sidewalkScore: area.sidewalkScore,
        crosswalkScore: area.crosswalkScore,
        lightingScore: area.lightingScore,
        transitScore: area.transitScore,
        airQualityScore: area.airQualityScore,
        aiInsights: area.aiInsights,
        calculatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        reportCount: area.userReports ? area.userReports.length : 0,
        userReports: area.userReports || []
      },
      fromCache: true
    };
  }
  
  // Generate a score based on the location (just for variety)
  // This uses the decimal part of the coordinates to create some variation
  const latSeed = Math.abs((latitude % 1) * 100);
  const lngSeed = Math.abs((longitude % 1) * 100);
  const randomSeed = (latSeed + lngSeed) / 2;
  
  // Base scores with some randomization
  const sidewalkScore = Math.round(70 + randomSeed % 20);
  const crosswalkScore = Math.round(65 + (randomSeed + 10) % 25);
  const lightingScore = Math.round(60 + (randomSeed + 20) % 30);
  const transitScore = Math.round(75 + (randomSeed + 30) % 15);
  const airQualityScore = Math.round(65 + (randomSeed + 40) % 25);
  
  // Calculate overall score with weighted average
  const overallScore = Math.round(
    (sidewalkScore * 0.3) + 
    (crosswalkScore * 0.25) + 
    (lightingScore * 0.2) + 
    (transitScore * 0.15) + 
    (airQualityScore * 0.1)
  );
  
  // Generate AI insights based on scores
  let insights = "";
  if (overallScore >= 80) {
    insights = "This area has excellent walkability with well-maintained sidewalks and infrastructure.";
  } else if (overallScore >= 70) {
    insights = "This area offers good walkability with some minor improvements needed.";
  } else if (overallScore >= 60) {
    insights = "This area has moderate walkability. Several issues need attention to improve pedestrian experience.";
  } else {
    insights = "This area has poor walkability and needs significant infrastructure improvements.";
  }
  
  // Add specific insights based on the lowest scoring category
  const scores = { sidewalkScore, crosswalkScore, lightingScore, transitScore, airQualityScore };
  const lowestScoreKey = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b);
  
  switch(lowestScoreKey) {
    case 'sidewalkScore':
      insights += " Sidewalk quality is the main concern in this area.";
      break;
    case 'crosswalkScore':
      insights += " Crosswalk safety needs improvement.";
      break;
    case 'lightingScore':
      insights += " Limited lighting makes this area less safe at night.";
      break;
    case 'transitScore':
      insights += " Public transit access is limited in this area.";
      break;
    case 'airQualityScore':
      insights += " Air quality concerns affect the overall walking experience.";
      break;
  }
  
  // Mock nearby reports
  const reports = [
    {
      type: 'sidewalk_issue',
      description: 'Cracked sidewalk near intersection',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      severity: 'medium'
    },
    {
      type: 'lighting_issue',
      description: 'Street light out on corner',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      severity: 'high'
    }
  ];
  
  // Only include reports if score is below 75
  const userReports = overallScore < 75 ? reports : [];
  
  return {
    success: true,
    score: {
      id: `score-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
      location: { latitude, longitude },
      overallScore,
      sidewalkScore,
      crosswalkScore,
      lightingScore,
      transitScore,
      airQualityScore,
      aiInsights: insights,
      calculatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      reportCount: userReports.length,
      userReports
    },
    fromCache: false
  };
};

// Get walkability scores within a bounding box (for map display)
export const getScoresInBoundingBox = async (swLat, swLng, neLat, neLng) => {
  // Generate a handful of scores within the bounding box
  const scores = [];
  const scoreCount = 5;
  
  for (let i = 0; i < scoreCount; i++) {
    // Create random points within the bounding box
    const lat = swLat + Math.random() * (neLat - swLat);
    const lng = swLng + Math.random() * (neLng - swLng);
    
    const result = await getWalkabilityScore(lat, lng);
    if (result.success) {
      scores.push(result.score);
    }
  }
  
  return {
    success: true,
    scores: scores
  };
};

// Update a walkability score with new report data
export const updateWalkabilityScore = async (latitude, longitude) => {
  // For the mock, we'll just get a fresh score
  return await getWalkabilityScore(latitude, longitude);
};