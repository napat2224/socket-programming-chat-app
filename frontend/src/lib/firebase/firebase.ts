import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnN693MGJZ2p1yRICP6IzoOgEKj3ZBsKI",
  authDomain: "horo-d47b1.firebaseapp.com",
  projectId: "horo-d47b1",
  storageBucket: "horo-d47b1.firebasestorage.app",
  messagingSenderId: "796546060161",
  appId: "1:796546060161:web:c244aafd8ebcd96c2ce280",
  measurementId: "G-S14W0PE44V",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export everything you need
export { app, auth, db };
