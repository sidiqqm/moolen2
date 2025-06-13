// src/components/Layout.jsx
import React, { useEffect } from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

function Layout() { // No longer accepts isLoggedIn, setIsLoggedIn as props
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn } = useAuth(); // Get isLoggedIn and setIsLoggedIn from context

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Optional: scroll ke atas kalau gak ada hash
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <div>
      <div>
        {/* Pass isLoggedIn and setIsLoggedIn to Navbar */}
        {/* Navbar will now directly use these values from props,
            which themselves are sourced from the AuthContext. */}
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;