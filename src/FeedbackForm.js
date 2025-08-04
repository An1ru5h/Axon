import React, { useRef, useEffect, useState } from "react";
import { db } from "./firebase"; // your Firebase config
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

const FeedbackForm = ({ showFeedbackForm, closeFeedbackForm }) => {
  const feedbackFormRef = useRef(null);

  const [feedbackText, setFeedbackText] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [user, setUser] = useState(null); // Store user auth state
  const [authLoading, setAuthLoading] = useState(true); // To wait for auth state

  useEffect(() => {
    const auth = getAuth();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthLoading(false);
      } else {
        // Sign in anonymously if not signed in
        signInAnonymously(auth)
          .then(() => {
            // Anonymous sign-in successful
            setAuthLoading(false);
          })
          .catch((error) => {
            console.error("Anonymous sign-in error:", error);
            setAuthLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClickOutsideForm = (event) => {
    if (feedbackFormRef.current && !feedbackFormRef.current.contains(event.target)) {
      closeFeedbackForm();
      setFeedbackSent(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideForm);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideForm);
    };
  }, []);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      alert("Feedback is required.");
      return;
    }

    if (!user) {
      alert("Authenticating... Please wait a moment and try again.");
      return;
    }

    setIsSubmitting(true);
    setFeedbackSent(false);

    try {
      await addDoc(collection(db, "feedback"), {
        text: feedbackText,
        emailUpdates,
        createdAt: serverTimestamp(),
        userId: user.uid, // optional: track who submitted
      });

      setFeedbackSent(true);
      setFeedbackText("");
      setEmailUpdates(false);

      setTimeout(() => {
        setFeedbackSent(false);
        // closeFeedbackForm(); // optionally close after submission
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      alert(`Error submitting feedback: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showFeedbackForm) return null;

  return (
    <div
      ref={feedbackFormRef}
      className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 feedback-form-bg p-6 z-50 animate-slide-in-right flex flex-col space-y-6 rounded-l-xl"
    >
      <div className="flex justify-between items-center pb-4 border-b border-gray-700">
        <h2 className="text-xl font-normal text-white">Send feedback to Us</h2>
        <button
          onClick={closeFeedbackForm}
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <div>
        <label
          htmlFor="feedback"
          className="block text-gray-300 text-sm font-medium mb-2"
        >
          Describe your feedback (required)
        </label>
        <textarea
          id="feedback"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          className="w-full h-32 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-500"
          placeholder="Tell us what prompted this feedback..."
          disabled={authLoading}
        />
        <div className="flex items-center text-gray-500 text-xs mt-1">
          <span>Please don't include any sensitive information</span>
          <span
            className="ml-1 cursor-help"
            title="Sensitive information includes passwords, financial details, and personal identification numbers."
          >
            &#9432;
          </span>
        </div>
      </div>

      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="emailUpdates"
          checked={emailUpdates}
          onChange={(e) => setEmailUpdates(e.target.checked)}
          className="form-checkbox h-6 w-6 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
          disabled={authLoading}
        />
        <label
          htmlFor="emailUpdates"
          className="ml-2 text-gray-300 text-sm font-semibold"
        >
          We may email you for more information or updates
        </label>
      </div>

      <button
        disabled={isSubmitting || feedbackSent || authLoading}
        onClick={handleSubmit}
        className={`w-full py-3 font-medium rounded-lg transition-colors duration-200 mt-auto
          ${
            isSubmitting || feedbackSent || authLoading
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
      >
        {authLoading
          ? "Authenticating..."
          : isSubmitting
          ? "Sending..."
          : feedbackSent
          ? "Feedback Sent!"
          : "Send"}
      </button>
    </div>
  );
};

export default FeedbackForm;
