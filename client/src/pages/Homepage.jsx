import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";
import AOS from "aos";
import "aos/dist/aos.css";

import Review from "../components/Review";
import Footer from "../components/Footer";

const Homepage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const handleProtectedRoute = (path) => {
    if (!isLoggedIn) {
      alert("Please log in to access this feature.");
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const handleMoodCheckIn = () => {
    handleProtectedRoute("/track-mood");
  };

  return (
    <div className="w-full" id="home">
      {/* Landing Page 1 */}
      <section className="flex flex-col lg:flex-row w-full px-6 lg:px-28 bg-gradient-to-b from-primary to-[#fff] pt-12 lg:pt-24 gap-8 min-h-screen items-center">
        <div className="w-full lg:w-2/3 flex flex-col justify-center gap-6 mt-10 items-center lg:items-start">
          <h1 className="text-3xl text-center lg:text-start md:text-4xl lg:text-5xl font-bold font-nunito md:max-w-2xl lg:max-w-4xl" data-aos="fade-down">
            Understand Your Emotions, Embrace Your{" "}
            <span className="relative inline-block" data-aos="zoom-in" data-aos-delay="300">
              Journey
              <img
                src="/circle.png"
                alt="Decorative circle"
                className="absolute -top-2 -left-3 w-40 md:w-56 rounded-full"
              />
            </span>
          </h1>

          <p className="text-sm text-center lg:text-start lg:text-base md:text-base font-nunito max-w-xl italic flex flex-wrap justify-center lg:justify-start">
            {[
              "Discover", "your", "mood,", "express", "your", "feelings,", "and", "grow",
              "every", "day", "with", "MooLen,", "a", "gentle", "space", "where",
              "your", "emotions", "are", "seen,", "heard,", "and", "nurtured."
            ].map((word, index) => (
              <span key={index} data-aos="fade-down" data-aos-delay={index * 100} className="inline-block mx-1">
                {word}
              </span>
            ))}
          </p>

          {isLoggedIn && user && (
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200">
              <p className="text-sm font-nunito text-gray-700">
                Welcome back, <span className="font-semibold">{user.username}</span>! 👋
              </p>
            </div>
          )}

          <button
            onClick={handleMoodCheckIn}
            className="bg-secondary text-white text-sm font-bold font-nunito px-12 py-3 md:px-16 md:py-4 lg:px-8 lg:py-3 rounded-3xl w-fit hover:opacity-90 transition-transform duration-300 hover:scale-105"
          >
            Track Your Mood
          </button>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center items-center" data-aos="zoom-in-left">
          <img
            src="/battery.png"
            alt="Mood battery illustration"
            className="w-full max-w-[500px] xl:max-w-[840px]"
          />
        </div>
      </section>

      {/* Landing Page 2 */}
      <section className="px-6 sm:px-8 bg-gradient-to-b from-[#fff] to-primary pt-34 pb-24 min-h-screen flex flex-col justify-center" id="features">
        <h2 className="mb-14 font-bold font-nunito text-xl lg:text-3xl text-center" data-aos="fade-up">
          How Can Moolen Help You Feel Better Today
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:px-24 justify-items-center">
          {[
            { path: "/track-mood", title: "Mood Check-In", icon: "letter.png", protected: true },
            { path: "/journal", title: "Daily Journal", icon: "book.png", protected: true },
            { path: "/self-assessment", title: "Self Assessment", icon: "task.png", protected: true },
            { path: "/daily-mood", title: "Daily Mood", icon: "book.png", protected: true },
            { path: "/article", title: "Daily Tips & Inspiration", icon: "lamp.png", protected: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className="w-full max-w-[400px] transform hover:scale-105 transition duration-300 ease-in-out"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              {item.protected ? (
                <div
                  onClick={() => handleProtectedRoute(item.path)}
                  className="border-2 border-slate-400 px-6 py-4 flex items-center justify-between rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-nunito text-lg">{item.title}</p>
                    {!isLoggedIn && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        Login Required
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 items-center">
                    <img src={`/${item.icon}`} alt={`${item.title} icon`} className="size-9" />
                    <ChevronRightIcon className="size-6" />
                  </div>
                </div>
              ) : (
                <Link to={item.path} className="block">
                  <div className="border-2 border-slate-400 px-6 py-4 flex items-center justify-between rounded-lg hover:bg-slate-100 transition">
                    <p className="font-nunito text-lg">{item.title}</p>
                    <div className="flex gap-4 items-center">
                      <img src={`/${item.icon}`} alt={`${item.title} icon`} className="size-9" />
                      <ChevronRightIcon className="size-6" />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Landing Page 3 */}
        <div className="mt-24 flex flex-col lg:flex-row items-center gap-12 min-h-screen" id="about">
          <div className="w-full lg:w-1/2 flex justify-center" data-aos="fade-right">
            <img
              src="/purba.png"
              alt="Companion illustration"
              className="w-full max-w-[500px] md:max-w-[640px]"
            />
          </div>

          <div className="w-full h-full lg:w-1/2 px-4 flex flex-col items-center font-nunito">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 max-w-xl" data-aos="fade-left">
              A Gentle Companion for Your Emotional Journey
            </h1>
            <div className="text-base md:text-lg text-center max-w-2xl">
              <Typewriter
                options={{
                  strings: [
                    "MooLen is a web-based platform designed to help you understand and care for your emotional well-being.",
                    "Through real-time mood detection, daily journaling, and thoughtful self-assessment, MooLen creates a safe, supportive space where you can express yourself freely and track your emotional growth over time.",
                    "With MooLen, every feeling matters, and every small step counts."
                  ],
                  autoStart: true,
                  delay: 30,
                  pauseFor: 2500,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section className="bg-gradient-to-b font-nunito from-primary to-[#fff] flex flex-col mb-32 px-6" id="reviews">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-24 text-center" data-aos="fade-up">
          <img src="/star.png" alt="Star icon" className="size-10 sm:size-12" />
          <div>
            <p className="text-md">Insights on Mental Wellness</p>
            <h1 className="text-2xl sm:text-3xl font-bold">What People Are Saying</h1>
          </div>
          <img src="/wave.png" alt="Wave icon" className="w-24 sm:w-28" />
        </div>

        <div className="flex gap-6 overflow-x-auto pb-12 mb-20">
          {[...Array(10)].map((_, index) => (
            <motion.div
              key={index}
              className="min-w-[300px]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.3 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <Review />
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
            <button className="px-12 sm:px-36 py-3 bg-[#1C2444] text-white font-bold text-lg shadow-lg rounded-full transition-transform duration-300 hover:scale-105">
              Tell Your Opinion Here
            </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;