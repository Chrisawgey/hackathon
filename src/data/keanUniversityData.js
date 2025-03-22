// src/data/keanUniversityData.js

// Kean University center coordinates (approximate)
export const KEAN_UNIVERSITY_CENTER = [40.6774, -74.2392]; // Latitude, Longitude

// Mock walkability data for different areas of Kean University campus
export const keanWalkabilityData = [
  {
    id: 'kean-central',
    name: 'University Center',
    position: [40.6774, -74.2392],
    score: 88,
    overallScore: 88,
    sidewalkScore: 92,
    crosswalkScore: 85,
    lightingScore: 90,
    transitScore: 78,
    airQualityScore: 82,
    description: "Excellent pedestrian area with wide sidewalks and good lighting.",
    aiInsights: "The University Center area provides excellent walkability with well-maintained sidewalks and ample lighting. Crosswalks are clearly marked and accessible. Transit access could be improved for better connectivity to off-campus locations.",
    userReports: []
  },
  {
    id: 'kean-library',
    name: 'Nancy Thompson Library',
    position: [40.6782, -74.2402],
    score: 85,
    overallScore: 85,
    sidewalkScore: 88,
    crosswalkScore: 83,
    lightingScore: 85,
    transitScore: 75,
    airQualityScore: 88,
    description: "Well-maintained pedestrian pathways and good accessibility.",
    aiInsights: "The library area has good walkability with smooth pathways and adequate lighting. The area is well-connected to other campus buildings with designated pedestrian routes.",
    userReports: []
  },
  {
    id: 'kean-cas',
    name: 'College of Arts & Sciences',
    position: [40.6768, -74.2385],
    score: 82,
    overallScore: 82,
    sidewalkScore: 85,
    crosswalkScore: 80,
    lightingScore: 82,
    transitScore: 76,
    airQualityScore: 85,
    description: "Good walkability with some areas needing improvement.",
    aiInsights: "This area has good walkability overall. Some crosswalks could be better marked, but sidewalks are well-maintained with few obstructions.",
    userReports: []
  },
  {
    id: 'kean-eastcampus',
    name: 'East Campus',
    position: [40.6756, -74.2340],
    score: 68,
    overallScore: 68,
    sidewalkScore: 65,
    crosswalkScore: 60,
    lightingScore: 72,
    transitScore: 65,
    airQualityScore: 90,
    description: "Limited sidewalk infrastructure in some areas.",
    aiInsights: "East Campus has moderate walkability with some gaps in the sidewalk network. Night lighting could be improved in certain areas, particularly between buildings. The air quality is excellent due to the open space and vegetation.",
    userReports: [
      {
        type: 'sidewalk_issue',
        description: 'Uneven sidewalk near East Campus building',
        date: '2023-11-10',
        severity: 'medium'
      }
    ]
  },
  {
    id: 'kean-dorms',
    name: 'Residence Halls',
    position: [40.6752, -74.2384],
    score: 75,
    overallScore: 75,
    sidewalkScore: 78,
    crosswalkScore: 72,
    lightingScore: 85,
    transitScore: 60,
    airQualityScore: 80,
    description: "Good lighting but limited transit options.",
    aiInsights: "The residence hall area features good walkability with ample lighting for nighttime safety. However, transit connectivity to the rest of campus and surrounding areas could be improved. Sidewalks are well-maintained but some crosswalks need better marking.",
    userReports: []
  },
  {
    id: 'kean-parking',
    name: 'Main Parking Lots',
    position: [40.6792, -74.2415],
    score: 62,
    overallScore: 62,
    sidewalkScore: 58,
    crosswalkScore: 65,
    lightingScore: 70,
    transitScore: 55,
    airQualityScore: 68,
    description: "Limited pedestrian infrastructure in parking areas.",
    aiInsights: "The parking lot areas have moderate walkability issues. Pedestrian pathways through parking areas are limited, and some sections lack proper sidewalks. Lighting is adequate but crosswalks between parking and buildings could be improved for safety.",
    userReports: [
      {
        type: 'crosswalk_issue',
        description: 'Faded crosswalk markings between parking lot and Hennings Hall',
        date: '2023-10-25',
        severity: 'medium'
      },
      {
        type: 'lighting_issue',
        description: 'Dark area in northeast corner of parking lot',
        date: '2023-11-02',
        severity: 'high'
      }
    ]
  },
  {
    id: 'kean-harwood',
    name: 'Harwood Arena',
    position: [40.6734, -74.2370],
    score: 78,
    overallScore: 78,
    sidewalkScore: 82,
    crosswalkScore: 75,
    lightingScore: 80,
    transitScore: 65,
    airQualityScore: 85,
    description: "Good walkability with wide pathways around arena.",
    aiInsights: "The Harwood Arena area has good walkability with wide pathways designed for event crowds. Lighting is generally good, though some improvements could be made to connections with more distant parking areas.",
    userReports: []
  },
  {
    id: 'kean-vaughnEames',
    name: 'Vaughn Eames Hall',
    position: [40.6785, -74.2368],
    score: 83,
    overallScore: 83,
    sidewalkScore: 86,
    crosswalkScore: 82,
    lightingScore: 85,
    transitScore: 70,
    airQualityScore: 84,
    description: "Well-designed pedestrian area with good accessibility.",
    aiInsights: "The Vaughn Eames area provides very good walkability with accessible routes and good lighting. The arts plaza creates a pedestrian-friendly environment with minimal vehicle conflicts.",
    userReports: []
  }
];

// Mock reports for Kean University
export const keanReports = [
  {
    id: 'report-1',
    userId: 'user-1',
    userName: 'Student Reporter',
    type: 'sidewalk_issue',
    description: 'Cracked sidewalk between University Center and CAS building needs repair',
    severity: 'medium',
    location: {
      latitude: 40.6770,
      longitude: -74.2389
    },
    photoURL: null,
    status: 'pending',
    createdAt: '2023-11-10T14:32:00Z',
    updatedAt: '2023-11-10T14:32:00Z',
    upvotes: 3,
    downvotes: 0
  },
  {
    id: 'report-2',
    userId: 'user-2',
    userName: 'Faculty Member',
    type: 'lighting_issue',
    description: 'Dark pathway between Hennings Hall and the parking lot needs additional lighting',
    severity: 'high',
    location: {
      latitude: 40.6787,
      longitude: -74.2410
    },
    photoURL: null,
    status: 'verified',
    createdAt: '2023-11-05T18:45:00Z',
    updatedAt: '2023-11-07T10:15:00Z',
    upvotes: 7,
    downvotes: 0
  },
  {
    id: 'report-3',
    userId: 'user-3',
    userName: 'Campus Safety',
    type: 'crosswalk_issue',
    description: 'Faded crosswalk markings near Science Building need repainting',
    severity: 'medium',
    location: {
      latitude: 40.6760,
      longitude: -74.2395
    },
    photoURL: null,
    status: 'pending',
    createdAt: '2023-11-08T09:20:00Z',
    updatedAt: '2023-11-08T09:20:00Z',
    upvotes: 2,
    downvotes: 0
  },
  {
    id: 'report-4',
    userId: 'user-4',
    userName: 'Evening Student',
    type: 'lighting_issue',
    description: 'Path between GLAB and East Campus poorly lit at night',
    severity: 'high',
    location: {
      latitude: 40.6762,
      longitude: -74.2355
    },
    photoURL: null,
    status: 'pending',
    createdAt: '2023-11-09T21:15:00Z',
    updatedAt: '2023-11-09T21:15:00Z',
    upvotes: 5,
    downvotes: 1
  },
  {
    id: 'report-5',
    userId: 'user-5',
    userName: 'Accessibility Advocate',
    type: 'accessibility_issue',
    description: 'Ramp near Willis Hall needs maintenance, difficult for wheelchair access',
    severity: 'high',
    location: {
      latitude: 40.6776,
      longitude: -74.2375
    },
    photoURL: null,
    status: 'verified',
    createdAt: '2023-11-03T13:10:00Z',
    updatedAt: '2023-11-06T11:30:00Z',
    upvotes: 12,
    downvotes: 0
  }
];

// Mock destination suggestions for Kean University
export const keanDestinations = [
  {
    name: "University Center",
    type: "campus",
    location: [40.6774, -74.2392],
    walkabilityScore: 88,
    distance: "0.0 km" // Center point
  },
  {
    name: "Nancy Thompson Library",
    type: "study",
    location: [40.6782, -74.2402],
    walkabilityScore: 85,
    distance: "0.2 km"
  },
  {
    name: "Harwood Arena",
    type: "sports",
    location: [40.6734, -74.2370],
    walkabilityScore: 78,
    distance: "0.5 km"
  },
  {
    name: "Vaughn Eames Hall",
    type: "arts",
    location: [40.6785, -74.2368],
    walkabilityScore: 83,
    distance: "0.3 km"
  },
  {
    name: "STEM Building",
    type: "academic",
    location: [40.6766, -74.2404],
    walkabilityScore: 80,
    distance: "0.2 km"
  },
  {
    name: "Green Lane Building",
    type: "academic",
    location: [40.6756, -74.2340],
    walkabilityScore: 68,
    distance: "0.6 km"
  },
  {
    name: "Liberty Hall Museum",
    type: "culture",
    location: [40.6730, -74.2330],
    walkabilityScore: 75,
    distance: "0.8 km"
  },
  {
    name: "Cougar's Den Cafe",
    type: "dining",
    location: [40.6775, -74.2390],
    walkabilityScore: 87,
    distance: "0.1 km"
  },
  {
    name: "Campus Bookstore",
    type: "shopping",
    location: [40.6776, -74.2394],
    walkabilityScore: 86,
    distance: "0.1 km"
  }
];