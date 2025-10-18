const API_URL = 'https://algotick.onrender.com/api';
const FRONTEND_URL = 'https://algotick.vercel.app';

// Sync auth to website
function syncToWebsite(token, user) {
  // Find all frontend tabs and sync auth
  chrome.tabs.query({ url: `${FRONTEND_URL}/*` }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: 'syncAuthFromExtension',
          token: token,
          user: user
        },
        (response) => {
          if (!chrome.runtime.lastError) {
            console.log('Auth synced to website tab');
          }
        }
      );
    });
  });
}

// Get token from storage
async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token'], (result) => {
      resolve(result.token || null);
    });
  });
}

// Save token to storage
async function saveToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ token }, resolve);
  });
}

// Get user from storage
async function getUser() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['user'], (result) => {
      resolve(result.user || null);
    });
  });
}

// Save user to storage
async function saveUser(user) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ user }, resolve);
  });
}

// Clear storage
async function clearStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.clear(resolve);
  });
}

// Show message
function showMessage(text, type = 'success') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.classList.remove('hidden');
  
  setTimeout(() => {
    messageEl.classList.add('hidden');
  }, 3000);
}

// API calls with token
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    // Check if response is ok before parsing JSON
    if (!response.ok) {
      let errorMessage = 'Something went wrong';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Login
async function login(email, password) {
  try {
    const data = await apiCall('/auth/login', 'POST', { email, password });
    await saveToken(data.token);
    await saveUser(data.user);
    
    // Sync to website if it's open
    syncToWebsite(data.token, data.user);
    
    return data;
  } catch (error) {
    throw error;
  }
}

// Signup
async function signup(username, email, password) {
  try {
    const data = await apiCall('/auth/signup', 'POST', { username, email, password });
    await saveToken(data.token);
    await saveUser(data.user);
    
    // Sync to website if it's open
    syncToWebsite(data.token, data.user);
    
    return data;
  } catch (error) {
    throw error;
  }
}

// Logout
async function logout() {
  await clearStorage();
  
  // Clear website auth if open
  chrome.tabs.query({ url: `${FRONTEND_URL}/*` }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: 'clearAuth' });
    });
  });
  
  showLoginSection();
}

// Get dashboard stats
async function getDashboardStats() {
  try {
    const data = await apiCall('/questions/dashboard-stats');
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

// Add question
async function addQuestion(input) {
  try {
    // Detect input type
    const isNumber = /^\d+$/.test(input.trim());
    const payload = isNumber ? { questionNumber: input } : { url: input };
    
    const data = await apiCall('/questions', 'POST', payload);
    return data;
  } catch (error) {
    throw error;
  }
}

// Show login section
function showLoginSection() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('dashboardSection').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('signupForm').classList.add('hidden');
}

// Show dashboard section
function showDashboardSection() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('dashboardSection').classList.remove('hidden');
}

// Load dashboard
async function loadDashboard() {
  const user = await getUser();
  if (user) {
    document.getElementById('username').textContent = user.username;
  }
  
  const stats = await getDashboardStats();
  if (stats) {
    document.getElementById('totalSolved').textContent = stats.totalSolved || 0;
    document.getElementById('dueToday').textContent = stats.dueToday || 0;
    document.getElementById('pending').textContent = stats.pending || 0;
    document.getElementById('revised').textContent = stats.revised || 0;
  }
  
  // Check if we're on a LeetCode problem page
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('leetcode.com/problems/')) {
      // Extract problem info directly from URL
      const urlMatch = tabs[0].url.match(/\/problems\/([^\/\?]+)/);
      
      if (urlMatch && urlMatch[1]) {
        const titleSlug = urlMatch[1];
        const title = titleSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        displayCurrentProblem({
          title,
          titleSlug,
          difficulty: 'Unknown' // We'll get this from backend
        });
      }
    }
  });
}

// Display current problem info
function displayCurrentProblem(problem) {
  const infoDiv = document.getElementById('currentProblemInfo');
  const addBtn = document.getElementById('addCurrentBtn');
  
  infoDiv.innerHTML = `
    <div class="current-problem">
      <div class="title">${problem.title}</div>
      <span class="difficulty ${problem.difficulty}">${problem.difficulty}</span>
    </div>
  `;
  
  infoDiv.classList.remove('hidden');
  addBtn.classList.remove('hidden');
  
  // Store problem data
  addBtn.dataset.titleSlug = problem.titleSlug;
}

// Check authentication on load
async function checkAuth() {
  const token = await getToken();
  const user = await getUser();
  
  if (token && user) {
    // Verify token is still valid
    try {
      await apiCall('/auth/me');
      showDashboardSection();
      await loadDashboard();
    } catch (error) {
      console.error('Token validation failed:', error);
      // Token is invalid, clear storage and show login
      await clearStorage();
      showLoginSection();
    }
  } else {
    showLoginSection();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // Login form toggle
  document.getElementById('showSignupBtn').addEventListener('click', () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
  });
  
  document.getElementById('showLoginBtn').addEventListener('click', () => {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
  });
  
  // Login
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }
    
    try {
      await login(email, password);
      showMessage('Login successful!', 'success');
      showDashboardSection();
      await loadDashboard();
    } catch (error) {
      showMessage(error.message || 'Login failed', 'error');
    }
  });
  
  // Signup
  document.getElementById('signupBtn').addEventListener('click', async () => {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    
    if (!username || !email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }
    
    try {
      await signup(username, email, password);
      showMessage('Signup successful!', 'success');
      showDashboardSection();
      await loadDashboard();
    } catch (error) {
      showMessage(error.message || 'Signup failed', 'error');
    }
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    showMessage('Logged out successfully', 'success');
  });
  
  // Add current problem
  document.getElementById('addCurrentBtn').addEventListener('click', async () => {
    const titleSlug = document.getElementById('addCurrentBtn').dataset.titleSlug;
    
    if (!titleSlug) {
      showMessage('No problem detected', 'error');
      return;
    }
    
    try {
      await addQuestion(titleSlug);
      showMessage('Problem added successfully!', 'success');
      await loadDashboard();
      
      // Hide the add button
      document.getElementById('addCurrentBtn').classList.add('hidden');
    } catch (error) {
      showMessage(error.message || 'Failed to add problem', 'error');
    }
  });
  
  // Open full dashboard
  document.getElementById('openDashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${FRONTEND_URL}/dashboard` });
  });
  
  // Enter key support
  document.getElementById('loginPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('loginBtn').click();
    }
  });
  
  document.getElementById('signupPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('signupBtn').click();
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Popup received message:', request.action);
  
  if (request.action === 'addQuestionViaPopup') {
    // Handle adding question through popup's authenticated context
    (async () => {
      try {
        const result = await addQuestion(request.data.url);
        console.log('✅ Question added via popup:', result);
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('❌ Failed to add question via popup:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep message channel open for async response
  }

  if (request.action === 'authUpdated') {
    // Auth was updated from website, refresh the popup UI
    console.log('🔄 Auth updated from website, refreshing UI...');
    checkAuth();
    return false;
  }
  
  return false;
});
