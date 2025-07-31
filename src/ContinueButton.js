
import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const ContinueButton = () => {
  const handleGoogleSignIn = async () => {
    console.log("Google sign-in button clicked");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Signed in user:", user);
      if (user) {
        const token = await user.getIdToken();
        console.log("User token:", token);
        window.location.href = `https://try-demo-peach.vercel.app/?token=${token}`;
      } else {
        console.log("No user returned from signInWithPopup");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="px-12 py-3 text-white font-semibold rounded-full transition duration-300 ease-in-out animate-slide-in-up-simultaneous liquid-glass-button hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 flex items-center justify-center"
    >
      <span className="text-lg">Continue with</span>
      <span className="text-3xl ml-2">G</span>
    </button>
  );
};

export default ContinueButton;
