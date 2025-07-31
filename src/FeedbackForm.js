import React, { useRef, useEffect } from 'react';

const FeedbackForm = ({ showFeedbackForm, closeFeedbackForm, capturedImage, setCapturedImage }) => {
  const feedbackFormRef = useRef(null);

  // Effect to handle clicks outside the feedback form
  useEffect(() => {
    function handleClickOutsideForm(event) {
      if (feedbackFormRef.current && !feedbackFormRef.current.contains(event.target)) {
        closeFeedbackForm();
        setCapturedImage(null); // Clear captured image when form closes
      }
    }
    document.addEventListener("mousedown", handleClickOutsideForm);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideForm);
    };
  }, [feedbackFormRef, closeFeedbackForm, setCapturedImage]);

  // This function is passed from App.jsx to handle the screenshot capture
  // and then update the capturedImage state in App.jsx
  const handleCaptureScreenshot = async () => {
    try {
      // html2canvas is loaded globally in App.jsx, so it should be available here
      const canvas = await html2canvas(document.body, {
        ignoreElements: (element) => {
          return feedbackFormRef.current && feedbackFormRef.current.contains(element);
        },
      });
      setCapturedImage(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      setCapturedImage(null);
    }
  };

  if (!showFeedbackForm) return null;

  return (
    <div ref={feedbackFormRef} className="fixed inset-y-0 right-0 w-full md:w-1/3 lg:w-1/4 xl:w-1/5 feedback-form-bg p-6 z-50 animate-slide-in-right flex flex-col space-y-6 rounded-l-xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-700">
        <h2 className="text-xl font-normal text-white">Send feedback to Us</h2>
        <button onClick={closeFeedbackForm} className="text-gray-400 hover:text-white transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {/* Describe your feedback */}
      <div>
        <label htmlFor="feedback" className="block text-gray-300 text-sm font-medium mb-2">
          Describe your feedback (required)
        </label>
        <textarea
          id="feedback"
          className="w-full h-32 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-500"
          placeholder="Tell us what prompted this feedback..."
        ></textarea>
        <p className="text-gray-500 text-xs mt-1">
          Please don't include any sensitive information
          <span className="ml-1 cursor-help" title="Sensitive information includes passwords, financial details, and personal identification numbers.">
            &#9432;
          </span>
        </p>
      </div>

      {/* Captured Screenshot Display / Capture Button */}
      {capturedImage ? (
        <div className="flex flex-col items-center space-y-2">
          <img src={capturedImage} alt="Captured Screenshot" className="max-w-full h-auto rounded-lg border border-gray-700" />
          <button onClick={() => setCapturedImage(null)} className="py-2 px-4 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200">
            Clear Screenshot
          </button>
        </div>
      ) : (
        <button onClick={handleCaptureScreenshot} className="w-full py-3 bg-gray-700 text-gray-200 font-semibold rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-600 transition-colors duration-200">
          {/* Desktop icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
          </svg>
          <span>Capture screenshot</span>
        </button>
      )}

      {/* Checkbox for email updates */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="emailUpdates"
          className="form-checkbox h-6 w-6 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
        />
        <label htmlFor="emailUpdates" className="ml-2 text-gray-300 text-sm font-semibold">
          We may email you for more information or updates
        </label>
      </div>

      {/* Submit button (placeholder) */}
      <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 mt-auto">
        Send
      </button>
    </div>
  );
};

export default FeedbackForm;
