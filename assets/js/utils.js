/**
 * Universal Utilities for All AI Agent Pages
 * Compatible with: Task Agent, Email Agent, Calendar Agent, Trade Intelligence
 * Enhanced with offline handling, performance optimizations, and better error handling
 */

// Create Utils object if it doesn't exist
window.Utils = window.Utils || {};

// Time utilities
Utils.time = {
  updateLastUpdated: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = new Date().toLocaleTimeString();
    }
  },
  
  formatTimestamp: function(date) {
    if (!date) return 'Unknown';
    try {
      return new Date(date).toLocaleString();
    } catch (e) {
      return date;
    }
  }
};

// Form utilities
Utils.form = {
  setInputValue: function(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = value;
    }
  },
  
  getInputValue: function(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value : '';
  },
  
  clearInput: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = '';
    }
  }
};

// Button utilities
Utils.button = {
  setLoading: function(elementId, text, iconClass) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<i class="${iconClass}"></i> ${text}`;
      element.disabled = true;
    }
  },
  
  restore: function(elementId, text, iconClass) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<i class="${iconClass}"></i> <span>${text}</span>`;
      element.disabled = false;
    }
  }
};

// Event utilities
Utils.events = {
  onEnterKey: function(elementId, callback) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          callback();
        }
      });
    }
  }
};

// Stats utilities
Utils.stats = {
  increment: function(statName) {
    console.log('Incrementing stat:', statName);
    const element = document.getElementById(statName);
    if (element) {
      const currentValue = parseInt(element.textContent) || 0;
      element.textContent = currentValue + 1;
    }
  },
  
  update: function(statName, value) {
    const element = document.getElementById(statName);
    if (element) {
      element.textContent = value;
    }
  }
};

// Enhanced API utilities with offline handling
Utils.api = {
  // Enhanced request with better offline detection
  async request(url, options = {}) {
    try {
      console.log('🔄 Making API request to:', url);
      
      // Check if browser is online
      if (!navigator.onLine) {
        throw new Error('OFFLINE');
      }
      
      const defaultOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Add timeout to detect slow/failed connections
        signal: AbortSignal.timeout(30000) // 30 second timeout
      };
      
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API request successful');
      return data;
      
    } catch (error) {
      console.error('❌ API Request failed:', error);
      
      // Handle different types of errors with user-friendly messages
      let userMessage = '';
      let errorType = 'error';
      
      if (error.message === 'OFFLINE' || !navigator.onLine) {
        userMessage = '📱 You appear to be offline. Please check your internet connection and try again.';
        errorType = 'warning';
      } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        userMessage = '⏱️ Request timed out. The server may be busy. Please try again.';
        errorType = 'warning';
      } else if (error.message.includes('Failed to fetch')) {
        userMessage = '🌐 Unable to connect to server. Please check your connection and try again.';
        errorType = 'warning';
      } else if (error.message.includes('HTTP_5')) {
        userMessage = '🔧 Server error (5xx). Please try again in a few moments.';
        errorType = 'error';
      } else if (error.message.includes('HTTP_4')) {
        userMessage = '⚠️ Request error (4xx). Please check your input and try again.';
        errorType = 'warning';
      } else {
        userMessage = '❌ Something went wrong. Please try again.';
        errorType = 'error';
      }
      
      // Show user-friendly toast
      Utils.toast.show(userMessage, errorType);
      
      // Re-throw for handling by calling function
      throw error;
    }
  },

  // Quick method for GET requests with parameters
  async get(url, params = {}) {
    const urlWithParams = new URL(url);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        urlWithParams.searchParams.append(key, params[key]);
      }
    });
    
    return this.request(urlWithParams.toString());
  },

  // Test connection method
  async testConnection() {
    try {
      await fetch('https://httpbin.org/status/200', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Network status detection
Utils.network = {
  isOnline: navigator.onLine,
  
  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      Utils.toast.success('🌐 Connection restored!');
      console.log('✅ Back online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      Utils.toast.warning('📱 You are now offline. Some features may not work.');
      console.log('⚠️ Gone offline');
    });
  },
  
  // Check if we should even attempt API calls
  canMakeRequests() {
    if (!this.isOnline) {
      Utils.toast.warning('📱 No internet connection. Please check your network.');
      return false;
    }
    return true;
  }
};

// Performance utilities
Utils.performance = {
  // Debounce function for search inputs (prevents too many API calls)
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Optimize search inputs automatically
  optimizeSearchInputs() {
    const searchInputs = document.querySelectorAll('#query, #searchQuery, #taskSearchInput, #taskCommand, #calendarCommand');
    
    searchInputs.forEach(input => {
      if (input) {
        // Remove any existing event listeners to avoid duplicates
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Add optimized event listener
        newInput.addEventListener('input', this.debounce((e) => {
          // Only trigger if user has typed something meaningful
          if (e.target.value.length >= 2) {
            console.log('Optimized search triggered for:', e.target.value);
          }
        }, 300));
      }
    });
  }
};

// Modal utilities
Utils.modal = {
  showAI: function(content) {
    const modal = document.getElementById('aiModal');
    const responseDiv = document.getElementById('aiResponse');
    if (modal && responseDiv) {
      responseDiv.innerHTML = content;
      modal.classList.remove('hidden');
    }
  },
  
  hideAI: function() {
    const modal = document.getElementById('aiModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },
  
  show: function(modalId, content) {
    const modal = document.getElementById(modalId);
    if (modal) {
      if (content) {
        const contentDiv = modal.querySelector('.modal-content') || 
                          modal.querySelector('#aiResponse') ||
                          modal.querySelector('.p-6:last-child');
        if (contentDiv) {
          contentDiv.innerHTML = content;
        }
      }
      modal.classList.remove('hidden');
    }
  },
  
  hide: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }
};

// Enhanced toast notifications
Utils.toast = {
  show: function(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.utils-toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'utils-toast fixed top-4 right-4 z-50 max-w-sm transform transition-all duration-300 translate-x-full';
    
    const styles = {
      success: { bg: 'bg-green-500', icon: 'fas fa-check-circle' },
      error: { bg: 'bg-red-500', icon: 'fas fa-exclamation-circle' },
      warning: { bg: 'bg-yellow-500', icon: 'fas fa-exclamation-triangle' },
      info: { bg: 'bg-blue-500', icon: 'fas fa-info-circle' }
    };
    
    const style = styles[type] || styles.info;
    
    toast.innerHTML = `
      <div class="${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <i class="${style.icon}"></i>
        <span class="text-sm font-medium flex-1">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  },

  success: function(message) { this.show(message, 'success'); },
  error: function(message) { this.show(message, 'error'); },
  warning: function(message) { this.show(message, 'warning'); },
  info: function(message) { this.show(message, 'info'); }
};

// Navigation utilities
Utils.navigation = {
  goHome: function() {
    window.location.href = 'index.html';
  },
  
  goToPage: function(page) {
    window.location.href = page;
  }
};

// Validation utilities
Utils.validation = {
  isEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isEmpty: function(value) {
    return !value || value.toString().trim().length === 0;
  },
  
  isValidDate: function(date) {
    return date instanceof Date && !isNaN(date);
  }
};

// Loading utilities
Utils.loading = {
  show: function(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('hidden');
      const messageEl = element.querySelector('.loading-message');
      if (messageEl) {
        messageEl.textContent = message;
      }
    }
  },
  
  hide: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('hidden');
    }
  },
  
  toggle: function(elementId, show, message) {
    if (show) {
      this.show(elementId, message);
    } else {
      this.hide(elementId);
    }
  }
};

// Storage utilities (for local data)
Utils.storage = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage not available, using memory storage');
      this._memoryStorage = this._memoryStorage || {};
      this._memoryStorage[key] = value;
    }
  },
  
  get: function(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      this._memoryStorage = this._memoryStorage || {};
      return this._memoryStorage[key] || defaultValue;
    }
  },
  
  remove: function(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      if (this._memoryStorage) {
        delete this._memoryStorage[key];
      }
    }
  }
};

// Formatting utilities
Utils.format = {
  currency: function(amount, currency = 'USD') {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (e) {
      return `$${amount}`;
    }
  },
  
  number: function(num, decimals = 0) {
    return Number(num).toFixed(decimals);
  },
  
  date: function(date, format = 'short') {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        dateStyle: format
      });
    } catch (e) {
      return date;
    }
  },
  
  time: function(date) {
    try {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return date;
    }
  }
};

// Searchable dropdown utility for countries
Utils.dropdown = {
  createSearchableCountryDropdown: function(selectElement, countries) {
    if (!selectElement) return;
    
    const container = selectElement.parentNode;
    const wrapper = document.createElement('div');
    wrapper.className = 'relative';
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type to search countries...';
    input.className = selectElement.className;
    input.id = selectElement.id + '_input';
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto hidden';
    dropdown.style.top = '100%';
    
    // Create options
    const createOptions = (filteredCountries) => {
      dropdown.innerHTML = '';
      
      if (filteredCountries.length === 0) {
        dropdown.innerHTML = '<div class="p-3 text-gray-500 text-sm">No countries found</div>';
        return;
      }
      
      filteredCountries.forEach(country => {
        const option = document.createElement('div');
        option.className = 'p-3 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0';
        option.textContent = country;
        option.addEventListener('click', () => {
          input.value = country;
          selectElement.value = country;
          dropdown.classList.add('hidden');
          
          // Trigger change event
          const event = new Event('change', { bubbles: true });
          selectElement.dispatchEvent(event);
        });
        dropdown.appendChild(option);
      });
    };
    
    // Initialize with all countries
    createOptions(countries);
    
    // Handle input changes
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = countries.filter(country => 
        country.toLowerCase().includes(query)
      );
      createOptions(filtered);
      dropdown.classList.remove('hidden');
    });
    
    // Show dropdown on focus
    input.addEventListener('focus', () => {
      dropdown.classList.remove('hidden');
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
    
    // Build wrapper
    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    
    // Replace original select
    container.replaceChild(wrapper, selectElement);
    
    // Keep original select hidden for form submission
    selectElement.style.display = 'none';
    wrapper.appendChild(selectElement);
    
    return wrapper;
  }
};

// Global convenience functions for backward compatibility
function goHome() {
  Utils.navigation.goHome();
}

function updateLastUpdated(elementId) {
  Utils.time.updateLastUpdated(elementId);
}

function showToast(message, type = 'info') {
  Utils.toast.show(message, type);
}

// Global error handler
window.addEventListener('error', function(event) {
  console.error('Global error caught:', event.error);
  Utils.toast.error('An unexpected error occurred. Please refresh the page.');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  Utils.toast.error('A network or processing error occurred.');
});

// Export for global use
window.goHome = goHome;
window.updateLastUpdated = updateLastUpdated;
window.showToast = showToast;

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize network detection
  Utils.network.init();
  
  // Apply performance optimizations
  setTimeout(() => {
    Utils.performance.optimizeSearchInputs();
    console.log('✅ Performance optimizations applied');
  }, 1000);
  
  // Update any "Last updated" timestamps on the page
  const timestampElements = document.querySelectorAll('[id*="last"], [id*="Last"], [id*="update"], [id*="Update"], [id*="sync"], [id*="Sync"]');
  timestampElements.forEach(element => {
    if (element.id) {
      Utils.time.updateLastUpdated(element.id);
    }
  });
  
  console.log('✅ Universal Utils.js loaded and initialized');
});

console.log('✅ Universal Utils.js loaded successfully');