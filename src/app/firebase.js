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
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Firebase configuration object containing keys and identifiers
const firebaseConfig = {
  apiKey: "AIzaSyB0oI56j1sJfsnJMYYpHyAumkaev-aGm5I",
  authDomain: "travelnow-5eb59.firebaseapp.com",
  databaseURL:
    "https://travelnow-5eb59-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "travelnow-5eb59",
  storageBucket: "travelnow-5eb59.firebasestorage.app",
  messagingSenderId: "824133472118",
  appId: "1:824133472118:web:d5a8a11792af1a5d513457",
  measurementId: "G-EY34QEDEYR",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Get Firebase Authentication instance
const auth = getAuth(app);

// Get Firebase Database instance
const db = getDatabase(app);

// Get firebase storage
const storage = getStorage(app);

// function to get image url
export async function getImageUrl() {
  const imageRef = ref(storage, "noc/VehicleAuthorization.pdf"); // Replace with your image path
  const url = await getDownloadURL(imageRef);
  return url;
}
export {
  auth,
  db,
  storage,
  ref,
  getDownloadURL,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
};
