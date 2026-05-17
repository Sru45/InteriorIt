import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhsAF2C8IyLL6bOyYV1oefwf-0RCcUu94",
  authDomain: "interiorit-3e204.firebaseapp.com",
  projectId: "interiorit-3e204",
  storageBucket: "interiorit-3e204.firebasestorage.app",
  messagingSenderId: "768296155659",
  appId: "1:768296155659:web:eeb3f8bd14fdc88e3ae50e",
  measurementId: "G-M6BKX414F9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
