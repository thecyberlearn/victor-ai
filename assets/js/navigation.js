/**
 * Minimal Navigation Component
 * Only creates breadcrumbs for your existing HTML
 */

document.addEventListener('DOMContentLoaded', function() {
  createBreadcrumbs();
});

function createBreadcrumbs() {
  const breadcrumbContainer = document.querySelector('.breadcrumbs');
  if (!breadcrumbContainer) return;

  // Detect current page
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  const currentPage = filename.replace('.html', '');

  const pages = {
    'index': { name: 'Home', icon: 'fas fa-home' },
    'trade-intelligence': { name: 'Trade Intelligence', icon: 'fas fa-ship' },
    'email-agent': { name: 'Email Agent', icon: 'fas fa-envelope' },
    'calendar-agent': { name: 'Calendar Agent', icon: 'fas fa-calendar' },
    'task-agent': { name: 'Task Agent', icon: 'fas fa-tasks' }
  };

  const currentPageInfo = pages[currentPage];
  if (!currentPageInfo) return;

  breadcrumbContainer.innerHTML = `
    <div class="flex items-center space-x-2 text-sm">
      <a href="index.html" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </a>
      ${currentPage !== 'index' ? `
        <i class="fas fa-chevron-right text-gray-400"></i>
        <span class="text-gray-600 flex items-center gap-1">
          <i class="${currentPageInfo.icon}"></i>
          <span>${currentPageInfo.name}</span>
        </span>
      ` : ''}
    </div>
  `;
}