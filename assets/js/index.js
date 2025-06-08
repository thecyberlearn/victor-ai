/**
 * Main Index Page Functions
 */

class AIServicesHub {
  constructor() {
    this.init();
  }

  init() {
    this.addAnimations();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Service card click handlers are handled via onclick attributes
    // But we can add keyboard navigation here if needed
    this.addKeyboardNavigation();
  }

  addAnimations() {
    // Add staggered animation to service cards
    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('opacity-0');
      setTimeout(() => {
        card.style.animation = 'fadeInUp 0.6s ease-out forwards';
        card.classList.remove('opacity-0');
      }, index * 100);
    });
  }

  addKeyboardNavigation() {
    // Add keyboard navigation for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  navigateToService(service) {
    // Map service names to actual HTML files
    const serviceUrls = {
      'trade-intelligence': 'trade-intelligence.html',
      'email-agent': 'email-agent.html',
      'calendar-agent': 'calendar-agent.html',
      'task-agent': 'task-agent.html'
    };

    const url = serviceUrls[service];
    
    if (url) {
      // Check if file exists by trying to navigate
      try {
        window.location.href = url;
      } catch (error) {
        // Fallback to showing information if file doesn't exist
        this.showServiceInfo(service);
      }
    } else {
      this.showServiceInfo(service);
    }
  }

  showServiceInfo(service) {
    const services = {
      'trade-intelligence': {
        name: 'Trade Intelligence',
        description: 'Find exporters, importers, and trade data from around the world',
        features: ['50K+ Companies', '150+ Countries', 'Real-time Search', 'Export Data'],
        icon: 'fas fa-ship',
        color: 'blue'
      },
      'email-agent': {
        name: 'Email Agent',
        description: 'Smart email management and summarization with AI',
        features: ['Email Summarization', 'Priority Detection', 'Auto-categorization', 'Smart Replies'],
        icon: 'fas fa-envelope',
        color: 'purple'
      },
      'calendar-agent': {
        name: 'Calendar Agent',
        description: 'Intelligent scheduling and meeting management',
        features: ['Smart Scheduling', 'Conflict Detection', 'Meeting Optimization', 'Time Blocking'],
        icon: 'fas fa-calendar',
        color: 'green'
      },
      'task-agent': {
        name: 'Task Agent',
        description: 'Smart task management and prioritization',
        features: ['AI Prioritization', 'Progress Tracking', 'Deadline Management', 'Workload Balancing'],
        icon: 'fas fa-tasks',
        color: 'orange'
      }
    };

    const serviceData = services[service];
    if (serviceData) {
      Utils.modal.show('demoModal', `
        <div class="text-center">
          <div class="w-16 h-16 bg-${serviceData.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i class="${serviceData.icon} text-${serviceData.color}-600 text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">${serviceData.name}</h3>
          <p class="text-gray-600 mb-6">${serviceData.description}</p>
          
          <div class="grid grid-cols-2 gap-3 mb-6">
            ${serviceData.features.map(feature => `
              <div class="bg-${serviceData.color}-50 p-3 rounded-lg">
                <p class="text-sm text-${serviceData.color}-700 font-medium">${feature}</p>
              </div>
            `).join('')}
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">
              <strong>Coming Soon!</strong><br>
              This agent is currently in development. 
              <br>Check back soon for the full experience.
            </p>
          </div>
        </div>
      `);
    }
  }

  showDemo() {
    Utils.modal.show('demoModal');
  }

  showDocumentation() {
    Utils.modal.show('docModal');
  }

  closeDemoModal() {
    Utils.modal.hide('demoModal');
  }

  closeDocModal() {
    Utils.modal.hide('docModal');
  }
}

// Add CSS for fade in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.aiServicesHub = new AIServicesHub();
  
  // Make functions globally available for onclick handlers
  window.navigateToService = (service) => aiServicesHub.navigateToService(service);
  window.showDemo = () => aiServicesHub.showDemo();
  window.showDocumentation = () => aiServicesHub.showDocumentation();
  window.closeDemoModal = () => aiServicesHub.closeDemoModal();
  window.closeDocModal = () => aiServicesHub.closeDocModal();
});