// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbLr-8J8W28sNiYYgE7wrSpXSpyexp_3I",
  authDomain: "mvp-betatesting.firebaseapp.com",
  projectId: "mvp-betatesting",
  storageBucket: "mvp-betatesting.appspot.com",
  messagingSenderId: "56481586407",
  appId: "1:56481586407:web:dd8657db8c7607f0c29642",
  measurementId: "G-6TRMN7KDKF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Only this single export line is needed
export { app, auth, db, storage };
