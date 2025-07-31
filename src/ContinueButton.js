import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { GoogleAuthProvider, signInWithPopup, getAuth, onAuthStateChanged } from "firebase/auth"; // Import getAuth and onAuthStateChanged
import { app } from './firebase'; // Import the Firebase app instance

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const ContinueButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // New state for loading authentication status

  useEffect(() => {
    const auth = getAuth(app); // Get the auth instance from the initialized app
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set isAuthenticated based on user presence
      setLoadingAuth(false); // Authentication check is complete
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // Run once on component mount

  const handleAuthAction = async () => {
    console.log("Authentication button clicked");
    if (isAuthenticated) {
      // If already authenticated, navigate directly
      console.log("User is already authenticated. Redirecting to demo.");
      window.location.href = `https://try-demo-peach.vercel.app/`;
    } else {
      // If not authenticated, initiate Google sign-in
      try {
        const auth = getAuth(app); // Get the auth instance again for the popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Signed in user:", user);
        if (user) {
          const token = await user.getIdToken();
          console.log("User token:", token);
          // After successful sign-in, redirect to the demo
          window.location.href = `https://try-demo-peach.vercel.app/?token=${token}`;
        } else {
          console.log("No user returned from signInWithPopup");
        }
      } catch (error) {
        console.error("Authentication failed:", error);
        // Handle specific errors, e.g., user closed popup
        if (error.code === 'auth/popup-closed-by-user') {
          console.log("Google sign-in popup was closed by the user.");
        }
        // You might want to show a user-friendly message here
      }
    }
  };

  // Show a loading state or disable the button until authentication status is determined
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
        {isAuthenticated ? "Try Now" : "Continue with"}
      </span>
      {!isAuthenticated && <span className="text-3xl ml-2">G</span>}
    </button>
  );
};

export default ContinueButton;