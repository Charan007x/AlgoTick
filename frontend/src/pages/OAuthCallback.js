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
        console.error('OAuth error:', error);
        navigate('/login?error=oauth_failed');
        return;
      }

      if (token) {
        try {
          // Store the token
          localStorage.setItem('token', token);
          
          // Update auth context - this will trigger the auth check in AuthContext
          setToken(token);

          // Small delay to let the auth check complete
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        } catch (err) {
          console.error('Token processing error:', err);
          navigate('/login?error=auth_failed');
        }
      } else {
        // No token found, redirect to login
        console.error('No token in callback');
        navigate('/login?error=no_token');
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
