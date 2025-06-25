import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import pb from './pbClient.js'; // import the client

function App() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to create a new record
      await pb.collection('waitlist').create({ email });

      setMessage("Thanks for your interest! We'll keep you updated.");
      setEmail('');
      setIsSubscribed(true);

      // 🎉 Trigger confetti animation on success
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error) {
      console.error(error);
      if (error?.data?.email?.message?.includes('unique')) {
        setMessage('This email is already registered.');
      } else {
        setMessage('Oops! Something went wrong.');
      }
    }

    setIsLoading(false);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (message) setMessage('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');

        .font-urbanist { font-family: 'Urbanist', sans-serif; }
        .font-figma-hand { font-family: 'Caveat', cursive; }

        .video-background {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2;
        }

        .video-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); z-index: -1;
        }

        .gradient-text-header {
          background: linear-gradient(to bottom, #ffffff, #ADD8E6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; color: transparent;
        }

        .gradient-text-subheading {
          background: linear-gradient(to bottom, #ffffff, #bbbbbb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; color: transparent;
        }

        .glass-box-gradient-bg {
          position: relative;
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.15), rgba(220, 220, 220, 0.1));
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .glass-box-gradient-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          pointer-events: none;
          opacity: 0.8;
        }

        .liquid-glass-icon-bg {
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(220, 220, 200, 0.15));
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .success-animation {
          animation: popFadeIn 0.8s ease-in-out forwards;
        }

        @keyframes popFadeIn {
          0% { opacity: 0; transform: scale(0.8); }
          60% { opacity: 1; transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .small-box-gradient {
          background: linear-gradient(to bottom right, #66A1F3, #22C9A6);
        }
      `}</style>

      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden font-urbanist text-white">
        <video className="video-background" autoPlay loop muted playsInline>
          <source src="https://videos.pexels.com/video-files/4822908/4822908-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay"></div>

        <main className="z-10 flex flex-col items-center w-full">
          <h1 className="text-5xl md:text-6xl font-normal mb-10 leading-tight gradient-text-header text-center">
            Launch <span className="font-figma-hand">Smarter</span>. Build <span className="font-figma-hand">Faster</span>.
          </h1>

          {/* Rectangular box above the glass box, now with a small gap */}
          <div className="w-40 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md mb-1 small-box-gradient">
            Built the Next
          </div>

          <div className="glass-box-gradient-bg rounded-2xl pt-6 pb-10 px-6 sm:px-12 md:px-20 max-w-2xl w-full text-center border border-gray-200 border-opacity-20">
            <p className="text-3xl md:text-4xl font-semibold mb-1 gradient-text-subheading">Join Our Waitlist!</p>
            <p className="text-lg text-gray-200 mb-6">
              Supercharge your startup journey with real-time tools, smart prompts, and seamless integrations.
            </p>

            {isSubscribed ? (
              <div className="bg-green-500 bg-opacity-70 text-white p-4 rounded-xl shadow-md success-animation">
                <p className="text-xl font-semibold mb-2">You're on the list! 🎉</p>
                <p className="text-base">We'll notify you as soon as we're ready. Stay tuned!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full sm:w-56 px-4 py-2 h-10 rounded-full bg-black text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300"
                  required
                  aria-label="Email address for waitlist"
                />
                <button
                  type="submit"
                  className="w-full sm:w-32 bg-white text-black font-bold py-2 px-4 h-10 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>
            )}

            {message && !isSubscribed && (
              <p className={`mt-4 text-sm font-medium ${message.includes('valid') ? 'text-yellow-300' : 'text-red-300'}`}>
                {message}
              </p>
            )}
          </div>

          <div className="mt-2 flex items-center justify-center w-12 h-12 rounded-md liquid-glass-icon-bg">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Visit us on X (formerly Twitter)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24" className="hover:opacity-80 transition-opacity duration-300">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </main>

        {/* Company logo placeholder added to the top-left corner */}
        <div className="fixed top-4 left-4 z-20">
          <img
            src="./Logo.png"
            alt="Company Logo"
            className="w-10 h-10 rounded-full" // Reduced Tailwind classes for smaller logo
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/F3F4F6/000000?text=Co.'; }} // Updated fallback dimensions
          />
        </div>
      </div>
    </>
  );
}

export default App;