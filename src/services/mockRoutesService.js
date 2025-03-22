// src/services/mockRoutesService.js
import { getWalkabilityScore } from './mockWalkabilityService';
import { KEAN_UNIVERSITY_CENTER, keanDestinations } from '../data/keanUniversityData';

// Helper function to generate a mock route
const generateRoute = (startLat, startLng, endLat, endLng, routeType = 'fastest') => {
  // Create a mock route with waypoints
  const points = [];
  const pointCount = 8; // Number of points in our route
  
  // For Kean University, we want paths to follow more realistic campus routes
  // We'll add some "waypoints" that routes tend to follow on campus
  const campusWaypoints = [
    // Main walking paths through campus (approximate coordinates)
    [40.6774, -74.2387], // Central pathway
    [40.6769, -74.2399], // Path near STEM building 
    [40.6764, -74.2373], // East-west path
    [40.6781, -74.2381]  // North-south path
  ];
  
  for (let i = 0; i <= pointCount; i++) {
    const ratio = i / pointCount;
    const lat = startLat + (endLat - startLat) * ratio;
    const lng = startLng + (endLng - startLng) * ratio;
    
    // Add some randomness to make it look more like a real route
    // More randomness for 'scenic' routes, less for 'fastest'
    let jitterFactor = 0.0005;
    if (routeType === 'scenic') jitterFactor = 0.002;
    if (routeType === 'safest') jitterFactor = 0.001;
    
    const jitterLat = (Math.random() - 0.5) * jitterFactor;
    const jitterLng = (Math.random() - 0.5) * jitterFactor;
    
    points.push([lat + jitterLat, lng + jitterLng]);
  }
  
  // Ensure start and end points are exact
  points[0] = [startLat, startLng];
  points[points.length - 1] = [endLat, endLng];
  
  // Calculate approximate distance and time
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const [lat1, lng1] = points[i-1];
    const [lat2, lng2] = points[i];
    
    // Simple distance calculation (not accounting for Earth's curvature)
    const latDiff = lat2 - lat1;
    const lngDiff = lng2 - lng1;
    const segmentDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
    
    totalDistance += segmentDistance;
  }
  
  // Walking speed averages 5 km/h, so 1 km takes 12 minutes
  const walkingTimeMinutes = Math.round(totalDistance * 12);
  
  return {
    points,
    distance: totalDistance.toFixed(2),
    duration: walkingTimeMinutes,
    routeType
  };
};

// Get the walkability scores along a route
const evaluateRouteWalkability = async (routePoints) => {
  const scorePromises = [];
  
  // Sample points along the route to check walkability
  // For efficiency, we don't check every point, just a sampling
  const samplePoints = routePoints.filter((_, index) => 
    index === 0 || 
    index === routePoints.length - 1 || 
    index % 2 === 0 // Every other point
  );
  
  for (const [lat, lng] of samplePoints) {
    scorePromises.push(getWalkabilityScore(lat, lng));
  }
  
  const scoreResults = await Promise.all(scorePromises);
  
  // Calculate average scores along the route
  let sidewalkSum = 0;
  let crosswalkSum = 0;
  let lightingSum = 0;
  let transitSum = 0;
  let overallSum = 0;
  let validScoreCount = 0;
  
  scoreResults.forEach(result => {
    if (result.success) {
      sidewalkSum += result.score.sidewalkScore;
      crosswalkSum += result.score.crosswalkScore;
      lightingSum += result.score.lightingScore;
      transitSum += result.score.transitScore;
      overallSum += result.score.overallScore;
      validScoreCount++;
    }
  });
  
  if (validScoreCount === 0) {
    return {
      success: false,
      error: "Could not evaluate route walkability"
    };
  }
  
  return {
    success: true,
    averageScores: {
      overall: Math.round(overallSum / validScoreCount),
      sidewalk: Math.round(sidewalkSum / validScoreCount),
      crosswalk: Math.round(crosswalkSum / validScoreCount),
      lighting: Math.round(lightingSum / validScoreCount),
      transit: Math.round(transitSum / validScoreCount)
    },
    // Include individual point scores for detailed analysis
    pointScores: scoreResults.filter(r => r.success).map(r => r.score)
  };
};

// Generate routes optimized for different preferences
export const getOptimizedRoute = async (startLat, startLng, endLat, endLng, preference = 'fastest') => {
  try {
    // Convert string coordinates to numbers
    startLat = parseFloat(startLat);
    startLng = parseFloat(startLng);
    endLat = parseFloat(endLat);
    endLng = parseFloat(endLng);
    
    if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
      throw new Error("Invalid coordinates provided");
    }
    
    // Add a delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate route based on preference
    const routeData = generateRoute(startLat, startLng, endLat, endLng, preference);
    
    // Then evaluate walkability along this route
    const walkabilityEvaluation = await evaluateRouteWalkability(routeData.points);
    
    if (!walkabilityEvaluation.success) {
      throw new Error(walkabilityEvaluation.error);
    }
    
    // Generate route warnings based on walkability scores
    const warnings = [];
    const scores = walkabilityEvaluation.averageScores;
    
    if (scores.lighting < 60) {
      warnings.push("Parts of this route have limited lighting and may be less safe at night.");
    }
    
    if (scores.sidewalk < 60) {
      warnings.push("Sidewalk conditions along this route may be poor or incomplete.");
    }
    
    if (scores.crosswalk < 60) {
      warnings.push("Some crosswalks along this route may lack proper markings or signals.");
    }
    
    // Save to history in mock storage (would be Firebase in production)
    console.log("Route calculated (mock):", {
      startLocation: [startLat, startLng],
      endLocation: [endLat, endLng],
      preference: preference,
      distance: routeData.distance,
      duration: routeData.duration,
      walkabilityScore: scores.overall
    });
    
    return {
      success: true,
      route: {
        points: routeData.points,
        distance: `${routeData.distance} km`,
        duration: `${routeData.duration} minutes`,
        walkabilityScore: scores.overall,
        detailedScores: scores,
        warnings: warnings,
        routeType: preference
      }
    };
  } catch (error) {
    console.error("Error generating optimized route:", error);
    return {
      success: false,
      error: error.message || "Failed to generate route"
    };
  }
};

// Get route suggestions based on user's current location
export const getRouteSuggestions = async (latitude, longitude) => {
  try {
    // Make sure we have valid coordinates
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error("Invalid coordinates provided");
    }
    
    // Add a delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data for popular destinations
    const mockDestinations = [
      {
        name: "Central Park",
        type: "park",
        location: [latitude + 0.01, longitude + 0.01],
        walkabilityScore: 85,
        distance: "1.2 km"
      },
      {
        name: "Downtown Shopping Center",
        type: "shopping",
        location: [latitude - 0.005, longitude + 0.008],
        walkabilityScore: 78,
        distance: "0.8 km"
      },
      {
        name: "Public Library",
        type: "culture",
        location: [latitude + 0.007, longitude - 0.003],
        walkabilityScore: 92,
        distance: "0.9 km"
      },
      {
        name: "Coffee Shop",
        type: "dining",
        location: [latitude - 0.002, longitude - 0.004],
        walkabilityScore: 88,
        distance: "0.5 km"
      }
    ];
    
    return {
      success: true,
      suggestions: mockDestinations
    };
  } catch (error) {
    console.error("Error getting route suggestions:", error);
    return {
      success: false,
      error: error.message || "Failed to get suggestions"
    };
  }
};

// Get user's route history (mock)
export const getUserRouteHistory = async () => {
  try {
    // Add a delay for realism
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock route history data
    const mockHistory = [
      {
        id: 'route-1',
        startLocation: [40.7128, -74.0060],
        endLocation: [40.7193, -73.9997],
        preference: 'fastest',
        distance: '1.2',
        duration: 15,
        walkabilityScore: 82,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'route-2',
        startLocation: [40.7128, -74.0060],
        endLocation: [40.7230, -74.0080],
        preference: 'safest',
        distance: '1.5',
        duration: 18,
        walkabilityScore: 76,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return {
      success: true,
      history: mockHistory
    };
  } catch (error) {
    console.error("Error getting user route history:", error);
    return {
      success: false,
      error: error.message || "Failed to get route history"
    };
  }
};