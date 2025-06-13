import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // Use GoogleLogin component
import { FcGoogle } from 'react-icons/fc'; // Keep this for the custom Google button style if you opt for it later
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { setIsLoggedIn } = useAuth(); // Get setIsLoggedIn from context

  // --- Google Registration/Login Success Handler (Same as LoginPage) ---
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('GoogleLogin onSuccess (credentialResponse object):', credentialResponse);
    console.log('Google ID Token (credentialResponse.credential):', credentialResponse.credential);

    if (!credentialResponse.credential) {
      console.error("Frontend: ID Token (credentialResponse.credential) is missing!");
      setError("Google sign-up/login failed: ID Token not received from Google.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Send the Google ID token to your backend's Google authentication endpoint.
      // Your backend should handle whether it's a new user (register) or existing (login).
      const response = await fetch('https://moolenbackend.shop/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userData', JSON.stringify(data.data.user)); // Assuming user data is returned
        alert('Google sign-up/login successful!');
        setIsLoggedIn(true); // Update the global authentication state
        navigate('/'); // Navigate to home or dashboard
      } else {
        setError(data.message || 'Google sign-up/login failed.');
        alert(data.message || 'Google sign-up/login failed.');
      }
    } catch (error) {
      console.error('Google API call error:', error);
      setError('Failed to connect to server for Google sign-up/login. Please try again.');
      alert('Failed to connect to server for Google sign-up/login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Google Registration/Login Error Handler (Same as LoginPage) ---
  const handleGoogleError = (errorResponse) => {
    console.error('Google sign-up/login failed (frontend GoogleLogin component):', errorResponse);
    setError('Google sign-up/login failed. Please try again.');
    alert('Google sign-up/login failed. Please try again.');
  };

  // --- Standard Email/Password Registration ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://moolenbackend.shop/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: firstName, // Using firstName as username based on your form
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        
        alert('Registration successful! Welcome to our platform.');
        setIsLoggedIn(true); // Update the global authentication state
        navigate('/'); // Navigate to home or dashboard
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name (Required)"
            required
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E2347]"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="email"
            placeholder="Email Address (Required)"
            required
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E2347]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password (Required, 6+ characters)"
            required
            minLength={6}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E2347]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <div className="text-right text-sm">
            <a href="#" className="text-black underline">Forgot your password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1E2347] text-white py-3 rounded-full shadow-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="space-y-3 flex justify-center">
          {/* Using GoogleLogin component directly, same as LoginPage */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            // You can add a custom button here if you want to style it,
            // otherwise, the default Google button will render.
            // Eg: render={renderProps => (
            //   <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="w-full flex items-center justify-center gap-2 border rounded-full py-3 shadow-sm bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
            //     <FcGoogle className="w-5 h-5" />
            //     <span className="font-medium">Continue with Google</span>
            //   </button>
            // )}
          />
        </div>

        <p className="text-xs text-center mt-6 text-gray-500">
          By clicking Continue, you agree to our <a href="#" className="underline">Terms</a> and acknowledge that you have read our <a href="#" className="underline">Privacy Policy</a>, which explains how to opt out of offers and promos
        </p>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
