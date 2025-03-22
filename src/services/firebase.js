// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvcwiFX3wKdm-aANJS5nV6oeI1yKy7W40",
  authDomain: "keanhackathon2025.firebaseapp.com",
  projectId: "keanhackathon2025",
  storageBucket: "keanhackathon2025.firebasestorage.app",
  messagingSenderId: "813513450868",
  appId: "1:813513450868:web:bd4c96f75c10ccc59ff821",
  measurementId: "G-B9H9F80B6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics };