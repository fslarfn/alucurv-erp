// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAFmphYD4uIr1sE2QZ4i7DweESwM4k_E0Y",
    authDomain: "alucurv-b68b4.firebaseapp.com",
    projectId: "alucurv-b68b4",
    storageBucket: "alucurv-b68b4.firebasestorage.app",
    messagingSenderId: "404811852966",
    appId: "1:404811852966:web:931c140536d71b636bd867",
    measurementId: "G-QYJLGVSJ08"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, auth, analytics };
