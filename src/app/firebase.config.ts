// src/app/firebase.config.ts
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyC-aXm870ZIqxg1XMk_Cr90bRop5H6_RZE",
    authDomain: "penndora-6b0ec.firebaseapp.com",
    projectId: "penndora-6b0ec",
    storageBucket: "penndora-6b0ec.firebasestorage.app",
    messagingSenderId: "303580676033",
    appId: "1:303580676033:web:10a750dbaa37433ceeb940",
    measurementId: "G-6XGHK7417T"
  };

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
