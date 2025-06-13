import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const MoodTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [cameraActive, setCameraActive] = useState(false); // State to track if camera stream is active

  // Effect to load user_id on component mount and cleanup camera
  useEffect(() => {
    console.log("DEBUG MoodTracker: useEffect ran.");

    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData && userData.id) {
          setUserId(userData.id);
          console.log("DEBUG MoodTracker: User ID loaded:", userData.id);
        } else {
          setError("User ID not found in local storage. Please log in again.");
          console.error("User ID not found in localStorage userData.");
        }
      } catch (e) {
        setError("Error retrieving user data. Please clear cache and log in.");
        console.error("Error parsing user data from localStorage", e);
      }
    } else {
      setError("You must be logged in to track your mood.");
      console.error("No user data found in localStorage.");
    }

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        console.log("DEBUG MoodTracker: Stopping camera stream during cleanup.");
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraActive(false); // Ensure cameraActive is false on unmount
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Function to explicitly start camera when "Mulai Kamera" is clicked
  const startCamera = async () => {
    setError(""); // Clear any previous errors
    console.log("DEBUG MoodTracker: Attempting to start camera.");
    try {
      // Always ensure videoRef.current is available here
      if (!videoRef.current) {
        console.warn("DEBUG MoodTracker: videoRef.current was null before getUserMedia. Retrying after next render.");
        setError("Kesalahan: Elemen video kamera belum siap.");
        // We'll rely on the rendering cycle to make videoRef available
        // For now, prevent further execution until it's available
        return; 
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream; // Assign stream

      // Add an event listener for when the video metadata has loaded
      videoRef.current.onloadedmetadata = () => {
        console.log("DEBUG MoodTracker: Video metadata loaded. Attempting to play video.");
        videoRef.current.play().catch(playErr => {
          console.error("Error auto-playing video:", playErr);
          setError("Gagal memutar video kamera. (Auto-play diblokir?)");
        });
      };
      
      setCameraActive(true); // Mark camera as active
      console.log("DEBUG MoodTracker: Camera stream obtained and assigned.");
    } catch (err) {
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
      console.error("Error accessing camera:", err);
      setCameraActive(false); // Set camera to inactive on error
    }
  };

  // Function to stop the camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      console.log("DEBUG MoodTracker: Stopping camera stream.");
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false); // Mark camera as inactive
  };

  // Function to reset capture and prepare for a new one
  const resetCapture = () => {
    console.log("DEBUG MoodTracker: Resetting capture.");
    setCapturedImageUrl(null);
    setLoading(false); // Ensure loading is reset
    setError(""); // Clear any previous errors

    // Attempt to start camera again if user ID is available
    if (userId) {
      startCamera(); // This will activate the camera again for a new capture
    } else {
      setError("Tidak dapat memulai kamera. Harap login untuk melacak mood Anda.");
    }
  };

  // Function to capture mood from the camera feed
  const captureMood = () => {
    console.log("DEBUG MoodTracker: Attempting to capture mood.");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Detailed pre-checks before proceeding
    if (!video) {
      setError("Kamera video element tidak siap.");
      console.error("Error: videoRef.current is null.");
      return;
    }
    if (!canvas) {
      setError("Elemen kanvas tidak siap.");
      console.error("Error: canvasRef.current is null.");
      return;
    }
    if (!streamRef.current || !cameraActive) { // Ensure stream is active and cameraActive state is true
      setError("Kamera tidak aktif. Harap mulai kamera terlebih dahulu.");
      console.error("Error: streamRef.current is null or cameraActive is false.");
      return;
    }
    if (!userId) {
      setError("User ID tidak ditemukan. Harap login untuk melacak mood Anda.");
      console.error("Error: userId is null or undefined.");
      return;
    }
    // Crucial check: Ensure video has dimensions before drawing
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Kamera belum siap menangkap gambar (video dimensi nol).");
      console.error("Error: Video dimensions are zero (videoWidth:", video.videoWidth, "videoHeight:", video.videoHeight, ").");
      return;
    }


    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply mirroring for a natural selfie-like view
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Reset transform to avoid affecting subsequent drawings if any
    context.setTransform(1, 0, 0, 1, 0, 0); 

    const imageUrl = canvas.toDataURL("image/jpeg");
    setCapturedImageUrl(imageUrl); // Display the captured image

    stopCamera(); // Stop camera after capturing

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError("Gagal menangkap gambar dari kamera.");
          setLoading(false);
          console.error("Error: Canvas toBlob resulted in null blob.");
          return;
        }
        
        // Basic image size validation (10MB limit)
        if (blob.size > 10 * 1024 * 1024) {
          setError("Ukuran gambar melebihi 10MB. Harap coba lagi.");
          setLoading(false);
          console.error("Error: Image size exceeds 10MB.");
          return;
        }

        setLoading(true);
        setError(""); // Clear any previous errors before API call

        try {
          const formData = new FormData();
          formData.append("image", blob, "capture.jpg");
          formData.append("user_id", userId); // Append the user_id for the backend

          console.log("DEBUG MoodTracker: Sending API request with userId:", userId); // Debugging API call
          const response = await fetch("https://moolenbackend.shop/api/mood", {
            method: "POST",
            body: formData,
            // DO NOT set Content-Type header for FormData, browser sets it automatically
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("API response not OK:", errorData);
            throw new Error(errorData.message || "Gagal memproses mood dari gambar.");
          }

          const responseData = await response.json();
          console.log("DEBUG MoodTracker: API Response Data:", responseData);

          if (!responseData.success || !responseData.prediction_result || typeof responseData.prediction_result.mood === 'undefined' || typeof responseData.prediction_result.confidence === 'undefined') {
            throw new Error("Format respons prediksi tidak valid dari server.");
          }

          const { mood, confidence } = responseData.prediction_result;
          
          console.log("DEBUG MoodTracker: Navigating to result page with mood:", mood, "confidence:", confidence, "image:", imageUrl);
          navigate('/track-mood/result', { 
            state: { 
              mood: mood,
              confidence: confidence,
              capturedImageUrl: imageUrl
            } 
          });

        } catch (err) {
          console.error("API call error:", err);
          setError(`Error: ${err.message}`);
        } finally {
          setLoading(false);
          console.log("DEBUG MoodTracker: Loading set to false.");
        }
      },
      "image/jpeg", // Image format
      0.9 // Quality (0.0 to 1.0)
    );
  };

  // Function to determine the reason for the button being disabled
  const getDisabledReason = () => {
    if (loading) return "Memproses Mood...";
    if (!userId) return "Harap login untuk melacak mood Anda.";
    if (error) return "Error: " + error;
    if (!cameraActive) return "Kamera tidak aktif.";
    // No specific reason for "Ambil Mood" when it's active
    return ""; 
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded-xl space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Pelacak Mood dengan Kamera</h2>

      {/* Render video element always, control visibility via display style */}
      <video
        ref={videoRef}
        autoPlay
        playsInline // Important for mobile browsers
        className="w-full rounded-lg border border-gray-300"
        style={{ 
          transform: "scaleX(-1)", 
          // Show video if cameraActive and no image captured, otherwise hide
          display: cameraActive && !capturedImageUrl ? 'block' : 'none' 
        }}
      />
      
      {/* Show captured image if available */}
      {capturedImageUrl && (
        <img
          src={capturedImageUrl}
          alt="Hasil Tangkapan Mood"
          className="w-full rounded-lg border border-gray-300"
        />
      )}

      {/* Show placeholder if camera is not active AND no image is captured */}
      {!cameraActive && !capturedImageUrl && (
        <div className="w-full h-[200px] bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500">
            {userId ? "Tekan 'Mulai Kamera' untuk mengaktifkan." : "Harap login untuk mengaktifkan kamera."}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for image processing */}

      <div className="flex gap-2 justify-center flex-wrap">
        {/* Render "Mulai Kamera" and "Ambil Mood" buttons side-by-side if no image is captured */}
        {!capturedImageUrl ? (
            <>
                <button
                  onClick={startCamera}
                  className="bg-purple-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !userId || !!error || cameraActive} // Disable if camera is already active, loading, or error
                >
                  Mulai Kamera
                </button>
                <button
                  onClick={captureMood}
                  className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !userId || !!error || !cameraActive} // Disabled until camera is active
                >
                  {loading ? "Memproses Mood..." : "Ambil Mood"}
                </button>
            </>
        ) : ( // Show "Ambil Ulang" button after image is captured
          <button
            onClick={resetCapture} // Call resetCapture to clear image and restart camera
            className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-blue-700 transition duration-300"
          >
            Ambil Ulang
          </button>
        )}
      </div>

      {/* Display reason for disabled button, unless it's currently loading */}
      {!capturedImageUrl && !loading && getDisabledReason() !== "" && (
        <p className="text-sm text-center text-gray-500 mt-2">
          {getDisabledReason()}
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Mengirim data untuk prediksi mood...</span>
        </div>
      )}

      {error && <p className="text-red-600 text-center text-sm mt-4">{error}</p>}
    </div>
  );
};

export default MoodTracker;
