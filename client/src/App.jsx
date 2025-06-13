// src/App.jsx
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"; // Import Outlet
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react'; // No more useState/useEffect for isLoggedIn here
import Layout from "./components/Layout";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TrackingMoodPage from "./pages/TrackingMoodPage";
import MoodPhotoPage from "./pages/MoodPhotoPage";
import MoodPhotoResultPage from "./pages/MoodPhotoResultPage";
import DailyJournalPage from "./pages/DailyJournalPage";
import DailyMoodTracker from "./pages/DailyMoodPage";
import ArticlePage from "./pages/ArticlePage";
import DeveloperPage from "./pages/developersPage";
import { SelfAssessment, AssessmentStart, AssessmentForm, SummaryForm } from "./pages/Self-assessmentPage";
import ProfilePage from "./pages/ProfilePage";
import ArticleDetailPage from "./pages/ArticleDetailPage";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Define the router outside the App component
const router = createBrowserRouter([
  {
    path: "/",
    // Layout will now consume AuthContext directly
    element: <Layout />, // No props needed for isLoggedIn/setIsLoggedIn here
    children: [
      {
        path: "/",
        // Homepage will also consume AuthContext
        element: <Homepage />, // No props needed for isLoggedIn here
      },
      {
        path: "/login",
        // LoginPage will consume AuthContext for setIsLoggedIn
        element: <LoginPage />, // No props needed for setIsLoggedIn here
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/track-mood",
        element: <MoodPhotoPage />,
      },
      {
        path: "/track-mood/result",
        element: <MoodPhotoResultPage />,
      },
      {
        path: "/journal",
        element: <DailyJournalPage />,
      },
      {
        path: "/daily-mood",
        element: <DailyMoodTracker />,
      },
      {
        path: "/article",
        element: <ArticlePage />,
      },
      { 
        path: "/article/:id", 
        element: <ArticleDetailPage /> 
      },
      {
        path: "/self-assessment",
        element: <SelfAssessment />,
      },
      {
        path: "/self-assessment/start",
        element: <AssessmentStart />,
      },
      {
        path: "/self-assessment/form",
        element: <AssessmentForm />,
      },
      {
        path: "/self-assessment/summary",
        element: <SummaryForm />,
      },
      {
        path: "/developer",
        element: <DeveloperPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },
]);

function App() {
  // Check for Google Client ID
  if (!GOOGLE_CLIENT_ID) {
    console.error("ERROR: VITE_GOOGLE_CLIENT_ID is not defined in your .env file!");
    return <div>Configuration Error: Google Client ID is missing.</div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;