import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default // Add your Firebase config here (replace with your actual config values)
db;
