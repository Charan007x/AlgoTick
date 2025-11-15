// Options page script for managing settings

// Load saved settings on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  
  // Save settings button
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  
  // Clear data button
  document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
});

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['apiUrl', 'notifications', 'autoDetect'], (result) => {
    // API URL
    if (result.apiUrl) {
      document.getElementById('apiUrl').value = result.apiUrl;
    } else {
      document.getElementById('apiUrl').value = 'https://algotick.onrender.com/api';
    }
    
    // Notifications
    if (result.notifications !== undefined) {
      document.getElementById('notifications').checked = result.notifications;
    } else {
      document.getElementById('notifications').checked = true;
    }
    
    // Auto-detect
    if (result.autoDetect !== undefined) {
      document.getElementById('autoDetect').checked = result.autoDetect;
    } else {
      document.getElementById('autoDetect').checked = true;
    }
  });
}

// Save settings to storage
function saveSettings() {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  const notifications = document.getElementById('notifications').checked;
  const autoDetect = document.getElementById('autoDetect').checked;
  
  // Validate API URL
  if (!apiUrl) {
    showMessage('Please enter a valid API URL', 'error');
    return;
  }
  
  // Remove trailing slash from API URL
  const cleanApiUrl = apiUrl.replace(/\/$/, '');
  
  // Save to storage
  chrome.storage.local.set({
    apiUrl: cleanApiUrl,
    notifications: notifications,
    autoDetect: autoDetect
  }, () => {
    showMessage('Settings saved successfully!', 'success');
    
    // If auto-detect is disabled, we might want to notify content scripts
    if (!autoDetect) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && tab.url.includes('leetcode.com')) {
            chrome.tabs.sendMessage(tab.id, { action: 'toggleAutoDetect', enabled: autoDetect });
          }
        });
      });
    }
  });
}

// Clear all data
function clearAllData() {
  const confirmed = confirm(
    'Are you sure you want to clear all data? This will log you out and remove all local settings. Your data on the server will not be affected.'
  );
  
  if (confirmed) {
    chrome.storage.local.clear(() => {
      showMessage('All data cleared. Please close and reopen the extension.', 'success');
      
      // Reset form to defaults
      document.getElementById('apiUrl').value = 'https://algotick.onrender.com/api';
      document.getElementById('notifications').checked = true;
      document.getElementById('autoDetect').checked = true;
      
      // Reload extension icon (logout state)
      chrome.runtime.sendMessage({ action: 'logout' });
    });
  }
}

// Show message
function showMessage(text, type = 'success') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
  
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

// Listen for Enter key on API URL input
document.getElementById('apiUrl').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});
