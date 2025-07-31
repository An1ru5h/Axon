// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbLr-8J8W28sNiYYgE7wrSpXSpyexp_3I",
  authDomain: "mvp-betatesting.firebaseapp.com",
  projectId: "mvp-betatesting",
  storageBucket: "mvp-betatesting.appspot.com",
  messagingSenderId: "56481586407",
  appId: "1:56481586407:web:dd8657db8c7607f0c29642",
  measurementId: "G-6TRMN7KDKF"
};

// ✅ Initialize Firebase once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
