import React, { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { app } from './firebase';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const ContinueButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setIsAuthenticated(!!user);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthAction = async () => {
    console.log("Authentication button clicked");
    if (!auth) return;

    if (isAuthenticated) {
      console.log("User already authenticated. Redirecting...");
      try {
        const user = auth.currentUser;
        const token = await user.getIdToken();
        console.log("User token:", token);
        window.location.href = `https://o1axondashboard.web.app/dashboard/?token=${encodeURIComponent(token)}`;
      } catch (error) {
        console.error("Error getting token:", error);
      }
    } else {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Signed in user:", user);

        if (user) {
          const token = await user.getIdToken();
          console.log("Token retrieved:", token);
          window.location.href = `https://o1axondashboard.web.app/dashboard/?token=${encodeURIComponent(token)}`;
        }
      } catch (error) {
        console.error("Sign-in failed:", error);
        if (error.code === 'auth/popup-closed-by-user') {
          console.log("Popup closed by user.");
        }
      }
    }
  };

  if (loadingAuth) {
    return (
      <button
        className="px-12 py-3 text-white font-semibold rounded-full transition duration-300 ease-in-out animate-slide-in-up-simultaneous liquid-glass-button flex items-center justify-center opacity-70 cursor-not-allowed"
        disabled
      >
        <span className="text-lg">Loading...</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAuthAction}
      className="px-12 py-3 text-white font-semibold rounded-full transition duration-300 ease-in-out animate-slide-in-up-simultaneous liquid-glass-button hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 flex items-center justify-center"
    >
      <span className="text-lg">
        {isAuthenticated ? 'Continue to Demo' : 'Continue with Google'}
      </span>
      {!isAuthenticated && <span className="text-3xl ml-2">G</span>}
    </button>
  );
};

export default ContinueButton;
