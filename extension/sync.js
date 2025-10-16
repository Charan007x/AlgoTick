// Sync script for localhost:3000 - syncs auth between website and extension
console.log('🔄 Auth sync script loaded on localhost:3000');

// Function to get user info from backend using token
async function getUserFromToken(token) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
  } catch (e) {
    console.error('Error fetching user:', e);
  }
  return null;
}

// Function to sync from website localStorage to extension storage
async function syncWebsiteToExtension() {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Get user info from backend
      const user = await getUserFromToken(token);
      
      if (user) {
        // Check if extension already has this token
        chrome.storage.local.get(['token'], async (result) => {
          if (result.token !== token) {
            // Save to extension storage
            chrome.storage.local.set({ token, user }, () => {
              console.log('✅ Auth synced from website to extension');
              console.log('   User:', user.email);
            });
          }
        });
      }
    } catch (e) {
      console.error('Error syncing auth:', e);
    }
  } else {
    // If website has no auth, clear extension auth
    chrome.storage.local.get(['token'], (result) => {
      if (result.token) {
        chrome.storage.local.remove(['token', 'user'], () => {
          console.log('🔓 Cleared extension auth (website logged out)');
        });
      }
    });
  }
}

// Function to sync from extension to website
function syncExtensionToWebsite() {
  chrome.storage.local.get(['token', 'user'], (result) => {
    if (result.token && result.user) {
      const currentToken = localStorage.getItem('token');
      
      // Only sync if website doesn't have auth
      if (!currentToken) {
        localStorage.setItem('token', result.token);
        console.log('✅ Auth synced from extension to website');
        console.log('   Reloading page...');
        
        // Reload page to trigger React auth check
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }
  });
}

// Sync on page load
console.log('📍 Page loaded, starting sync...');
syncWebsiteToExtension();
syncExtensionToWebsite();

// Watch for localStorage changes (when user logs in via website)
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  const result = originalSetItem.apply(this, arguments);
  
  if (key === 'token') {
    console.log('📝 Website token changed, syncing to extension in 500ms...');
    setTimeout(syncWebsiteToExtension, 500);
  }
  
  return result;
};

// Watch for logout
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  const result = originalRemoveItem.apply(this, arguments);
  
  if (key === 'token') {
    console.log('🔓 Website token removed, clearing extension auth...');
    chrome.storage.local.remove(['token', 'user'], () => {
      console.log('   Extension auth cleared');
    });
  }
  
  return result;
};

// Listen for messages from extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncAuthFromExtension') {
    console.log('📨 Received sync request from extension');
    localStorage.setItem('token', request.token);
    console.log('   Token saved to localStorage');
    console.log('   Reloading page...');
    setTimeout(() => window.location.reload(), 200);
  }
  
  if (request.action === 'clearAuth') {
    console.log('📨 Received logout request from extension');
    localStorage.removeItem('token');
    console.log('   Token removed from localStorage');
    console.log('   Reloading page...');
    setTimeout(() => window.location.reload(), 200);
  }
  
  return true;
});

// Periodic sync every 3 seconds
setInterval(() => {
  const token = localStorage.getItem('token');
  if (token) {
    syncWebsiteToExtension();
  }
}, 3000);

console.log('✨ Auth sync initialized - Website and extension will sync automatically!');
console.log('💡 Check console for sync messages');
console.log('   - Login on website → Extension will sync');
console.log('   - Login on extension → Website will sync');
