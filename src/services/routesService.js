// src/services/routesService.js
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    getDoc,
    orderBy,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './firebase';
  import { getCurrentUser } from './authService';
  import { getWalkabilityScore } from './walkabilityService';
  
  // Helper function to make API calls to external mapping services
  const fetchExternalRoute = async (startLat, startLng, endLat, endLng, routeType = 'fastest') => {
    // In a real implementation, this would call Google Maps API, Mapbox, or similar
    // For the MVP, we'll generate a mock route
    
    // Create a mock route with waypoints
    const points = [];
    const pointCount = 8; // Number of points in our route
    
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
      // For a more accurate calculation, you'd use the Haversine formula
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
      
      // First, get a base route from an external routing service
      const routeData = await fetchExternalRoute(startLat, startLng, endLat, endLng, preference);
      
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
      
      // In a real app, we would use the walkability scores to potentially adjust and re-optimize the route
      // For the MVP, we'll keep the original route but add the walkability metadata
      
      // Save route to history if user is logged in
      const user = getCurrentUser();
      if (user) {
        try {
          await addDoc(collection(db, "routeHistory"), {
            userId: user.uid,
            startLocation: [startLat, startLng],
            endLocation: [endLat, endLng],
            preference: preference,
            distance: routeData.distance,
            duration: routeData.duration,
            walkabilityScore: scores.overall,
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error("Error saving route history:", e);
          // Continue without failing if history can't be saved
        }
      }
      
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
      
      // Check if near Kean University (defined as within ~1km)
      const isNearKean = (Math.abs(latitude - 40.6769) < 0.01) && (Math.abs(longitude - (-74.2390)) < 0.01);
      
      if (isNearKean) {
        // Kean University specific destinations
        return {
          success: true,
          suggestions: [
            {
              name: "Liberty Hall Museum",
              type: "culture",
              location: [40.6742, -74.2365],
              walkabilityScore: 88,
              distance: "0.4 km",
              description: "Historic mansion and museum with beautiful grounds"
            },
            {
              name: "Harwood Arena",
              type: "sports",
              location: [40.6773, -74.2408],
              walkabilityScore: 90,
              distance: "0.2 km",
              description: "State-of-the-art athletic facility"
            },
            {
              name: "Kean University Student Center",
              type: "campus",
              location: [40.6758, -74.2401],
              walkabilityScore: 95,
              distance: "0.1 km",
              description: "Center of student life with food and study spaces"
            },
            {
              name: "Elizabeth River Trail",
              type: "nature",
              location: [40.6800, -74.2340],
              walkabilityScore: 82,
              distance: "0.5 km",
              description: "Scenic walking path along the Elizabeth River"
            },
            {
              name: "University Center",
              type: "dining",
              location: [40.6761, -74.2405],
              walkabilityScore: 93,
              distance: "0.15 km",
              description: "Multiple dining options and gathering spaces"
            }
          ]
        };
      }
      
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
  
  // Get user's route history
  export const getUserRouteHistory = async () => {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error("You must be logged in to view your route history");
      }
      
      const historyRef = collection(db, "routeHistory");
      const q = query(
        historyRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const routeHistory = [];
      querySnapshot.forEach((doc) => {
        routeHistory.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        history: routeHistory
      };
    } catch (error) {
      console.error("Error getting user route history:", error);
      return {
        success: false,
        error: error.message || "Failed to get route history"
      };
    }
  };