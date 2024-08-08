// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { getDatabase } from "firebase/database";

// Firebase configuration object containing keys and identifiers
const firebaseConfig = {
  apiKey: "AIzaSyCYhHwbgQAdJFtix9557w8FthvcMuPbPXQ",
  authDomain: "travel-agency-18664.firebaseapp.com",
  databaseURL:
    "https://travel-agency-18664-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "travel-agency-18664",
  storageBucket: "travel-agency-18664.appspot.com",
  messagingSenderId: "401868859505",
  appId: "1:401868859505:web:47a92b53c67eb12c6553d0",
  measurementId: "G-QJDZ7R7K3J",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Get Firebase Authentication instance
const auth = getAuth(app);

// Get Firebase Database instance
const db = getDatabase(app);

export {
  auth,
  db,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
};