/**
 * Minimal Essential Utilities
 * Only what's needed for your current HTML
 */

// Simple navigation function
function goHome() {
  window.location.href = 'index.html';
}

// Simple time update function
function updateLastUpdated() {
  const element = document.getElementById('lastUpdated');
  if (element) {
    element.textContent = new Date().toLocaleTimeString();
  }
}

// Simple toast notification
function showToast(message, type = 'info') {
  // Use browser alert for now - simple and works everywhere
  const emoji = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  alert(`${emoji[type]} ${message}`);
}

// Export for global use
window.goHome = goHome;
window.updateLastUpdated = updateLastUpdated;
window.showToast = showToast;