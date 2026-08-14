import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { queryClient } from '../lib/queryClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = async () => {
      const currentToken = localStorage.getItem('token');
      console.log('AuthContext - Checking auth, token exists:', !!currentToken);
      
      if (currentToken) {
        try {
          console.log('AuthContext - Fetching user data...');
          const response = await authAPI.getCurrentUser();
          console.log('AuthContext - User authenticated:', response.data.user.username);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
          setToken(currentToken);
        } catch (error) {
          console.error('AuthContext - Auth check failed:', error.response?.status, error.response?.data);
          
          // If user is blocked, clear auth and show message
          if (error.response?.status === 403 && error.response?.data?.message?.includes('blocked')) {
            console.log('AuthContext - User account is blocked');
          }
          
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('AuthContext - No token found');
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      console.log('🔑 Login attempt with:', credentials.email);
      const response = await authAPI.login(credentials);
      console.log('✅ Login response:', response.data);
      
      const { token: newToken, user: userData } = response.data;
      
      if (!newToken) {
        console.error('❌ No token in login response');
        return {
          success: false,
          message: 'No authentication token received',
        };
      }
      
      console.log('💾 Storing token and user data');
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      console.log('✅ Login successful for user:', userData.username);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const signup = async (userData) => {
    try {
      console.log('📝 Signup attempt with:', userData.username, userData.email);
      const response = await authAPI.signup(userData);
      console.log('✅ Signup response:', response.data);
      
      const { token: newToken, user: newUser } = response.data;
      
      if (!newToken) {
        console.error('❌ No token in signup response');
        return {
          success: false,
          message: 'No authentication token received',
        };
      }
      
      console.log('💾 Storing token and user data');
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      
      console.log('✅ Signup successful for user:', newUser.username);
      return { success: true };
    } catch (error) {
      console.error('❌ Signup error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, isAuthenticated: !!user, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
