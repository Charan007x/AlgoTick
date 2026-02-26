import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        if (errorParam) {
          setError('OAuth authentication failed');
          setTimeout(() => navigate('/login?error=oauth_failed'), 2000);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          setTimeout(() => navigate('/login?error=no_token'), 2000);
          return;
        }

        // Store the token
        localStorage.setItem('token', token);

        // Verify token works by fetching user data
        try {
          await authAPI.getCurrentUser();
          
          // Update auth context
          setToken(token);
          
          // Navigate to new dashboard
          navigate('/home', { replace: true });
        } catch (verifyError) {
          console.error('Token verification failed:', verifyError);
          localStorage.removeItem('token');
          setError('Authentication verification failed');
          setTimeout(() => navigate('/login?error=verify_failed'), 2000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication processing error');
        setTimeout(() => navigate('/login?error=processing_failed'), 2000);
      }
    };

    processCallback();
  }, [location, navigate, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-xl mb-4">❌</div>
            <p className="text-red-400 text-lg">{error}</p>
            <p className="text-white/60 text-sm mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="inline-block">
              <div className="w-16 h-16 border-4 border-[#61dca3] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-white text-lg">Completing authentication...</p>
            <p className="mt-2 text-white/60 text-sm">Please wait while we verify your account</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
