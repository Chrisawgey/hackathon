// src/services/reportsService.js
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
    updateDoc,
    deleteDoc,
    GeoPoint,
    serverTimestamp,
    increment,
    setDoc
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
  import { db, storage } from './firebase';
  import { getCurrentUser } from './authService';
  
  // Submit a new walkability report
  export const submitWalkabilityReport = async (reportData) => {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error("You must be logged in to submit a report");
      }
      
      let photoURL = null;
      
      // Upload photo if provided
      if (reportData.photo) {
        const photoRef = ref(storage, `report-images/${user.uid}/${Date.now()}`);
        await uploadBytes(photoRef, reportData.photo);
        photoURL = await getDownloadURL(photoRef);
      }
      
      // Create a GeoPoint for the location
      const geoPoint = new GeoPoint(
        parseFloat(reportData.latitude),
        parseFloat(reportData.longitude)
      );
      
      // Add the report to Firestore
      const reportRef = await addDoc(collection(db, "reports"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous User",
        type: reportData.type,
        description: reportData.description,
        severity: reportData.severity,
        location: geoPoint,
        photoURL: photoURL,
        status: "pending", // pending, verified, resolved
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0
      });
      
      // Update user's report count
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        reportCount: user.reportCount + 1 || 1
      });
      
      return {
        success: true,
        reportId: reportRef.id
      };
    } catch (error) {
      console.error("Error submitting report:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Get reports near a location
  export const getNearbyReports = async (latitude, longitude, radiusKm = 1) => {
    try {
      // For a proper geospatial query, you would need to use a 
      // geohashing library or Firebase Extensions like Firestore Geo
      // This is a simplified approach for the MVP
      
      const reportsRef = collection(db, "reports");
      const q = query(reportsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const reports = [];
      querySnapshot.forEach((doc) => {
        const reportData = doc.data();
        const reportLocation = reportData.location;
        
        // Calculate rough distance (not accounting for Earth's curvature)
        // This is a simplified approach for MVP
        const latDiff = Math.abs(reportLocation.latitude - latitude);
        const lngDiff = Math.abs(reportLocation.longitude - longitude);
        
        // Rough conversion to km (varies by latitude)
        const latKm = latDiff * 111;
        const lngKm = lngDiff * 111 * Math.cos(latitude * Math.PI / 180);
        
        const distance = Math.sqrt(latKm * latKm + lngKm * lngKm);
        
        if (distance <= radiusKm) {
          reports.push({
            id: doc.id,
            ...reportData,
            distance: distance.toFixed(2)
          });
        }
      });
      
      return {
        success: true,
        reports: reports
      };
    } catch (error) {
      console.error("Error getting nearby reports:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Get reports submitted by the current user
  export const getUserReports = async () => {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error("You must be logged in to view your reports");
      }
      
      const reportsRef = collection(db, "reports");
      const q = query(
        reportsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        reports: reports
      };
    } catch (error) {
      console.error("Error getting user reports:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Update an existing report
  export const updateReport = async (reportId, updateData) => {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error("You must be logged in to update a report");
      }
      
      // First check if the user is the author of the report or an admin
      const reportRef = doc(db, "reports", reportId);
      const reportDoc = await getDoc(reportRef);
      
      if (!reportDoc.exists) {
        throw new Error("Report not found");
      }
      
      const reportData = reportDoc.data();
      
      if (reportData.userId !== user.uid && !user.isAdmin) {
        throw new Error("You don't have permission to update this report");
      }
      
      // Update the report
      await updateDoc(reportRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error("Error updating report:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Delete a report
  export const deleteReport = async (reportId) => {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error("You must be logged in to delete a report");
      }
      
      // Check if the user is the author of the report or an admin
      const reportRef = doc(db, "reports", reportId);
      const reportDoc = await getDoc(reportRef);
      
      if (!reportDoc.exists) {
        throw new Error("Report not found");
      }
      
      const reportData = reportDoc.data();
      
      if (reportData.userId !== user.uid && !user.isAdmin) {
        throw new Error("You don't have permission to delete this report");
      }
      
      // Delete the report
      await deleteDoc(reportRef);
      
      // If there's an associated photo, delete it too
      if (reportData.photoURL) {
        const photoRef = ref(storage, reportData.photoURL);
        await deleteObject(photoRef);
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error("Error deleting report:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Vote on a report (upvote or downvote)
  export const voteOnReport = async (reportId, voteType) => {
    try {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error("You must be logged in to vote on a report");
      }
      
      const reportRef = doc(db, "reports", reportId);
      
      // Track the vote in a votes subcollection to prevent duplicate votes
      const voteRef = doc(db, `reports/${reportId}/votes`, user.uid);
      const voteDoc = await getDoc(voteRef);
      
      let updateData = {};
      
      if (voteDoc.exists()) {
        const currentVote = voteDoc.data().voteType;
        
        if (currentVote === voteType) {
          // User is removing their vote
          await deleteDoc(voteRef);
          
          updateData = {
            [`${currentVote}s`]: increment(-1)
          };
        } else {
          // User is changing their vote
          await setDoc(voteRef, { voteType });
          
          updateData = {
            [`${currentVote}s`]: increment(-1),
            [`${voteType}s`]: increment(1)
          };
        }
      } else {
        // New vote
        await setDoc(voteRef, { voteType });
        
        updateData = {
          [`${voteType}s`]: increment(1)
        };
      }
      
      await updateDoc(reportRef, updateData);
      
      return {
        success: true
      };
    } catch (error) {
      console.error("Error voting on report:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };