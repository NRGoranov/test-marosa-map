import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBwTjcR5EHJL_BR63hZlnqZ1NdoLsg1M-c",
    authDomain: "marosa-app.firebaseapp.com",
    projectId: "marosa-app",
    storageBucket: "marosa-app.firebasestorage.app",
    messagingSenderId: "615866664931",
    appId: "1:615866664931:web:3bfe2722c864ad9d3bc2d6",
    measurementId: "G-NLGHDHTYD4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);