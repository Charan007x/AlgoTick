// Background service worker for the extension
// Handles extension lifecycle events and manages communication

// Import shared utilities
importScripts('utils.js');

// Keep service worker alive
let keepAliveInterval;

function startKeepAlive() {
  // Create an alarm to keep service worker alive
  chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // Just a ping to keep the service worker alive
    console.log('🔄 Keepalive ping');
  }
});

// Start keepalive when service worker loads
startKeepAlive();

// Installation handler
chrome.runtime.onInstalled.addListener((details) => {
  // Set default storage values (on both install and update)
  chrome.storage.local.get(['apiUrl'], (result) => {
    if (!result.apiUrl) {
      chrome.storage.local.set({
        apiUrl: 'https://algotick.onrender.com/api',
        notifications: true
      });
      console.log('✅ Default settings configured');
    }
  });
  
  if (details.reason === 'install') {
    console.log('LeetCode Tracker Extension installed!');
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://algotick.vercel.app'
    });
  } else if (details.reason === 'update') {
    console.log('LeetCode Tracker Extension updated!');
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Received message:', request.action);
  
  if (request.action === 'addQuestion') {
    // Handle async and send response
    handleAddQuestion(request.data)
      .then(response => {
        console.log('✅ Sending success response');
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error('❌ Sending error response:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'checkAuth') {
    checkAuthentication()
      .then(isAuth => {
        console.log('✅ Auth check:', isAuth);
        sendResponse({ isAuthenticated: isAuth });
      })
      .catch(error => {
        console.error('❌ Auth check failed:', error.message);
        sendResponse({ isAuthenticated: false, error: error.message });
      });
    return true;
  }
  
  // Unknown action
  console.log('⚠️ Unknown action:', request.action);
  sendResponse({ success: false, error: 'Unknown action' });
  return false;
});

// Function to handle adding a question
async function handleAddQuestion(data) {
  try {
    console.log('🎯 Using shared utility to add question');
    
    // Use the shared utility function for consistency
    const result = await addQuestionToTracker(data.url || data.questionNumber);
    
    // Show notification if enabled
    const notificationsEnabled = await storage.get('notifications');
    if (notificationsEnabled) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Question Added!',
        message: `${result.question.title} has been added to your tracker.`
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error in handleAddQuestion:', error);
    throw error;
  }
}

// Function to check authentication
async function checkAuthentication() {
  try {
    // Use shared utility for consistency
    return await checkAuth();
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}

// Helper function to get storage value (kept for backwards compatibility)
function getStorageValue(key) {
  return storage.get(key);
}

// Helper function to set storage value (kept for backwards compatibility)
function setStorageValue(key, value) {
  return storage.set(key, value);
}

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addToTracker',
    title: 'Add to LeetCode Tracker',
    contexts: ['page'],
    documentUrlPatterns: ['*://leetcode.com/problems/*']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToTracker') {
    // Send message to content script to add current problem
    chrome.tabs.sendMessage(tab.id, { action: 'addCurrentProblem' });
  }
});

// Handle browser action clicks (when extension icon is clicked)
chrome.action.onClicked.addListener((tab) => {
  // Open popup (this is already handled by default_popup in manifest)
  // This listener is here for future custom actions if needed
});

// Alarm for daily reminders
chrome.alarms.create('dailyReminder', {
  periodInMinutes: 1440 // 24 hours
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReminder') {
    // Check for due problems
    try {
      const token = await getStorageValue('token');
      if (!token) return;
      
      const apiUrl = await getStorageValue('apiUrl');
      const response = await fetch(`${apiUrl}/questions/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        const dueToday = stats.dueToday || 0;
        
        if (dueToday > 0) {
          const notificationsEnabled = await getStorageValue('notifications');
          if (notificationsEnabled) {
            chrome.notifications.create({
              type: 'basic',
              title: 'LeetCode Reminder',
              message: `You have ${dueToday} problem${dueToday > 1 ? 's' : ''} due for revision today!`,
              priority: 2
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }
});

console.log('LeetCode Tracker background service worker loaded!');
