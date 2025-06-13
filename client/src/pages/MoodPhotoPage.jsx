// pages/MoodPhotoPage.jsx
import React, { useState, useEffect } from "react";
import MoodTracker from "../components/MoodTracker"; // This component will be updated

const MoodPhotoPage = () => {
  const [userName, setUserName] = useState("there"); // Default name

  useEffect(() => {
    // Get user data from local storage
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData && userData.username) {
          setUserName(userData.username);
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
      }
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden font-nunito relative">
      <div className="flex flex-col justify-center items-center gap-4 pt-12 h-full px-4">
        {/* Header - Display user's name */}
        <div className="z-10 text-center">
          <h1 className="text-4xl font-bold -mb-2">Hello, {userName}!</h1>
          <img src="/pink.png" alt="" className="w-72 mx-auto" />
        </div>

        {/* Canvas Camera and API Call Logic */}
        <MoodTracker /> {/* MoodTracker will handle the API call */}
      </div>

      {/* Background Images */}
      <img
        src="/yellow.png"
        alt=""
        className="absolute -right-1/6 -top-1/5 md:-right-1/6 md:-top-1/12 lg:-top-32 lg:left-56 w-[320px]"
      />
      <img
        src="/cream.png"
        alt=""
        className="absolute -right-16 bottom-0 md:-right-0 md:-bottom-18 lg:right-0 lg:-bottom-14 w-[140px] md:w-[180px] lg:w-[220px]"
      />
      <img
        src="/blue.png"
        alt=""
        className="absolute -left-1/5 -bottom-1/6 md:-left-1/4 md:-bottom-1/4 lg:-left-48 lg:top-80 w-[320px] md:w-[420px]"
      />
    </div>
  );
};

export default MoodPhotoPage;