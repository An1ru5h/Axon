import React, { useState, useEffect, useRef } from 'react';
import ContinueButton from './ContinueButton';
import FeedbackForm from './FeedbackForm';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'; // Removed GoogleAuthProvider, signInWithPopup, signOut
import { getFirestore } from 'firebase/firestore'; // Although not used for this specific request, good to include if Firestore is anticipated

function App() {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

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
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initialAuthToken : null;

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
          // signInWithCustomToken is used for Canvas environment authentication
          // eslint-disable-next-line no-undef
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

  const openFeedbackForm = async () => {
    // The screenshot capture logic is now within FeedbackForm,
    // but we still trigger the form to show here.
    setShowFeedbackForm(true);
  };

  const closeFeedbackForm = () => {
    setShowFeedbackForm(false);
    setCapturedImage(null); // Clear captured image when form closes
  };

  return (
    <>
      {/*
        Important note for responsiveness: Ensure your main HTML file includes the following meta tag
        in the <head> section for optimal mobile viewing:
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      */}
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
          {/* Changed text-9xl to text-6xl for better mobile compatibility */}
          <h1 className="text-6xl md:text-[10rem] font-normal mb-2 leading-tight gradient-text-header text-center animate-slide-in-up">
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
            className="w-12 h-12 rounded-full"
            style={{ userSelect: 'none', WebkitUserDrag: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            draggable="false"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/56x56/F3F4F6/000000?text=Co.'; }}
          />
        </div>

        {/* Icons moved to the top-right corner */}
        <div className="fixed top-4 right-4 z-20 flex items-center space-x-4">
          {/*Discord icon*/}
          <div className="flex items-center justify-center w-10 h-10 rounded-md">
            <a href="https://discord.gg/SvxwVpJ2" target="_blank" rel="noopener noreferrer" aria-label="Visit us on Discord">
              <img
                src="./Discord.png" // Placeholder for Discord logo
                alt="Discord Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/24x24/000000/FFFFFF?text=X'; }}
              />
            </a>
          </div>

          {/* Feedback Icon - directly opens the feedback form */}
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full cursor-pointer overflow-hidden
                       transition-colors duration-200" // Increased size to w-16 h-16
            onClick={openFeedbackForm}
            title="Send app feedback"
          >
            {/* Icon for Send app feedback */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 24 24"> {/* Increased SVG size */}
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
        </div>

        {/* Render the FeedbackForm component */}
        <FeedbackForm
          showFeedbackForm={showFeedbackForm}
          closeFeedbackForm={closeFeedbackForm}
          capturedImage={capturedImage}
          setCapturedImage={setCapturedImage}
        />

        {/* "Product under Development" and "Send Feedbacks" text at the bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-gray-400 text-sm md:text-base flex items-center space-x-2 whitespace-nowrap">
          <span>Product under Development</span>
          <span className="text-gray-500">|</span>
          <span className="underline cursor-pointer" onClick={openFeedbackForm}>Send Feedbacks</span>
        </div>
      </div>
    </>
  );
}

export default App;
