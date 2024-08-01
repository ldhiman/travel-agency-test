// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration object containing keys and identifiers
const firebaseConfig = {
  apiKey: "AIzaSyCYhHwbgQAdJFtix9557w8FthvcMuPbPXQ",
  authDomain: "travel-agency-18664.firebaseapp.com",
  databaseURL:"https://travel-agency-18664-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "travel-agency-18664",
  storageBucket: "travel-agency-18664.appspot.com",
  messagingSenderId: "401868859505",
  appId: "1:401868859505:web:47c0dabb0786928d6553d0",
  measurementId: "G-9B6JHKY5W6",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Get Firebase Authentication instance
const auth = getAuth(app);

// Get Firebase Database instance
const db = getDatabase(app);

// Setup ReCAPTCHA for Firebase Authentication
const setupRecaptcha = () => {
  window.recaptchaVerifier = new RecaptchaVerifier(
    "recaptcha-container",
    {
      size: "invisible",
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("Recaptcha solved");
      },
    },
    auth
  );
};

export { auth, db, setupRecaptcha, signInWithPhoneNumber };
