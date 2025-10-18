import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (error) {
        // OAuth failed, redirect to login with error
        navigate('/login?error=OAuth authentication failed. Please try again.');
        return;
      }

      if (token) {
        // Store the token
        localStorage.setItem('token', token);
        
        // Update auth context
        if (setToken) {
          setToken(token);
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // No token found, redirect to login
        navigate('/login?error=Authentication failed. Please try again.');
      }
    };

    processCallback();
  }, [location, navigate, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-[#61dca3] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
