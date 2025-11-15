import React, { useState } from 'react';
import axios from 'axios';

const TestAuth = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const testSignup = async () => {
    setLoading(true);
    setResult('Testing signup...');
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
      });
      
      setResult(JSON.stringify(response.data, null, 2));
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setResult(prev => prev + '\n\n✅ Token saved to localStorage');
      }
    } catch (error) {
      setResult(`❌ Error: ${error.response?.data?.message || error.message}\n\n${JSON.stringify(error.response?.data, null, 2)}`);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      
      setResult(JSON.stringify(response.data, null, 2));
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setResult(prev => prev + '\n\n✅ Token saved to localStorage');
      }
    } catch (error) {
      setResult(`❌ Error: ${error.response?.data?.message || error.message}\n\n${JSON.stringify(error.response?.data, null, 2)}`);
    }
    setLoading(false);
  };

  const testGetUser = async () => {
    setLoading(true);
    setResult('Testing get user...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setResult('❌ No token found in localStorage');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`❌ Error: ${error.response?.status} ${error.response?.statusText}\n\n${JSON.stringify(error.response?.data, null, 2)}`);
    }
    setLoading(false);
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    setResult(token ? `Token exists:\n${token}` : '❌ No token in localStorage');
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setResult('✅ Token cleared');
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔧 JWT Authentication Test</h1>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <p className="text-white/60 mb-4">API URL: <span className="text-[#61dca3]">{API_URL}</span></p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testSignup}
              disabled={loading}
              className="bg-[#61dca3] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#4dc98b] disabled:opacity-50"
            >
              Test Signup
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-[#61b3dc] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#4d9dc9] disabled:opacity-50"
            >
              Test Login
            </button>
            
            <button
              onClick={testGetUser}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50"
            >
              Test Get User
            </button>
            
            <button
              onClick={checkToken}
              className="bg-white/10 text-white px-4 py-3 rounded-lg font-semibold hover:bg-white/20"
            >
              Check Token
            </button>
            
            <button
              onClick={clearToken}
              className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg font-semibold hover:bg-red-500/30"
            >
              Clear Token
            </button>
          </div>

          {loading && (
            <div className="text-white/60 mb-4">⏳ Loading...</div>
          )}

          <div className="bg-black/50 border border-white/10 rounded-lg p-4">
            <pre className="text-white/80 text-sm overflow-auto max-h-96">
              {result || 'Click a button to test...'}
            </pre>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Instructions:</h2>
          <ol className="text-white/80 space-y-2 list-decimal list-inside">
            <li>Click "Test Signup" - Should create a user and return a token</li>
            <li>Click "Test Get User" - Should fetch user data using the token</li>
            <li>If successful, JWT authentication is working!</li>
            <li>If failed, check the error message for details</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
