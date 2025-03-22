// src/services/authService.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile,
    onAuthStateChanged,
    sendPasswordResetEmail
  } from 'firebase/auth';
  import { auth, db } from './firebase';
  import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
  
  // Sign up a new user
  export const signUp = async (email, password, displayName) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's profile with display name
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Create a user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        reportCount: 0,
        isAdmin: false
      });
      
      return {
        success: true,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Sign in existing user
  export const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Sign out
  export const logOut = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Reset password
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Get current user
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // Listen for auth state changes
  export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  
  // Get user profile data
  export const getUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return {
          success: true,
          profile: userDoc.data()
        };
      } else {
        return {
          success: false,
          error: "User profile not found"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };