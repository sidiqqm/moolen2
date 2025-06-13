import { useState, useEffect } from "react";
import MarqueeText from "../components/MarqueeText";
import Footer from "../components/Footer";


const MoodCards = ({ moodData }) => {
  const getMoodCardStyle = (mood) => {
    const moodLower = mood.toLowerCase();
    
    switch (moodLower) {
      case 'happy':
        return {
          bgColor: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
          borderColor: 'border-yellow-400',
          emoji: '😊',
          icon: (
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">😊</span>
            </div>
          )
        };
      case 'sad':
        return {
          bgColor: 'bg-gradient-to-br from-blue-200 to-blue-300',
          borderColor: 'border-blue-400',
          emoji: '😢',
          icon: (
            <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">😢</span>
            </div>
          )
        };
      case 'angry':
        return {
          bgColor: 'bg-gradient-to-br from-red-200 to-red-300',
          borderColor: 'border-red-400',
          emoji: '😠',
          icon: (
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-white">😠</span>
            </div>
          )
        };
      case 'neutral':
        return {
          bgColor: 'bg-gradient-to-br from-gray-200 to-gray-300',
          borderColor: 'border-gray-400',
          emoji: '😐',
          icon: (
            <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">😐</span>
            </div>
          )
        };
      case 'excited':
        return {
          bgColor: 'bg-gradient-to-br from-orange-200 to-orange-300',
          borderColor: 'border-orange-400',
          emoji: '🤩',
          icon: (
            <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🤩</span>
            </div>
          )
        };
      case 'anxious':
        return {
          bgColor: 'bg-gradient-to-br from-purple-200 to-purple-300',
          borderColor: 'border-purple-400',
          emoji: '😰',
          icon: (
            <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">😰</span>
            </div>
          )
        };
      default:
        return {
          bgColor: 'bg-gradient-to-br from-indigo-200 to-indigo-300',
          borderColor: 'border-indigo-400',
          emoji: '🙂',
          icon: (
            <div className="w-16 h-16 bg-indigo-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🙂</span>
            </div>
          )
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!moodData || moodData.length === 0) {
    console.log("No mood data found or moodData is empty.");
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No mood records found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {moodData.map((mood, index) => {
          const cardStyle = getMoodCardStyle(mood.mood);
          const confidencePercentage = Math.round(mood.confidence * 100);

          console.log(`Rendering card for mood: ${mood.mood}, confidence: ${confidencePercentage}%`);

          return (
            <div
              key={mood.id || index}
              className={`
                ${cardStyle.bgColor} 
                ${cardStyle.borderColor}
                relative p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl 
                transition-all duration-300 hover:-translate-y-1
                min-h-[280px] flex flex-col
                transform rotate-1 hover:rotate-0
              `}
              style={{
                filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.1))'
              }}
            >
              <div className="absolute top-4 right-4">
                <button className="text-gray-600 hover:text-gray-800 p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="12" cy="19" r="2"/>
                  </svg>
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                {mood.mood}
              </h3>

              <div className="flex justify-center mb-4">
                {cardStyle.icon}
              </div>

              <div className="flex-grow">
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Feeling {mood.mood.toLowerCase()} with {confidencePercentage}% confidence. 
                  Your emotional state has been captured and recorded for your wellness journey.
                </p>
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-300/50">
                <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                  Read More
                </button>
                <span className="text-sm text-gray-600">
                  {formatTimestamp(mood.timestamp)}
                </span>
              </div>

              <div className="absolute -top-2 -left-2 bg-white rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow-md">
                {formatDate(mood.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DailyMoodTracker = () => {
  const [userId, setUserId] = useState(null); 
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    console.log("LocalStorage userData:", userDataString);  // Log user data from localStorage

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log("Parsed user data:", userData);  // Log parsed user data
        if (userData && userData.id) {
          console.log("Setting User ID:", userData.id);  // Log the userId before setting it
          setUserId(userData.id); // Set user_id from localStorage (use `id` instead of `user_id`)
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    console.log("User ID:", userId);  // Log the user ID when it's set
    if (userId) {
      setLoading(true);
      fetch(`https://moolenbackend.shop/api/get-moods?user_id=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched mood data:", data);  // Log the API response
          if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
            setMoodData(data.data); // Set mood data to state
          } else {
            setMoodData([]);  // Set mood data as empty array if no data found
            setError("No mood records found");
            console.log("No mood data available.");
          }
        })
        .catch((err) => {
          setMoodData([]);
          setError("Error fetching mood data");
          console.error("Error during fetch:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#AADAFB] to-[#fff] pt-18 font-nunito">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-12 relative">
          <span className="relative z-10">Track Your Daily Mood</span>
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-0">
            <div className="w-16 h-16 rounded-full border-4 border-sky-200 opacity-70"></div>
          </div>
          <div className="absolute -right-4 bottom-0 z-0">
            <div className="w-20 h-8 rounded-full border-2 border-pink-200 opacity-70"></div>
          </div>
        </h1>

      </section>

      {/* Daily Journal Section */}
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 mt-4"> {/* Added margin-top (mt-4) here */}
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Your Daily Mood Journal
          </h1>
          <MoodCards moodData={moodData} />
        </div>
      </div>
            <Footer />
    </div>
  );
};

export default DailyMoodTracker;
