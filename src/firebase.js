// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// 🔐 Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbLr-8J8W28sNiYYgE7wrSpXSpyexp_3I",
  authDomain: "mvp-betatesting.firebaseapp.com",
  projectId: "mvp-betatesting",
  storageBucket: "mvp-betatesting.appspot.com",
  messagingSenderId: "56481586407",
  appId: "1:56481586407:web:dd8657db8c7607f0c29642",
  measurementId: "G-6TRMN7KDKF",
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Auth setup
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// 🔥 Firestore
const db = getFirestore(app);

// 📊 Analytics (conditionally loaded)
let analytics = null;
isSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app);
  })
  .catch((err) => {
    console.warn("Analytics not supported:", err);
  });

// ✨ Save or update user to Firestore
const saveUserToFirestore = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const userData = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    lastLoginAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
    console.log("✅ User added to Firestore:", user.displayName);
  } else {
    await updateDoc(userRef, userData);
    console.log("🔁 User login timestamp updated:", user.displayName);
  }
};

// 🔐 Google Sign-In with Firestore save
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("✅ Signed in as:", user.displayName);

    await saveUserToFirestore(user);

    return user;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.error("❌ Google Sign-In Error:", errorMessage, errorCode);
    throw error;
  }
};

// 🚪 Sign out function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("👋 User signed out.");
  } catch (error) {
    console.error("❌ Sign-out error:", error.message);
  }
};

export { app, auth, googleProvider, db, analytics };
