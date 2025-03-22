// src/services/walkabilityService.js
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    GeoPoint,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // Calculate the approximate distance between two geo points in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Get walkability score for a specific area
  export const getWalkabilityScore = async (latitude, longitude) => {
    try {
      // Convert to numbers to ensure proper comparison
      latitude = parseFloat(latitude);
      longitude = parseFloat(longitude);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid coordinates provided");
      }
      
      // First check if we already have a score for this area
      const scoresRef = collection(db, "walkabilityScores");
      const q = query(scoresRef);
      const querySnapshot = await getDocs(q);
      
      // Find the closest score within a reasonable radius (e.g., 0.1 km)
      let closestScore = null;
      let minDistance = 0.1; // 100 meters threshold
      
      querySnapshot.forEach((doc) => {
        const scoreData = doc.data();
        const scoreLat = scoreData.location.latitude;
        const scoreLng = scoreData.location.longitude;
        
        const distance = calculateDistance(latitude, longitude, scoreLat, scoreLng);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestScore = {
            id: doc.id,
            ...scoreData,
            distance: distance.toFixed(3)
          };
        }
      });
      
      if (closestScore) {
        return {
          success: true,
          score: closestScore,
          fromCache: true
        };
      }
      
      // If no nearby score is found, calculate a new one
      // For the MVP, we'll generate a mock score, but in a real app,
      // this would call your AI model or an external API
      
      const mockCalculateScore = async () => {
        // Get nearby reports to factor into score
        const reportsRef = collection(db, "reports");
        const reportsQuery = query(reportsRef);
        const reportsSnapshot = await getDocs(reportsQuery);
        
        const nearbyReports = [];
        reportsSnapshot.forEach((doc) => {
          const reportData = doc.data();
          const reportLat = reportData.location.latitude;
          const reportLng = reportData.location.longitude;
          
          const distance = calculateDistance(latitude, longitude, reportLat, reportLng);
          
          // Consider reports within 500 meters
          if (distance < 0.5) {
            nearbyReports.push({
              id: doc.id,
              ...reportData,
              distance
            });
          }
        });
        
        // Generate base scores with some randomness
        const baseScores = {
          sidewalkScore: Math.round(Math.random() * 20 + 70), // 70-90 range
          crosswalkScore: Math.round(Math.random() * 30 + 60), // 60-90 range
          lightingScore: Math.round(Math.random() * 40 + 50), // 50-90 range
          transitScore: Math.round(Math.random() * 30 + 60), // 60-90 range
          airQualityScore: Math.round(Math.random() * 30 + 60) // 60-90 range
        };
        
        // Adjust scores based on nearby reports
        nearbyReports.forEach(report => {
          const impact = Math.max(0, 0.5 - report.distance) * 2; // Higher impact for closer reports
          
          switch(report.type) {
            case 'sidewalk_issue':
              baseScores.sidewalkScore = Math.max(0, baseScores.sidewalkScore - (impact * 10));
              break;
            case 'crosswalk_issue':
              baseScores.crosswalkScore = Math.max(0, baseScores.crosswalkScore - (impact * 10));
              break;
            case 'lighting_issue':
              baseScores.lightingScore = Math.max(0, baseScores.lightingScore - (impact * 10));
              break;
            case 'accessibility_issue':
              baseScores.sidewalkScore = Math.max(0, baseScores.sidewalkScore - (impact * 5));
              baseScores.crosswalkScore = Math.max(0, baseScores.crosswalkScore - (impact * 5));
              break;
            case 'safety_concern':
              baseScores.lightingScore = Math.max(0, baseScores.lightingScore - (impact * 7));
              break;
            // Handle other report types...
          }
        });
        
        // Round all scores
        Object.keys(baseScores).forEach(key => {
          baseScores[key] = Math.round(baseScores[key]);
        });
        
        // Calculate overall score with weighted average
        const overallScore = Math.round(
          (baseScores.sidewalkScore * 0.3) + 
          (baseScores.crosswalkScore * 0.25) + 
          (baseScores.lightingScore * 0.2) + 
          (baseScores.transitScore * 0.15) + 
          (baseScores.airQualityScore * 0.1)
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
        const lowestScoreKey = Object.keys(baseScores).reduce((a, b) => 
          baseScores[a] < baseScores[b] ? a : b
        );
        
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
        
        return {
          overallScore,
          ...baseScores,
          insights,
          nearbyReportCount: nearbyReports.length
        };
      };
      
      // Calculate the score
      const scoreResults = await mockCalculateScore();
      
      // Save the new score to Firestore
      const newScore = {
        location: new GeoPoint(latitude, longitude),
        overallScore: scoreResults.overallScore,
        sidewalkScore: scoreResults.sidewalkScore,
        crosswalkScore: scoreResults.crosswalkScore,
        lightingScore: scoreResults.lightingScore,
        transitScore: scoreResults.transitScore,
        airQualityScore: scoreResults.airQualityScore,
        aiInsights: scoreResults.insights,
        calculatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        reportCount: scoreResults.nearbyReportCount || 0
      };
      
      const newScoreRef = await addDoc(collection(db, "walkabilityScores"), newScore);
      
      return {
        success: true,
        score: {
          id: newScoreRef.id,
          ...newScore,
          distance: 0
        },
        fromCache: false
      };
    } catch (error) {
      console.error("Error getting walkability score:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Get walkability scores within a bounding box (for map display)
  export const getScoresInBoundingBox = async (swLat, swLng, neLat, neLng) => {
    try {
      // In a production app, you would use GeoFirestore or similar for geo queries
      // For this MVP, we'll do a simple query and filter
      
      const scoresRef = collection(db, "walkabilityScores");
      const querySnapshot = await getDocs(scoresRef);
      
      const scores = [];
      querySnapshot.forEach((doc) => {
        const scoreData = doc.data();
        const lat = scoreData.location.latitude;
        const lng = scoreData.location.longitude;
        
        // Check if the score is within the bounding box
        if (lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng) {
          scores.push({
            id: doc.id,
            ...scoreData
          });
        }
      });
      
      return {
        success: true,
        scores: scores
      };
    } catch (error) {
      console.error("Error getting scores in bounding box:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Update a walkability score with new report data
  export const updateWalkabilityScore = async (latitude, longitude) => {
    // This would be called whenever a new report is submitted nearby
    // It would recalculate the score based on the new data
    
    // For the MVP, we'll simply call getWalkabilityScore which will calculate a new score
    return await getWalkabilityScore(latitude, longitude);
  };