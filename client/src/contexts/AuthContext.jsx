// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
export const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth status on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Provide the state and setter to children
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easier consumption
export const useAuth = () => useContext(AuthContext);