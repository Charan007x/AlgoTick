// Shared utilities for extension
// Used by both popup.js and background.js

const API_URL = 'https://algotick.onrender.com/api';
const FRONTEND_URL = 'https://algotick.vercel.app';

// Storage helpers
const storage = {
  get: (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  },
  
  set: (key, value) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  },
  
  getMultiple: (keys) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  },
  
  clear: () => {
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  }
};

// API call helper with better error handling
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const token = await storage.get('token');
    const apiUrl = await storage.get('apiUrl') || API_URL;
    
    // Check if we need authentication for this endpoint
    const requiresAuth = !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup');
    
    if (requiresAuth && !token) {
      throw new Error('Please login first. Click the extension icon to login.');
    }
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`🌐 API Call: ${method} ${apiUrl}${endpoint}`);
    
    const response = await fetch(`${apiUrl}${endpoint}`, options);
    
    console.log(`📡 Response: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

// Add question helper
async function addQuestionToTracker(input) {
  try {
    // Detect input type
    const isNumber = /^\d+$/.test(input.trim());
    const payload = isNumber ? { questionNumber: input } : { url: input };
    
    console.log('📝 Adding question:', payload);
    
    const result = await apiCall('/questions', 'POST', payload);
    
    console.log('✅ Question added:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to add question:', error);
    throw error;
  }
}

// Check authentication
async function checkAuth() {
  try {
    const token = await storage.get('token');
    if (!token) {
      return false;
    }
    
    const data = await apiCall('/auth/me');
    return !!data.user;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}
