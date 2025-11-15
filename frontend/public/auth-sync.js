// Auth sync script - syncs login between website and extension
// This script runs on the web app and syncs auth to extension

(function() {
  // Check if extension is installed
  function isExtensionInstalled() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage;
  }

  // Sync auth state to extension
  function syncAuthToExtension() {
    if (!isExtensionInstalled()) {
      console.log('Extension not installed, skipping sync');
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Send to extension
        chrome.runtime.sendMessage(
          'YOUR_EXTENSION_ID', // We'll set this dynamically
          {
            action: 'syncAuth',
            token: token,
            user: user
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log('Extension not responding:', chrome.runtime.lastError.message);
            } else {
              console.log('Auth synced to extension successfully');
            }
          }
        );
      } catch (e) {
        console.error('Error syncing auth to extension:', e);
      }
    }
  }

  // Listen for storage changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' || e.key === 'user') {
      console.log('Auth changed, syncing to extension...');
      setTimeout(syncAuthToExtension, 100);
    }
  });

  // Sync on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAuthToExtension);
  } else {
    syncAuthToExtension();
  }

  // Also sync when user object is saved
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'token' || key === 'user') {
      setTimeout(syncAuthToExtension, 100);
    }
  };
})();
