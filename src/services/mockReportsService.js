// src/services/mockReportsService.js
import { keanReports, KEAN_UNIVERSITY_CENTER } from '../data/keanUniversityData';

// Mock storage for reports during development
let mockReports = [...keanReports]; // Start with pre-defined Kean reports

// Submit a new walkability report
export const submitWalkabilityReport = async (reportData) => {
  try {
    // Generate a unique ID for the report
    const reportId = `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Process the photo if it exists (in a real implementation, this would upload to Firebase Storage)
    let photoURL = null;
    if (reportData.photo) {
      // In a real app, this would upload to Firebase Storage
      // For the mock, we'll just simulate a URL
      photoURL = `https://example.com/mock-photos/${reportId}`;
    }
    
    // Create the report object
    const report = {
      id: reportId,
      userId: 'mock-user-id',
      userName: 'Kean Student',
      type: reportData.type,
      description: reportData.description,
      severity: reportData.severity,
      location: {
        latitude: parseFloat(reportData.latitude),
        longitude: parseFloat(reportData.longitude)
      },
      photoURL: photoURL,
      status: "pending", // pending, verified, resolved
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0
    };
    
    // Add to our mock storage
    mockReports.push(report);
    
    console.log("Kean University report submitted (mock):", report);
    
    // Simulate a delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      reportId: reportId
    };
  } catch (error) {
    console.error("Error submitting report:", error);
    return {
      success: false,
      error: error.message || "Failed to submit report"
    };
  }
};

// Get reports near a location
export const getNearbyReports = async (latitude, longitude, radiusKm = 1) => {
  try {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Convert to numbers
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error("Invalid coordinates provided");
    }
    
    // Filter reports based on distance to the provided location
    const nearbyReports = mockReports.filter(report => {
      const reportLat = report.location.latitude;
      const reportLng = report.location.longitude;
      
      // Calculate rough distance (not accounting for Earth's curvature)
      const latDiff = Math.abs(reportLat - latitude);
      const lngDiff = Math.abs(reportLng - longitude);
      
      // Rough conversion to km (varies by latitude)
      const latKm = latDiff * 111;
      const lngKm = lngDiff * 111 * Math.cos(latitude * Math.PI / 180);
      
      const distance = Math.sqrt(latKm * latKm + lngKm * lngKm);
      
      return distance <= radiusKm;
    }).map(report => ({
      ...report,
      // Calculate distance for each report
      distance: calculateDistance(
        latitude, longitude,
        report.location.latitude, report.location.longitude
      ).toFixed(2)
    }));
    
    return {
      success: true,
      reports: nearbyReports
    };
  } catch (error) {
    console.error("Error getting nearby reports:", error);
    return {
      success: false,
      error: error.message || "Failed to get reports"
    };
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Get reports submitted by the current user
export const getUserReports = async () => {
  try {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // For mock purposes, just return reports with userId = 'mock-user-id'
    const userReports = mockReports.filter(report => report.userId === 'mock-user-id');
    
    return {
      success: true,
      reports: userReports
    };
  } catch (error) {
    console.error("Error getting user reports:", error);
    return {
      success: false,
      error: error.message || "Failed to get reports"
    };
  }
};