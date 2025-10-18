// Content script for LeetCode problem pages
// This script runs on all LeetCode problem pages and extracts problem information

// Function to extract problem information from URL
function extractProblemInfo() {
  try {
    // Get slug directly from URL - most reliable method
    const urlMatch = window.location.pathname.match(/\/problems\/([^\/\?]+)/);
    
    if (!urlMatch || !urlMatch[1]) {
      console.error('Not a valid LeetCode problem page');
      return null;
    }
    
    const titleSlug = urlMatch[1];
    
    // Create a nice title from slug
    const title = titleSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Try to get difficulty from page (optional, won't fail if not found)
    let difficulty = 'Unknown';
    try {
      const difficultyElement = document.querySelector('div[diff]');
      if (difficultyElement) {
        difficulty = difficultyElement.getAttribute('diff') || 'Unknown';
      }
    } catch (e) {
      // Difficulty is optional, continue without it
    }
    
    return {
      title,
      titleSlug,
      difficulty,
      url: window.location.href
    };
  } catch (error) {
    console.error('Error extracting problem info:', error);
    return null;
  }
}

// Function to create and inject "Add to Tracker" button
function injectAddButton() {
  // Check if button already exists
  if (document.getElementById('leetcode-tracker-btn')) {
    return;
  }
  
  // Create button
  const button = document.createElement('button');
  button.id = 'leetcode-tracker-btn';
  button.textContent = '+ Add to Tracker';
  button.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 9999;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: all 0.3s;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Hover effect
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
  });
  
  // Click handler with retry mechanism
  button.addEventListener('click', async () => {
    // Extract slug from URL - simple and reliable
    const urlMatch = window.location.pathname.match(/\/problems\/([^\/\?]+)/);
    
    if (!urlMatch || !urlMatch[1]) {
      showNotification('Not a valid problem page', 'error');
      return;
    }
    
    const titleSlug = urlMatch[1];
    
    // Disable button during request
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'wait';
    button.textContent = 'Adding...';
    
    // Helper function to send message with retry
    const sendMessageWithRetry = (message, retries = 3) => {
      return new Promise((resolve, reject) => {
        const attemptSend = (attemptsLeft) => {
          try {
            // Check if extension context is valid
            if (!chrome.runtime?.id) {
              reject(new Error('Extension reloaded. Please refresh the page.'));
              return;
            }

            chrome.runtime.sendMessage(message, (response) => {
              if (chrome.runtime.lastError) {
                const error = chrome.runtime.lastError.message;
                console.log(`Message failed: ${error}, retries left: ${attemptsLeft - 1}`);
                
                // Check if it's a context invalidation error
                if (error.includes('Extension context invalidated') || 
                    error.includes('message port closed') ||
                    error.includes('Receiving end does not exist')) {
                  reject(new Error('Extension reloaded. Please refresh this page.'));
                  return;
                }
                
                if (attemptsLeft > 1) {
                  // Wait a bit and retry
                  setTimeout(() => attemptSend(attemptsLeft - 1), 200);
                } else {
                  reject(new Error('Could not connect to extension. Try reloading the page.'));
                }
              } else {
                resolve(response);
              }
            });
          } catch (error) {
            console.error('Send message error:', error);
            if (attemptsLeft > 1) {
              setTimeout(() => attemptSend(attemptsLeft - 1), 200);
            } else {
              reject(new Error('Extension error. Please reload the page.'));
            }
          }
        };
        
        attemptSend(retries);
      });
    };
    
    try {
      const response = await sendMessageWithRetry({ 
        action: 'addQuestion', 
        data: { url: titleSlug } 
      });
      
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
      
      if (response && response.success) {
        showNotification('Problem added successfully! 🎉', 'success');
        button.textContent = '✓ Added to Tracker';
        button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        button.disabled = true;
        
        setTimeout(() => {
          button.textContent = '+ Add to Tracker';
          button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          button.disabled = false;
        }, 3000);
      } else {
        const errorMsg = response?.error || 'Failed to add problem';
        showNotification(errorMsg, 'error');
        button.textContent = '+ Add to Tracker';
        
        // If not authenticated, suggest login
        if (errorMsg.includes('authenticated') || errorMsg.includes('login') || errorMsg.includes('Please login')) {
          setTimeout(() => {
            showNotification('👆 Click extension icon to login', 'error');
          }, 2000);
        }
      }
      
    } catch (error) {
      console.error('Error adding problem:', error);
      
      // Reset button state
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
      button.textContent = '+ Add to Tracker';
      
      // Show appropriate error message
      const errorMessage = error.message || 'Failed to add problem';
      
      if (errorMessage.includes('Extension reloaded') || 
          errorMessage.includes('context invalidated') ||
          errorMessage.includes('Receiving end does not exist')) {
        showNotification('⚠️ Extension was reloaded', 'error');
        button.textContent = '🔄 Refresh Page';
        button.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        
        // Make button trigger page reload
        button.onclick = () => {
          window.location.reload();
        };
        
        setTimeout(() => {
          showNotification('🔄 Click button or refresh page', 'error');
        }, 2000);
      } else {
        showNotification(errorMessage, 'error');
      }
    }
  });
  
  // Append button to body
  document.body.appendChild(button);
}

// Function to show notification
function showNotification(message, type = 'success') {
  // Remove existing notification if any
  const existing = document.getElementById('leetcode-tracker-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.id = 'leetcode-tracker-notification';
  notification.textContent = message;
  
  const bgColor = type === 'success' 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 16px 24px;
    background: ${bgColor};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Append notification
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProblemInfo') {
    const problemInfo = extractProblemInfo();
    sendResponse({ problem: problemInfo });
  }
  return true;
});

// Handle extension context invalidation
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener(() => {
    // Keep connection alive
    return true;
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for page to fully load
    setTimeout(injectAddButton, 1000);
  });
} else {
  setTimeout(injectAddButton, 1000);
}

// Also try to inject when URL changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes('/problems/')) {
      setTimeout(injectAddButton, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });

// Check if extension context is valid
function isExtensionContextValid() {
  try {
    return chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

// Periodic check for context validity
setInterval(() => {
  if (!isExtensionContextValid()) {
    console.log('Extension context invalidated. Page refresh may be needed.');
  }
}, 5000);

console.log('LeetCode Tracker extension loaded!');
