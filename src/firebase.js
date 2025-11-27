import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAgcp_hSnwDhgD0L1eZ4M5cir6SPKt-IfA",
    authDomain: "marosa-app.firebaseapp.com",
    projectId: "marosa-app",
    storageBucket: "marosa-app.firebasestorage.app",
    messagingSenderId: "615866664931",
    appId: "1:615866664931:web:3bfe2722c864ad9d3bc2d6",
    measurementId: "G-NLGHDHTYD4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// Export API key for use as fallback in Google Maps (same Google Cloud project)
export const FIREBASE_API_KEY = firebaseConfig.apiKey;