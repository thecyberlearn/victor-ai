/**
 * Email Agent - Webhook Integration
 * Connects to your n8n email analysis workflow
 */

class EmailAgent {
  constructor() {
    this.apiEndpoint = 'https://thecyberlearn.app.n8n.cloud/webhook/email-agent';
    this.currentEmails = [];
    this.currentFilter = 'all';
    this.totalActions = 0;
    this.init();
  }

  init() {
    this.updateLastSync();
    this.initializeEventListeners();
    this.loadEmails(); // Auto-load emails on page load
  }

  initializeEventListeners() {
    // Search on Enter key
    const searchInput = document.getElementById('searchQuery');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchEmails();
        }
      });
    }
  }

  updateLastSync() {
    const element = document.getElementById('lastSync');
    if (element) {
      element.textContent = new Date().toLocaleTimeString();
    }
  }

  // Main function to load emails from webhook
  async loadEmails(action = 'get_inbox', params = {}) {
    const loadingState = document.getElementById('loadingState');
    const emailList = document.getElementById('emailList');
    const emptyState = document.getElementById('emptyState');
    
    try {
      // Show loading state
      this.showLoading(true);
      
      // Build API URL
      const url = new URL(this.apiEndpoint);
      url.searchParams.append('action', action);
      
      // Add additional parameters
      Object.keys(params).forEach(key => {
        if (params[key]) {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log('Loading emails from:', url.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Email data received:', data);

      if (data.success && data.emails) {
        this.currentEmails = data.emails;
        this.displayEmails(data.emails);
        this.updateStats(data);
        this.addToRecentActivity(`Loaded ${data.emails.length} emails`, 'load');
        
        // Hide empty state, show email list
        if (emptyState) emptyState.classList.add('hidden');
        if (emailList) emailList.classList.remove('hidden');
        
      } else {
        this.showEmptyState();
        console.log('No emails found or API error');
      }

    } catch (error) {
      console.error('Error loading emails:', error);
      this.showError('Failed to load emails: ' + error.message);
    } finally {
      this.showLoading(false);
      this.updateLastSync();
    }
  }

  // Display emails in the UI
  displayEmails(emails) {
    const emailList = document.getElementById('emailList');
    if (!emailList) return;

    if (emails.length === 0) {
      this.showEmptyState();
      return;
    }

    const emailHTML = emails.map((email, index) => {
      return this.generateEmailCard(email, index);
    }).join('');

    emailList.innerHTML = emailHTML;
    emailList.classList.remove('hidden');

    // Add click handlers
    this.attachEmailClickHandlers();
  }

  // Generate individual email card HTML
  generateEmailCard(email, index) {
    const priorityClass = `priority-${email.priority.toLowerCase()}`;
    const unreadClass = email.unread ? 'email-unread' : 'email-read';
    const typeIcon = this.getTypeIcon(email.type);
    const typeColor = this.getTypeColor(email.type);

    return `
      <div class="email-card ${unreadClass} ${priorityClass} p-4 rounded-lg border border-gray-200 cursor-pointer fade-in" 
           onclick="emailAgent.viewEmailDetails('${email.id}')" 
           data-email-id="${email.id}">
        
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- Type Icon -->
            <div class="w-8 h-8 bg-${typeColor}-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <i class="${typeIcon} text-${typeColor}-600"></i>
            </div>
            
            <!-- Sender & Subject -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-800 truncate">${email.sender}</span>
                ${email.priority === 'High' ? '<span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">High Priority</span>' : ''}
                ${email.priority === 'Medium' ? '<span class="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Medium</span>' : ''}
                ${email.unread ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
              </div>
              <h4 class="font-medium text-gray-800 mb-1 line-clamp-1">${email.subject}</h4>
              <p class="text-sm text-gray-600 line-clamp-2">${email.summary}</p>
            </div>
          </div>
          
          <!-- Time & Actions -->
          <div class="text-right ml-4 flex-shrink-0">
            <div class="text-sm text-gray-500 mb-1">${email.timestamp}</div>
            <div class="flex items-center gap-1 justify-end">
              ${email.attachments > 0 ? `<i class="fas fa-paperclip text-gray-400 text-xs"></i><span class="text-xs text-gray-500">${email.attachments}</span>` : ''}
              <span class="text-xs px-2 py-1 bg-${typeColor}-50 text-${typeColor}-700 rounded">${email.type.toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-2 pt-2 border-t border-gray-100">
          <button onclick="event.stopPropagation(); emailAgent.viewEmailDetails('${email.id}')" 
                  class="flex-1 text-xs bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors">
            View Details
          </button>
          <button onclick="event.stopPropagation(); emailAgent.markAsRead('${email.id}')" 
                  class="text-xs px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            ${email.unread ? 'Mark Read' : 'Mark Unread'}
          </button>
          <button onclick="event.stopPropagation(); emailAgent.shareEmail('${email.id}')" 
                  class="text-xs px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <i class="fas fa-share"></i>
          </button>
        </div>
      </div>
    `;
  }

  // Get type icon for email type
  getTypeIcon(type) {
    const icons = {
      'email': 'fas fa-envelope',
      'pdf': 'fas fa-file-pdf',
      'image': 'fas fa-image'
    };
    return icons[type] || 'fas fa-file';
  }

  // Get type color for email type
  getTypeColor(type) {
    const colors = {
      'email': 'blue',
      'pdf': 'red', 
      'image': 'green'
    };
    return colors[type] || 'gray';
  }

  // Search emails
  async searchEmails() {
    const searchQuery = document.getElementById('searchQuery');
    const query = searchQuery ? searchQuery.value.trim() : '';
    
    if (!query) {
      this.loadEmails(); // Load all if no search query
      return;
    }

    await this.loadEmails('search', { query: query });
    this.addToRecentActivity(`Searched for "${query}"`, 'search');
  }

  // Filter emails by type
  async filterEmails(type) {
    this.currentFilter = type;
    
    // Update filter button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-blue-100', 'text-blue-700');
      btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${type}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
      activeBtn.classList.add('active', 'bg-blue-100', 'text-blue-700');
    }

    if (type === 'all') {
      await this.loadEmails('get_inbox');
    } else {
      await this.loadEmails('filter', { type: type });
    }
    
    this.addToRecentActivity(`Filtered by ${type}`, 'filter');
  }

  // Refresh emails
  async refreshEmails() {
    await this.loadEmails(this.currentFilter === 'all' ? 'get_inbox' : 'filter', 
                         this.currentFilter === 'all' ? {} : { type: this.currentFilter });
    this.addToRecentActivity('Refreshed emails', 'refresh');
  }

  // View email details in modal
  viewEmailDetails(emailId) {
    const email = this.currentEmails.find(e => e.id === emailId);
    if (!email) return;

    const modal = document.getElementById('emailModal');
    const content = document.getElementById('emailContent');
    
    if (!modal || !content) return;

    const detailHTML = `
      <div class="space-y-6">
        <!-- Email Header -->
        <div class="border-b border-gray-200 pb-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-${this.getTypeColor(email.type)}-100 rounded-lg flex items-center justify-center">
              <i class="${this.getTypeIcon(email.type)} text-${this.getTypeColor(email.type)}-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold text-gray-800">${email.subject}</h2>
              <p class="text-gray-600">From: ${email.sender} (${email.senderEmail})</p>
            </div>
            <div class="text-right">
              <span class="px-3 py-1 bg-${email.priorityColor}-100 text-${email.priorityColor}-700 rounded-full text-sm">
                ${email.priority} Priority
              </span>
              <p class="text-sm text-gray-500 mt-1">${email.timestamp}</p>
            </div>
          </div>
        </div>

        <!-- Email Content -->
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">AI Summary</h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-blue-800">${email.summary}</p>
            </div>
          </div>

          ${email.fullSummary && email.fullSummary !== email.summary ? `
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Full Analysis</h3>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p class="text-gray-700 whitespace-pre-wrap">${email.fullSummary}</p>
              </div>
            </div>
          ` : ''}

          <!-- Email Meta Info -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">AI Analysis</h4>
              <p class="text-sm text-gray-600">Priority: ${email.priority}</p>
              <p class="text-sm text-gray-600">Attachments: ${email.attachments}</p>
              <p class="text-sm text-gray-600">Auto-processed: Yes</p>
            </div>
          </div>
        </div>
      </div>
    `;

    content.innerHTML = detailHTML;
    modal.classList.remove('hidden');
    
    this.addToRecentActivity(`Viewed "${email.subject}"`, 'view');
  }

  // Close email modal
  closeEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Mark email as read/unread (simulated)
  markAsRead(emailId) {
    const email = this.currentEmails.find(e => e.id === emailId);
    if (email) {
      email.unread = !email.unread;
      this.displayEmails(this.currentEmails); // Refresh display
      this.addToRecentActivity(`Marked "${email.subject}" as ${email.unread ? 'unread' : 'read'}`, 'mark');
    }
  }

  // Share email (copy to clipboard)
  shareEmail(emailId) {
    const email = this.currentEmails.find(e => e.id === emailId);
    if (email) {
      const shareText = `${email.subject}\nFrom: ${email.sender}\nSummary: ${email.summary}`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          this.showToast('Email details copied to clipboard!', 'success');
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast('Email details copied to clipboard!', 'success');
      }
      
      this.addToRecentActivity(`Shared "${email.subject}"`, 'share');
    }
  }

  // Export emails to CSV
  exportEmails() {
    if (this.currentEmails.length === 0) {
      this.showToast('No emails to export', 'warning');
      return;
    }

    const headers = ['Date', 'Sender', 'Subject', 'Type', 'Priority', 'Summary'];
    const csvContent = [
      headers.join(','),
      ...this.currentEmails.map(email => [
        `"${email.date}"`,
        `"${email.sender}"`,
        `"${email.subject}"`,
        `"${email.type}"`,
        `"${email.priority}"`,
        `"${email.summary.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_summaries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.showToast('Email data exported successfully!', 'success');
    this.addToRecentActivity(`Exported ${this.currentEmails.length} emails`, 'export');
  }

  // Update statistics
  updateStats(data) {
    const stats = data.stats || {};
    
    // Update stat counters
    this.updateElement('totalCount', stats.total || this.currentEmails.length);
    this.updateElement('priorityCount', stats.high_priority || 0);
    this.updateElement('processedCount', stats.total || this.currentEmails.length);
    this.updateElement('aiActionsCount', stats.total || this.currentEmails.length);
  }

  // Helper function to update element text
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  // Add activity to recent activity panel
  addToRecentActivity(message, type = 'info') {
    const recentActivity = document.getElementById('recentActivity');
    if (!recentActivity) return;

    const iconMap = {
      'load': 'fa-download',
      'search': 'fa-search',
      'filter': 'fa-filter',
      'refresh': 'fa-sync-alt',
      'view': 'fa-eye',
      'mark': 'fa-check',
      'share': 'fa-share',
      'export': 'fa-file-export'
    };

    const colorMap = {
      'load': 'blue',
      'search': 'green',
      'filter': 'purple',
      'refresh': 'orange',
      'view': 'indigo',
      'mark': 'green',
      'share': 'blue',
      'export': 'red'
    };

    const icon = iconMap[type] || 'fa-info-circle';
    const color = colorMap[type] || 'blue';
    const time = new Date().toLocaleTimeString();

    // Clear default message if exists
    if (recentActivity.children.length === 1 && recentActivity.textContent.includes('Load emails')) {
      recentActivity.innerHTML = '';
    }

    const activityItem = document.createElement('div');
    activityItem.className = 'flex items-start gap-3 p-2 bg-gray-50 rounded-lg fade-in';
    activityItem.innerHTML = `
      <div class="w-6 h-6 bg-${color}-100 rounded flex items-center justify-center flex-shrink-0 mt-1">
        <i class="fas ${icon} text-${color}-600 text-xs"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-800 truncate">${message}</p>
        <p class="text-xs text-gray-500">${time}</p>
      </div>
    `;

    recentActivity.insertBefore(activityItem, recentActivity.firstChild);

    // Keep only last 5 activities
    while (recentActivity.children.length > 5) {
      recentActivity.removeChild(recentActivity.lastChild);
    }

    this.totalActions++;
  }

  // Show/hide loading state
  showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const emailList = document.getElementById('emailList');
    
    if (loadingState) {
      if (show) {
        loadingState.classList.remove('hidden');
      } else {
        loadingState.classList.add('hidden');
      }
    }
    
    if (emailList && show) {
      emailList.classList.add('hidden');
    }
  }

  // Show empty state
  showEmptyState() {
    const emailList = document.getElementById('emailList');
    const emptyState = document.getElementById('emptyState');
    
    if (emailList) emailList.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
  }

  // Show error message
  showError(message) {
    this.showToast(message, 'error');
    this.showEmptyState();
  }

  // Toast notification system
  showToast(message, type = 'info') {
    const colors = {
      success: 'bg-green-100 border-green-300 text-green-800',
      error: 'bg-red-100 border-red-300 text-red-800',
      warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      info: 'bg-blue-100 border-blue-300 text-blue-800'
    };

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 ${colors[type]} border rounded-lg shadow-lg p-4 max-w-sm`;
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas ${icons[type]} text-lg"></i>
        <span class="font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-lg hover:opacity-70">×</button>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  // Attach click handlers to email cards
  attachEmailClickHandlers() {
    // Click handlers are already in the HTML via onclick attributes
    // This method can be used for additional event handling if needed
  }
}

// Initialize Email Agent when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.emailAgent = new EmailAgent();
  
  // Make functions globally available for onclick handlers
  window.loadEmails = () => emailAgent.loadEmails();
  window.searchEmails = () => emailAgent.searchEmails();
  window.filterEmails = (type) => emailAgent.filterEmails(type);
  window.refreshEmails = () => emailAgent.refreshEmails();
  window.exportEmails = () => emailAgent.exportEmails();
  window.closeEmailModal = () => emailAgent.closeEmailModal();
  
});