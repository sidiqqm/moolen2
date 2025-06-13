import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const Navbar = () => { // No longer needs to accept isLoggedIn, setIsLoggedIn as props directly
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth(); // Get isLoggedIn and setIsLoggedIn from context

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Update the login state via the context setter
    setIsLoggedIn(false);

    // Redirect to home page
    navigate('/');

    // Reload the entire page for a clean slate
    window.location.reload();
  };
  
  return (
    <header className="font-nunito fixed top-0 left-0 w-full z-40 bg-transparent/70 backdrop-blur-md shadow-md px-6 md:px-12 py-4 flex justify-between items-center transition-all">
      <div className="text-xl font-bold text-gray-800">
        <Link to="/" title="Go to Homepage">
          <img
            src="/logo-MooLen.png"
            alt="Logo"
            className="h-15 w-auto" // Consider setting a specific height for consistency, e.g., h-12
          />
        </Link>
      </div>

      <nav className="hidden md:flex gap-8 items-center text-gray-900 font-medium text-xl">
        {/* Navigation Links */}
        <Link to="/#about" className="hover:text-blue-600 transition">
          About us
        </Link>
        <Link to="/article" className="hover:text-blue-600 transition">
          Daily Tips
        </Link>
        <Link to="/developer" className="hover:text-blue-600 transition">
          Developers
        </Link>

        {/* Conditional rendering based on login status */}
        {isLoggedIn ? (
          // If logged in, show Logout button
          <button
            onClick={handleLogout}
            className="border border-red-600 text-red-600 px-5 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition"
          >
            Logout
          </button>
        ) : (
          // If not logged in, show Sign Up link
          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 px-5 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition"
          >
            Sign Up
          </Link>
        )}
      </nav>

      {/* TODO: Add a mobile navigation menu (hamburger icon) for smaller screens */}
    </header>
  );
};

export default Navbar;