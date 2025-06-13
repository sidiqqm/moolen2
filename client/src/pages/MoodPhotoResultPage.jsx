import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

const MoodPhotoResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [moodResult, setMoodResult] = useState("Unknown");
  const [confidence, setConfidence] = useState(null);
  const [displayImageUrl, setDisplayImageUrl] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (location.state) {
      const { mood, confidence, capturedImageUrl } = location.state;
      if (mood) {
        setMoodResult(mood);
        if (mood.toLowerCase() === "happy") {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
      if (typeof confidence === "number") {
        setConfidence(confidence);
      }
      if (capturedImageUrl) {
        const img = new Image();
        img.src = capturedImageUrl;
        img.onload = () => {
          setDisplayImageUrl(capturedImageUrl);
          setIsImageLoaded(true);
        };
      }
    }
  }, [location.state]);

  const getMoodStyles = (mood) => {
    const baseStyles = {
      happy: {
        bg: "bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400",
        text: "text-yellow-900",
        shadow: "shadow-yellow-300/50",
        emoji: "😊",
      },
      sad: {
        bg: "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300",
        text: "text-blue-900",
        shadow: "shadow-blue-300/50",
        emoji: "😢",
      },
      angry: {
        bg: "bg-gradient-to-br from-red-200 via-red-300 to-red-400",
        text: "text-red-900",
        shadow: "shadow-red-300/50",
        emoji: "😠",
      },
      neutral: {
        bg: "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400",
        text: "text-gray-900",
        shadow: "shadow-gray-300/50",
        emoji: "😐",
      },
      default: {
        bg: "bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400",
        text: "text-purple-900",
        shadow: "shadow-purple-300/50",
        emoji: "🤔",
      },
    };

    return baseStyles[mood.toLowerCase()] || baseStyles.default;
  };

  const moodStyles = getMoodStyles(moodResult);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start font-nunito relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-50">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full opacity-10 ${moodStyles.bg}`}
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8 md:gap-10">
        {/* Mood Result Section */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-col items-center relative mt-8 sm:mt-12"
          >
            <motion.h1
              className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"
              whileHover={{ scale: 1.05 }}
            >
              Today I feel...
            </motion.h1>

            <motion.div
              className={`
                px-12 py-6 sm:px-16 sm:py-8
                rounded-3xl text-3xl sm:text-4xl md:text-5xl 
                font-extrabold uppercase ${moodStyles.bg} ${moodStyles.text}
                shadow-lg backdrop-blur-sm
                flex items-center gap-3
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-4xl">{moodStyles.emoji}</span>
              {moodResult}
              {confidence && (
                <span className="text-sm font-normal opacity-80 ml-2">
                  ({Math.round(confidence * 100)}% match)
                </span>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Captured Image Display */}
        <motion.div
          className="relative z-10 w-full max-w-2xl mx-auto rounded-2xl shadow-xl overflow-hidden border-4 border-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {displayImageUrl ? (
            <>
              {!isImageLoaded && (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-200 animate-pulse">
                  <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <motion.img
                src={displayImageUrl}
                alt="Captured Mood"
                className={`w-full h-auto object-cover aspect-video ${
                  isImageLoaded ? "block" : "hidden"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isImageLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                onLoad={() => setIsImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 p-8">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-center text-lg font-medium">
                No image captured
                <br />
                <span className="text-sm opacity-80">
                  Try capturing your mood again
                </span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className={`
              px-8 py-4 rounded-full
              text-sm sm:text-base font-bold uppercase
              shadow-lg ${moodStyles.bg} ${moodStyles.text}
              flex items-center justify-center gap-2
              hover:shadow-xl transition-all
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/journal")}
          >
            <span>✍️</span> Journal My Feelings
          </motion.button>

          <motion.button
            className={`
              px-8 py-4 rounded-full
              text-sm sm:text-base font-bold uppercase
              bg-white text-gray-800 border-2 border-gray-200
              flex items-center justify-center gap-2
              hover:bg-gray-100 transition-all shadow-lg
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/track-mood")}
          >
            <span>🔄</span> Try Again
          </motion.button>
        </motion.div>

        {/* Mood Tips Section */}
        {moodResult !== "Unknown" && (
          <motion.div
            className={`w-full max-w-2xl mt-6 p-6 rounded-xl ${moodStyles.bg} bg-opacity-20 backdrop-blur-sm`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span>💡</span> {moodResult} Mood Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getMoodTips(moodResult).map((tip, index) => (
                <motion.div
                  key={index}
                  className="bg-white bg-opacity-80 p-3 rounded-lg shadow-sm"
                  whileHover={{ y: -2 }}
                >
                  <p className="text-sm">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Helper function for mood tips
const getMoodTips = (mood) => {
  const tips = {
    happy: [
      "Share your happiness with others",
      "Practice gratitude journaling",
      "Try creative activities to express your joy",
      "Spread positivity to those around you",
    ],
    sad: [
      "Reach out to a friend or loved one",
      "Listen to uplifting music",
      "Try gentle exercise like walking",
      "Write about your feelings in a journal",
    ],
    angry: [
      "Take deep breaths for 60 seconds",
      "Remove yourself from the situation",
      "Try physical activity to release tension",
      "Write down what's bothering you then tear it up",
    ],
    neutral: [
      "Try something new to spark interest",
      "Practice mindfulness meditation",
      "Explore creative outlets",
      "Connect with nature",
    ],
  };

  return (
    tips[mood.toLowerCase()] || [
      "Practice self-reflection",
      "Engage in activities you enjoy",
      "Connect with supportive people",
      "Be kind to yourself today",
    ]
  );
};

export default MoodPhotoResultPage;
