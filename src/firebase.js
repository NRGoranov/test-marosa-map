import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "marosa-app.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "marosa-app",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "marosa-app.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "615866664931",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:615866664931:web:3bfe2722c864ad9d3bc2d6",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NLGHDHTYD4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);