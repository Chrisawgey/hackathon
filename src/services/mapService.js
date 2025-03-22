// src/services/mapService.js
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  GeoPoint, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Mock data for development (to be replaced with actual API calls and AI processing)
const mockAreaData = [
  {
    id: 'area1',
    name: 'Downtown',
    coordinates: [40.7128, -74.0060],
    overallScore: 85,
    sidewalkScore: 90,
    crosswalkScore: 85,
    lightingScore: 75,
    transitScore: 95,
    airQualityScore: 70,
    aiInsights: "This area has excellent walkability with wide sidewalks and good transit access. Some street lighting could be improved for night safety.",
    userReports: [
      {
        type: 'sidewalk_issue',
        description: 'Cracked sidewalk at the corner of Main and 5th',
        date: '2023-11-10',
        severity: 'medium'
      }
    ]
  },
  {
    id: 'area2',
    name: 'Midtown',
    coordinates: [40.7549, -73.9840],
    overallScore: 72,
    sidewalkScore: 75,
    crosswalkScore: 80,
    lightingScore: 65,
    transitScore: 85,
    airQualityScore: 60,
    aiInsights: "Midtown offers good walkability with some areas for improvement. Crosswalks are well-marked but sidewalks have occasional obstructions.",
    userReports: []
  },
  {
    id: 'area3',
    name: 'Riverside',
    coordinates: [40.8075, -73.9626],
    overallScore: 63,
    sidewalkScore: 65,
    crosswalkScore: 55,
    lightingScore: 50,
    transitScore: 80,
    airQualityScore: 85,
    aiInsights: "The Riverside area has decent walkability with excellent air quality due to park proximity. Crosswalks and lighting need significant improvement.",
    userReports: [
      {
        type: 'lighting_issue',
        description: 'Dark section of street between Park Ave and River St',
        date: '2023-10-31',
        severity: 'high'
      },
      {
        type: 'crosswalk_issue',
        description: 'Faded crosswalk markings at River St and 12th',
        date: '2023-11-05',
        severity: 'medium'
      }
    ]
  }
];

// Function to fetch walkability data for an area
export const getWalkabilityData = async (latitude, longitude, radius = 1) => {
  try {
    // In a real implementation, this would query Firebase based on geolocation
    // For now, return mock data
    return mockAreaData;
  } catch (error) {
    console.error("Error fetching walkability data:", error);
    return [];
  }
};

// Function to get area details by id
export const getAreaById = async (areaId) => {
  try {
    // In a real implementation, this would be a Firebase document query
    return mockAreaData.find(area => area.id === areaId) || null;
  } catch (error) {
    console.error("Error fetching area details:", error);
    return null;
  }
};

// Function to submit a user report
export const submitReport = async (reportData) => {
  try {
    // In a real implementation, this would add a document to Firebase
    console.log("Report submitted:", reportData);
    
    // Mock successful response
    return {
      success: true,
      reportId: 'mock-report-' + Date.now()
    };
  } catch (error) {
    console.error("Error submitting report:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to get route recommendations
export const getRouteRecommendation = async (start, end, preferences) => {
  try {
    // This would connect to a routing API or use your own algorithm
    // For now, return a mock route
    const mockRoute = [
      [start[0], start[1]],
      [start[0] + 0.003, start[1] + 0.002],
      [start[0] + 0.005, start[1] + 0.005],
      [start[0] + 0.008, start[1] + 0.003],
      [end[0], end[1]]
    ];
    
    return {
      success: true,
      route: mockRoute,
      walkabilityScore: 78,
      estimatedTime: '15 minutes',
      distance: '1.2 km'
    };
  } catch (error) {
    console.error("Error getting route recommendation:", error);
    return {
      success: false,
      error: error.message
    };
  }
};