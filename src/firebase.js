import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";
// import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
// import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAHy54c9MKwXN-CLq6yhZXdhsmzikYUhn4",
  authDomain: "teenhelper-2f71b.firebaseapp.com",
  projectId: "teenhelper-2f71b",
  storageBucket: "teenhelper-2f71b.firebasestorage.app",
  messagingSenderId: "461422328",
  appId: "1:461422328:web:7f5a6b62050eec586b450d",
  measurementId: "G-5X3PSJGG7D",
};

// Initialize Firebase and Firestore (do this only once, outside your component)
console.log("Initializing firebase");
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // 👈 export auth

// 👇 toggle emulator based on env

// console.log("🔥 Using Firestore emulator");
// connectFirestoreEmulator(db, "127.0.0.1", 8080);
export default db;
