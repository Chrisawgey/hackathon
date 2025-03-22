// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);