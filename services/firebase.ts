import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Configuration would typically come from environment variables
// For this demo, we'll check if env vars exist, otherwise warn.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "mock-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "haas-security.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "haas-security",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "haas-security.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Helper to check if we are in a demo/mock environment
export const isDemoMode = () => !process.env.FIREBASE_API_KEY;