// pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext'; // <--- Import useAuth hook

// LoginPage no longer accepts setIsLoggedIn as a prop
const LoginPage = () => {
    // Get setIsLoggedIn from the AuthContext
    const { setIsLoggedIn } = useAuth(); // <--- Consume setIsLoggedIn from context

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- Google Login Success Handler ---
    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('GoogleLogin onSuccess (credentialResponse object):', credentialResponse);
        console.log('Google ID Token (credentialResponse.credential):', credentialResponse.credential);

        if (!credentialResponse.credential) {
            console.error("Frontend: ID Token (credentialResponse.credential) is missing!");
            setError("Google login failed: ID Token not received from Google.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
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
                localStorage.setItem('userData', JSON.stringify(data.data.user));
                alert('Login dengan Google berhasil!');
                setIsLoggedIn(true); // <--- IMPORTANT: Update the global state via context
                navigate('/');
            } else {
                setError(data.message || 'Login dengan Google gagal.');
                alert(data.message || 'Login dengan Google gagal.');
            }
        } catch (error) {
            console.error('Google login API call error:', error);
            setError('Gagal menghubungi server. Silakan coba lagi.');
            alert('Gagal menghubungi server. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Google Login Error Handler ---
    const handleGoogleError = (errorResponse) => {
        console.error('Google login failed (frontend GoogleLogin component):', errorResponse);
        setError('Login Google gagal. Silakan coba lagi.');
        alert('Login Google gagal. Silakan coba lagi.');
    };

    // --- Standard Email/Password Login Function ---
    const loginUser = async (email, password) => {
        try {
            const response = await fetch('https://moolenbackend.shop/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userData', JSON.stringify(data.data.user));
                return { success: true, message: data.message, user: data.data.user, token: data.data.token };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please check your connection and try again.' };
        }
    };

    // --- Handle Form Submission for Email/Password Login ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please fill in all fields'); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { setError('Please enter a valid email address'); return; }

        setIsLoading(true);
        try {
            const result = await loginUser(email, password);
            if (result.success) {
                alert('Login successful! Welcome back.');
                setIsLoggedIn(true); // <--- IMPORTANT: Update the global state here too via context
                navigate('/');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center mt-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Log into your account</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email Address (required)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E2347] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <input
                        type="password"
                        placeholder="Password (Required, 6+ characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={isLoading}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E2347] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />

                    <div className="text-right text-sm">
                        <a href="#" className="text-black underline hover:text-gray-700">Forgot your password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1E2347] text-white py-3 rounded-full shadow-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? ( /* ... spinner ... */ 'Signing in...') : 'Continue'}
                    </button>
                </form>

                <div className="my-6 flex items-center justify-center">
                    <hr className="flex-grow border-gray-300" /><span className="px-3 text-gray-500 text-sm">OR</span><hr className="flex-grow border-gray-300" />
                </div>

                <div className="space-y-3 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </div>

                <p className="text-xs text-center mt-6 text-gray-500">
                    By clicking Continue, you agree to our <a href="#" className="underline hover:text-gray-700">Terms</a> and acknowledge that you have read our <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>, which explains how to opt out of offers and promos
                </p>

                <p className="text-sm text-center mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="underline font-medium hover:text-gray-700">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
