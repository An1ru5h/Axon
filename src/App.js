import React, { useState, useEffect, useRef } from 'react';
import ContinueButton from './ContinueButton';
import FeedbackForm from './FeedbackForm';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Although not used for this specific request, good to include if Firestore is anticipated

function App() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const dropdownRef = useRef(null);

  // State for Firebase user and auth/db instances
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // To track if auth state has been checked

  // State for cursor position and trail
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorTrail, setCursorTrail] = useState([]);
  const trailLength = 8; // Number of trail elements

  // Function to dynamically load html2canvas
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize Firebase and set up auth listener
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Use global variables provided by the Canvas environment
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        if (Object.keys(firebaseConfig).length === 0) {
          console.error("Firebase config is not defined. Please ensure __firebase_config is available.");
          return;
        }

        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);

        setAuth(authInstance);
        setDb(dbInstance);

        // Sign in with custom token if available, otherwise anonymously
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          await signInAnonymously(authInstance);
        }

        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
          setUser(currentUser);
          setIsAuthReady(true); // Auth state has been checked
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();

      } catch (error) {
        console.error("Error initializing Firebase or signing in:", error);
      }
    };

    initializeFirebase();
  }, []); // Run only once on component mount

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Effect to handle mouse movement for the custom cursor and trail
  useEffect(() => {
    const handleMouseMove = (event) => {
      const newPos = { x: event.clientX, y: event.clientY };
      setCursorPos(newPos);

      // Update trail positions
      setCursorTrail(prevTrail => {
        const newTrail = [newPos, ...prevTrail];
        return newTrail.slice(0, trailLength);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [trailLength]);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const openFeedbackForm = async () => {
    // Hide dropdown before capturing to ensure it's not in the screenshot
    setShowDropdown(false);

    // Give a small delay for the UI to update before capturing
    await new Promise(resolve => setTimeout(resolve, 50));

    // The screenshot capture logic is now within FeedbackForm,
    // but we still trigger the form to show here.
    setShowFeedbackForm(true);
  };

  const closeFeedbackForm = () => {
    setShowFeedbackForm(false);
    setCapturedImage(null); // Clear captured image when form closes
  };

  // Google Sign-in function
  const handleGoogleSignIn = async () => {
    if (!auth) {
      console.error("Firebase Auth is not initialized.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowDropdown(false); // Close dropdown after sign-in
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // You might want to display a user-friendly message here
    }
  };

  // Sign-out function
  const handleSignOut = async () => {
    if (!auth) {
      console.error("Firebase Auth is not initialized.");
      return;
    }
    try {
      await signOut(auth);
      setShowDropdown(false); // Close dropdown after sign-out
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;700&display=swap');
        @import url('https://fonts.com/css2?family=Caveat:wght@400;700&display=swap');

        .font-urbanist { font-family: 'Urbanist', sans-serif; }
        .font-figma-hand { font-family: 'Caveat', cursive; }

        /* Video background styles */
        .video-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover; /* Ensures the video covers the entire area */
          z-index: -2; /* Puts the video behind other content */
        }

        /* Custom cursor styles */
        .custom-cursor {
          position: fixed;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #87CEEB 0%, #ADD8E6 50%, transparent 70%); /* Light blue glow */
          border-radius: 50%;
          pointer-events: none; /* Allows clicks to pass through */
          transform: translate(-50%, -50%) scale(1); /* Centers and initial scale */
          transition: transform 0.05s ease-out, opacity 0.2s ease-out; /* Smooth movement and fade */
          z-index: 9999; /* Ensure it's on top of everything */
          opacity: 0.8; /* Slightly transparent */
          animation: cursor-pulse 2s infinite alternate ease-in-out; /* Pulsing animation */
        }

        /* Trail element styles */
        .cursor-trail {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: all 0.1s ease-out;
          z-index: 9998; /* Just below main cursor */
        }

        /* Keyframes for cursor pulsing animation */
        @keyframes cursor-pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1); /* Slightly larger */
            opacity: 0.9; /* More opaque */
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
        }

        /* Trail fade animation */
        @keyframes trail-fade {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
        }

        .gradient-text-header {
          background: linear-gradient(to bottom, #ffffff, #ADD8E6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; color: transparent;
          user-select: none; /* Prevent text selection */
        }

        /* Custom animation for sliding in from bottom */
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-in-up {
          animation: slideInUp 1s ease-out forwards;
        }

        /* Removed animation-delay from this class */
        .animate-slide-in-up-simultaneous {
          animation: slideInUp 1s ease-out forwards;
          user-select: none; /* Prevent text selection */
        }

        /* New liquid-white glass style for button - Increased blur */
        .liquid-glass-button {
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.25), rgba(220, 220, 220, 0.15));
          backdrop-filter: blur(30px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* Dropdown menu glass style - Now similar to button */
        .dropdown-glass-bg {
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.25), rgba(220, 220, 220, 0.15)); /* Matched button gradient */
          backdrop-filter: blur(30px); /* Matched button blur */
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Matched button shadow */
          border: none; /* Removed border */
        }

        /* Feedback form slide-in animation */
        @keyframes slideInRight {
          from {
            transform: translateX(100vw); /* Increased slide distance */
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out forwards;
        }

        /* Updated feedback form background to match liquid glass style */
        .feedback-form-bg {
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(220, 220, 220, 0.05)); /* Lighter, more transparent gradient */
          backdrop-filter: blur(30px); /* Increased blur to match button/dropdown */
          box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3); /* Shadow on the left edge */
        }
      `}</style>

      {/* Custom Cursor Trail Elements */}
      {cursorTrail.map((pos, index) => {
        if (index === 0) return null; // Skip the first element (main cursor position)

        const trailIndex = index - 1;
        const opacity = Math.max(0, 0.6 - (trailIndex * 0.08));
        const size = Math.max(4, 18 - (trailIndex * 2));
        const delay = trailIndex * 0.02;

        return (
          <div
            key={`trail-${index}`}
            className="cursor-trail"
            style={{
              left: pos.x,
              top: pos.y,
              width: `${size}px`,
              height: `${size}px`,
              background: `radial-gradient(circle, rgba(135, 206, 235, ${opacity}) 0%, rgba(173, 216, 230, ${opacity * 0.7}) 50%, transparent 70%)`,
              opacity: opacity,
              transitionDelay: `${delay}s`,
            }}
          />
        );
      })}

      {/* Main Custom Cursor Element */}
      <div
        className="custom-cursor"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      ></div>

      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden font-urbanist text-white">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="video-background"
        >
          <source src="innovation.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <main className="z-10 flex flex-col items-center w-full">
          <h1 className="text-9xl md:text-[10rem] font-normal mb-2 leading-tight gradient-text-header text-center animate-slide-in-up">
            Axon
          </h1>
          {/* Tagline with reduced font size and mb-0 */}
          <p className="text-xl md:text-2xl text-gray-200 text-center mb-10 animate-slide-in-up-simultaneous">
            Where product thinking moves faster and <br /> smarter with Axon
          </p>

          {/* Render the ContinueButton component */}
          <ContinueButton />
        </main>

        {/* Company logo placeholder added to the top-left corner */}
        <div className="fixed top-4 left-4 z-20">
          <img
            src="./Logo.png"
            alt="Company Logo"
            className="w-14 h-14 rounded-full"
            style={{ userSelect: 'none', WebkitUserDrag: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            draggable="false"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/56x56/F3F4F6/000000?text=Co.'; }}
          />
        </div>

        {/* Icons moved to the top-right corner */}
        <div className="fixed top-4 right-4 z-20 flex items-center space-x-4" ref={dropdownRef}>
          {/*Discord icon*/}
          <div className="flex items-center justify-center w-10 h-10 rounded-md">
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Visit us on Discord">
              <img
                src="./Discord.png" // Placeholder for Discord logo
                alt="Discord Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/24x24/000000/FFFFFF?text=X'; }}
              />
            </a>
          </div>

          {/* User Profile Photo or Three Dots Icon */}
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full cursor-pointer overflow-hidden
                       bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
            onClick={toggleDropdown}
            title={user ? user.displayName || user.email : "Menu"}
          >
            {user && user.photoURL ? (
              <img
                src={user.photoURL}
                alt="User Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/48x48/000000/FFFFFF?text=User'; }} // Fallback for broken image
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="12" cy="19" r="2"/>
              </svg>
            )}
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 py-4 px-2 rounded-xl dropdown-glass-bg text-white text-left">
              <ul className="space-y-3">
                {user ? (
                  <>
                    <li className="flex items-center space-x-3 px-3 py-2 text-gray-300">
                      <span className="truncate">{user.displayName || user.email || "Logged In"}</span>
                    </li>
                    <hr className="border-gray-600 my-1" />
                    <li className="flex items-center space-x-3 cursor-pointer hover:text-gray-300 transition-colors duration-200 px-3 py-2" onClick={handleSignOut}>
                      {/* Icon for Sign Out */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      <span>Sign Out</span>
                    </li>
                  </>
                ) : (
                  <li className="flex items-center space-x-3 cursor-pointer hover:text-gray-300 transition-colors duration-200 px-3 py-2" onClick={handleGoogleSignIn}>
                    {/* Google Sign-in Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.24 10.29v2.42h6.66c-.28 1.57-1.14 2.87-2.48 3.73l-.01.01-2.07 1.6L12 18.01c-3.14-2.88-5.1-7.14-5.1-11.91 0-.91.1-1.8.28-2.65h-.01L4.3 2.59l-.01.01C2.78 4.67 2 7.03 2 9.5c0 4.96 2.9 9.3 7.15 11.24l.01-.01 2.84-2.22.01-.01c.78-.61 1.4-1.38 1.84-2.25z"/>
                      <path d="M22.25 10.29h-9.96v-2.42h9.96c.01.27.02.54.02.82 0 2.22-.72 4.28-1.95 5.96l-.01.01-2.07-1.6c.72-1.07 1.14-2.38 1.14-3.78z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </li>
                )}
                <li className="flex items-center space-x-3 cursor-pointer hover:text-gray-300 transition-colors duration-200 px-3 py-2" onClick={openFeedbackForm}>
                  {/* Icon for Send app feedback */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                  <span>Send app feedback</span>
                </li>
                <li className="flex items-center space-x-3 cursor-pointer hover:text-gray-300 transition-colors duration-200 px-3 py-2">
                  {/* Icon for FAQ */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.44 13.31 13 14 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                  </svg>
                  <span>FAQ</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Render the FeedbackForm component */}
        <FeedbackForm
          showFeedbackForm={showFeedbackForm}
          closeFeedbackForm={closeFeedbackForm}
          capturedImage={capturedImage}
          setCapturedImage={setCapturedImage}
        />

        {/* "Product under Development" and "Send Feedbacks" text at the bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-gray-400 text-sm md:text-base flex items-center space-x-2">
          <span>Product under Development</span>
          <span className="text-gray-500">|</span>
          <span className="underline cursor-pointer" onClick={openFeedbackForm}>Send Feedbacks</span>
        </div>
      </div>
    </>
  );
}

export default App;
