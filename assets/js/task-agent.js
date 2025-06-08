/**
 * Task Agent Specific Functions - Fixed Version
 */

class TaskAgent {
  constructor() {
    this.totalActions = 0;
    this.tasks = [];
    this.stats = {
      total: 0,
      overdue: 0,
      dueToday: 0,
      completed: 0,
      inProgress: 0,
      toDo: 0
    };
    // Set default API URL - you can override this
    this.apiUrl = 'https://thecyberlearn.app.n8n.cloud/webhook/tasks';
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeAfterDOM());
    } else {
      this.initializeAfterDOM();
    }
  }

  initializeAfterDOM() {
    this.updateLastUpdated('lastUpdate');
    this.initializeEventListeners();
    
    // Load sample tasks if API URL is not configured
    if (this.apiUrl.includes('your-n8n-instance.com')) {
      console.log('Using sample data - configure apiUrl for real data');
      this.loadSampleTasks();
    } else {
      this.loadTasks(); // Load tasks from API
    }
  }

  updateLastUpdated(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = new Date().toLocaleTimeString();
    }
  }

  initializeEventListeners() {
    const taskCommandInput = document.getElementById('taskCommand');
    if (taskCommandInput) {
      taskCommandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.executeTaskCommand();
        }
      });
    }

    const searchInput = document.getElementById('taskSearchInput');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch();
        }
      });
    }
  }

  setTaskCommand(command) {
    const element = document.getElementById('taskCommand');
    if (element) {
      element.value = command;
      this.executeTaskCommand();
    }
  }

  async executeTaskCommand() {
    const element = document.getElementById('taskCommand');
    const command = element ? element.value : '';
    
    if (!command) {
      this.showToast('Please enter a command', 'warning');
      return;
    }

    this.setButtonLoading('taskAiBtn', 'Processing...', 'fa-spinner fa-spin');

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = this.generateTaskAIResponse(command);
      this.showAIModal(response);
      
      this.updateTaskStats();
      this.updateLastUpdated('lastUpdate');

    } catch (error) {
      this.showToast('Error processing command: ' + error.message, 'error');
    } finally {
      this.restoreButton('taskAiBtn', 'Execute', 'fa-robot');
      this.clearInput('taskCommand');
    }
  }

  generateTaskAIResponse(command) {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('overdue') || lowerCommand.includes('urgent')) {
      return `
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-gray-800">⚠️ Overdue Tasks Analysis</h4>
          <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h5 class="font-medium text-red-800 mb-2">🚨 Immediate Action Required</h5>
            <p class="text-sm text-red-700 mb-3">Found <strong>${this.stats.overdue}</strong> overdue tasks that need immediate attention</p>
            <div class="space-y-2 text-sm text-red-700">
              <div class="flex items-center gap-2">
                <i class="fas fa-exclamation-triangle text-red-600"></i>
                <span>Website Security Audit - 2 days overdue</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-clock text-red-600"></i>
                <span>Client Presentation - Due today</span>
              </div>
            </div>
          </div>
          <div class="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <h5 class="font-medium text-orange-800 mb-2">💡 AI Recommendations</h5>
            <div class="space-y-2 text-sm text-orange-700">
              <p>• Prioritize security audit first - highest business risk</p>
              <p>• Delegate or reschedule lower priority tasks</p>
              <p>• Block 2-hour focus time for urgent items</p>
            </div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-800">🤖 Task AI Response</h4>
        <div class="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <p class="text-orange-700">Processing your request: "<em>${command}</em>"</p>
          <p class="text-sm text-orange-600 mt-2">I can help you with:</p>
          <ul class="mt-3 space-y-1 text-sm text-orange-700">
            <li>• Smart task prioritization and scheduling</li>
            <li>• Deadline tracking and alerts</li>
            <li>• Progress analysis and reporting</li>
            <li>• Workload balancing and optimization</li>
            <li>• Task automation and workflows</li>
          </ul>
        </div>
      </div>
    `;
  }

  // Real API integration functions
  async loadTasks(filters = {}) {
    try {
      this.showLoading(true);
      
      const params = new URLSearchParams({
        action: 'get_tasks',
        ...filters
      });

      console.log('Loading tasks from:', this.apiUrl);
      
      const response = await fetch(`${this.apiUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.tasks = data.tasks || [];
        this.stats = data.stats || this.stats;
        this.updateUI();
        this.renderTasks();
        console.log('✅ Tasks loaded successfully:', this.tasks.length);
      } else {
        throw new Error(data.message || 'Failed to load tasks');
      }

    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      this.showError('Failed to load tasks: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  // Load sample tasks for demonstration
  loadSampleTasks() {
    console.log('Loading sample tasks...');
    
    this.tasks = [
      {
        id: 'task_1',
        name: 'Website Security Audit',
        description: 'Complete security assessment and vulnerability report',
        dueDate: '02-01-2025',
        dueDateFormatted: '2 days overdue',
        timeEstimate: '3 hrs',
        status: 'To Do',
        priority: 'High',
        priorityColor: 'red',
        progress: 0,
        type: 'Security',
        isOverdue: true,
        isDueToday: false
      },
      {
        id: 'task_2',
        name: 'Write Blog Article',
        description: 'Article on "Top 5 AI Tools for Creators"',
        dueDate: '06-01-2025',
        dueDateFormatted: 'Due tomorrow',
        timeEstimate: '2 hrs',
        status: 'In Progress',
        priority: 'Medium',
        priorityColor: 'orange',
        progress: 65,
        type: 'Writing',
        isOverdue: false,
        isDueToday: false
      },
      {
        id: 'task_3',
        name: 'Design Landing Page',
        description: 'Create a responsive landing page using Tailwind',
        dueDate: '05-01-2025',
        dueDateFormatted: 'Due today',
        timeEstimate: '3 hrs',
        status: 'To Do',
        priority: 'Medium',
        priorityColor: 'orange',
        progress: 0,
        type: 'Design',
        isOverdue: false,
        isDueToday: true
      },
      {
        id: 'task_4',
        name: 'Deploy Production Update',
        description: 'Release v2.1.3 to production servers',
        dueDate: '03-01-2025',
        dueDateFormatted: 'Completed yesterday',
        timeEstimate: '1 hr',
        status: 'Done',
        priority: 'High',
        priorityColor: 'red',
        progress: 100,
        type: 'Development',
        isOverdue: false,
        isDueToday: false
      }
    ];

    this.stats = {
      total: this.tasks.length,
      overdue: this.tasks.filter(t => t.isOverdue).length,
      dueToday: this.tasks.filter(t => t.isDueToday).length,
      completed: this.tasks.filter(t => t.status === 'Done').length,
      inProgress: this.tasks.filter(t => t.status === 'In Progress').length,
      toDo: this.tasks.filter(t => t.status === 'To Do').length
    };

    this.updateUI();
    this.renderTasks();
    this.showLoading(false);
  }

  async searchTasks(query) {
    if (!query.trim()) {
      this.loadTasks();
      return;
    }

    // Filter current tasks for demo
    const filtered = this.tasks.filter(task => 
      task.name.toLowerCase().includes(query.toLowerCase()) ||
      task.description.toLowerCase().includes(query.toLowerCase())
    );

    this.renderFilteredTasks(filtered);
    this.showToast(`Found ${filtered.length} tasks matching "${query}"`, 'info');
  }

  async filterTasks(status) {
    console.log('Filtering by status:', status);
    
    if (status === 'all') {
      this.renderTasks();
      return;
    }

    const statusMap = {
      'todo': 'To Do',
      'inprogress': 'In Progress', 
      'done': 'Done'
    };

    const targetStatus = statusMap[status] || status;
    const filtered = this.tasks.filter(task => task.status === targetStatus);
    this.renderFilteredTasks(filtered);
    this.showToast(`Showing ${filtered.length} ${targetStatus} tasks`, 'info');
  }

  renderTasks() {
    this.renderFilteredTasks(this.tasks);
  }

  renderFilteredTasks(tasks) {
    const todoColumn = document.querySelector('#todoColumn .kanban-column');
    const inProgressColumn = document.querySelector('#inProgressColumn .kanban-column');
    const doneColumn = document.querySelector('#doneColumn .kanban-column');

    if (!todoColumn || !inProgressColumn || !doneColumn) {
      console.error('Kanban columns not found');
      return;
    }

    // Clear existing tasks
    todoColumn.innerHTML = '';
    inProgressColumn.innerHTML = '';
    doneColumn.innerHTML = '';

    // Group tasks by status
    const tasksByStatus = {
      'To Do': [],
      'In Progress': [],
      'Done': []
    };

    tasks.forEach(task => {
      if (tasksByStatus[task.status]) {
        tasksByStatus[task.status].push(task);
      }
    });

    // Render tasks in each column
    Object.keys(tasksByStatus).forEach(status => {
      const column = status === 'To Do' ? todoColumn : 
                    status === 'In Progress' ? inProgressColumn : doneColumn;
      
      tasksByStatus[status].forEach(task => {
        column.appendChild(this.createTaskCard(task));
      });
    });

    // Update column counts
    this.updateColumnCounts(tasksByStatus);
  }

  createTaskCard(task) {
    const card = document.createElement('div');
    
    let cardClass = 'task-card bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all';
    if (task.isOverdue) {
      cardClass = 'task-card task-overdue bg-red-50 p-4 rounded-lg border border-red-200 cursor-pointer hover:shadow-md transition-all';
    } else if (task.isDueToday) {
      cardClass = 'task-card task-due-today bg-orange-50 p-4 rounded-lg border border-orange-200 cursor-pointer hover:shadow-md transition-all';
    } else if (task.status === 'Done') {
      cardClass = 'task-card task-completed bg-green-50 p-4 rounded-lg border border-green-200 cursor-pointer hover:shadow-md transition-all';
    }

    card.className = cardClass;
    card.setAttribute('data-task-id', task.id);

    const priorityBadgeColor = task.priority === 'High' ? 'red' : 
                              task.priority === 'Medium' ? 'orange' : 'green';

    let progressBar = '';
    if (task.status === 'In Progress') {
      progressBar = `
        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div class="bg-orange-500 h-2 rounded-full transition-all duration-300" style="width: ${task.progress}%"></div>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>${task.progress}% complete</span>
          <span>${task.dueDateFormatted}</span>
        </div>
      `;
    } else {
      progressBar = `
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span><i class="fas fa-clock mr-1"></i>${task.dueDateFormatted}</span>
          ${task.type ? `<span><i class="fas fa-tag mr-1"></i>${task.type}</span>` : ''}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="flex items-start justify-between mb-2">
        <h4 class="font-medium text-gray-800 text-sm ${task.status === 'Done' ? 'line-through' : ''}">${task.name}</h4>
        <span class="px-2 py-1 bg-${priorityBadgeColor}-100 text-${priorityBadgeColor}-700 text-xs rounded-full">${task.priority}</span>
      </div>
      <p class="text-xs text-gray-600 mb-3">${task.description}</p>
      ${progressBar}
      ${task.timeEstimate !== 'Not specified' ? `
        <div class="text-xs text-gray-500 mt-2">
          <i class="fas fa-hourglass-half mr-1"></i>Estimated: ${task.timeEstimate}
        </div>
      ` : ''}
      ${task.status === 'Done' ? `
        <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span><i class="fas fa-check mr-1"></i>Completed</span>
          <span>Yesterday</span>
        </div>
      ` : ''}
    `;

    // Add click handler for task details
    card.addEventListener('click', () => this.showTaskDetails(task));

    return card;
  }

  updateColumnCounts(tasksByStatus) {
    const todoCountEl = document.querySelector('#todoColumn .text-gray-500');
    const inProgressCountEl = document.querySelector('#inProgressColumn .text-gray-500');
    const doneCountEl = document.querySelector('#doneColumn .text-gray-500');

    if (todoCountEl) todoCountEl.textContent = tasksByStatus['To Do'].length;
    if (inProgressCountEl) inProgressCountEl.textContent = tasksByStatus['In Progress'].length;
    if (doneCountEl) doneCountEl.textContent = tasksByStatus['Done'].length;
  }

  updateUI() {
    // Update stats dashboard
    this.updateElement('overdueCount', this.stats.overdue);
    this.updateElement('dueTodayCount', this.stats.dueToday);
    this.updateElement('totalTasks', this.stats.total);
    this.updateElement('completedToday', this.stats.completed);

    this.updateLastUpdated('lastUpdate');
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  showTaskDetails(task) {
    const modalContent = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xl font-bold text-gray-800">${task.name}</h4>
          <span class="px-3 py-1 bg-${task.priorityColor}-100 text-${task.priorityColor}-700 text-sm rounded-full">${task.priority} Priority</span>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <h5 class="font-medium text-gray-700 mb-2">Description</h5>
          <p class="text-gray-600">${task.description}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-blue-50 rounded-lg p-3">
            <h5 class="font-medium text-blue-700 mb-1">Status</h5>
            <p class="text-blue-600">${task.status}</p>
          </div>
          <div class="bg-green-50 rounded-lg p-3">
            <h5 class="font-medium text-green-700 mb-1">Due Date</h5>
            <p class="text-green-600">${task.dueDateFormatted}</p>
          </div>
        </div>

        ${task.status === 'In Progress' ? `
          <div class="bg-orange-50 rounded-lg p-3">
            <h5 class="font-medium text-orange-700 mb-1">Progress</h5>
            <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div class="bg-orange-500 h-3 rounded-full" style="width: ${task.progress}%"></div>
            </div>
            <p class="text-orange-600">${task.progress}% Complete</p>
          </div>
        ` : ''}

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-purple-50 rounded-lg p-3">
            <h5 class="font-medium text-purple-700 mb-1">Type</h5>
            <p class="text-purple-600">${task.type}</p>
          </div>
          <div class="bg-indigo-50 rounded-lg p-3">
            <h5 class="font-medium text-indigo-700 mb-1">Time Estimate</h5>
            <p class="text-indigo-600">${task.timeEstimate}</p>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button onclick="taskAgent.updateTaskStatus('${task.id}', 'In Progress')" class="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
            Mark In Progress
          </button>
          <button onclick="taskAgent.updateTaskStatus('${task.id}', 'Done')" class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
            Mark Complete
          </button>
        </div>
      </div>
    `;

    this.showAIModal(modalContent);
  }

  showLoading(show) {
    const loadingElement = document.getElementById('loadingState');
    const kanbanColumns = document.querySelectorAll('.kanban-column');
    
    if (loadingElement) {
      loadingElement.classList.toggle('hidden', !show);
    }
    
    if (show) {
      kanbanColumns.forEach(column => {
        column.innerHTML = '<div class="text-center text-gray-500 py-8"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
      });
    }
  }

  showError(message) {
    const todoColumn = document.querySelector('#todoColumn .kanban-column');
    if (todoColumn) {
      todoColumn.innerHTML = `
        <div class="text-center py-8">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-exclamation-triangle text-red-500"></i>
          </div>
          <h3 class="text-sm font-semibold text-red-600 mb-2">Error Loading Tasks</h3>
          <p class="text-xs text-gray-500 mb-3">${message}</p>
          <button onclick="taskAgent.loadSampleTasks()" class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors">
            Load Sample Data
          </button>
        </div>
      `;
    }
  }

  updateTaskStats() {
    this.totalActions++;
  }

  // Utility functions
  setButtonLoading(elementId, text, iconClass) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<i class="${iconClass}"></i> ${text}`;
      element.disabled = true;
    }
  }

  restoreButton(elementId, text, iconClass) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<i class="${iconClass}"></i> <span>${text}</span>`;
      element.disabled = false;
    }
  }

  clearInput(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = '';
    }
  }

  showAIModal(content) {
    const modal = document.getElementById('aiModal');
    const responseDiv = document.getElementById('aiResponse');
    if (modal && responseDiv) {
      responseDiv.innerHTML = content;
      modal.classList.remove('hidden');
    }
  }

  hideAIModal() {
    const modal = document.getElementById('aiModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300`;
    
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }[type] || 'bg-gray-500';
    
    const icon = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    toast.innerHTML = `
      <div class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <i class="${icon}"></i>
        <span class="text-sm font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-white hover:text-gray-200">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 4000);
  }

  // Quick action functions
  createTask() {
    this.showAIModal(`
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-800">✅ Create New Task</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Task Name:</label>
            <input type="text" id="newTaskName" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Enter task name">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description:</label>
            <textarea id="newTaskDescription" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Describe the task..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Date:</label>
              <input type="date" id="newTaskDue" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority:</label>
              <select id="newTaskPriority" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="Low">Low Priority</option>
                <option value="Medium" selected>Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Time Estimate:</label>
            <select id="newTaskTime" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="30 mins">30 minutes</option>
              <option value="1 hr" selected>1 hour</option>
              <option value="2 hrs">2 hours</option>
              <option value="4 hrs">4 hours</option>
              <option value="1 day">1 day</option>
              <option value="2-3 days">2-3 days</option>
              <option value="1 week">1 week</option>
            </select>
          </div>
          <button onclick="taskAgent.submitNewTask()" class="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium">
            🚀 Create Task
          </button>
        </div>
      </div>
    `);
  }

  async submitNewTask() {
    const name = document.getElementById('newTaskName')?.value || '';
    const description = document.getElementById('newTaskDescription')?.value || '';
    const dueDate = document.getElementById('newTaskDue')?.value || '';
    const priority = document.getElementById('newTaskPriority')?.value || 'Medium';
    const timeEstimate = document.getElementById('newTaskTime')?.value || '1 hr';

    if (!name.trim()) {
      this.showToast('Please enter a task name', 'warning');
      return;
    }

    try {
      // In a real implementation, you would send this to your n8n workflow
      // For now, we'll simulate success and add to local data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new task to local data for demo
      const newTask = {
        id: 'task_' + Date.now(),
        name: name,
        description: description || 'No description provided',
        dueDate: dueDate,
        dueDateFormatted: dueDate ? 'Due ' + new Date(dueDate).toLocaleDateString() : 'No due date',
        timeEstimate: timeEstimate,
        status: 'To Do',
        priority: priority,
        priorityColor: priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green',
        progress: 0,
        type: 'General',
        isOverdue: false,
        isDueToday: false
      };
      
      this.tasks.unshift(newTask);
      this.stats.total++;
      this.stats.toDo++;
      
      this.hideAIModal();
      this.showToast(`Task "${name}" created successfully!`, 'success');
      this.updateUI();
      this.renderTasks();
      
    } catch (error) {
      this.showToast('Failed to create task: ' + error.message, 'error');
    }
  }

  async updateTaskStatus(taskId, newStatus) {
    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        const oldStatus = task.status;
        task.status = newStatus;
        
        if (newStatus === 'Done') {
          task.progress = 100;
        } else if (newStatus === 'In Progress' && task.progress === 0) {
          task.progress = 25;
        }
        
        // Update stats
        if (oldStatus === 'To Do') this.stats.toDo--;
        else if (oldStatus === 'In Progress') this.stats.inProgress--;
        else if (oldStatus === 'Done') this.stats.completed--;
        
        if (newStatus === 'To Do') this.stats.toDo++;
        else if (newStatus === 'In Progress') this.stats.inProgress++;
        else if (newStatus === 'Done') this.stats.completed++;
        
        this.hideAIModal();
        this.showToast(`Task status updated to ${newStatus}`, 'success');
        this.updateUI();
        this.renderTasks();
      }
    } catch (error) {
      this.showToast('Failed to update task: ' + error.message, 'error');
    }
  }

  prioritizeTasks() {
    this.updateTaskStats();
    this.showToast('🎯 Tasks automatically prioritized by AI algorithm!', 'success');
    
    // Sort tasks by priority and overdue status
    this.tasks.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
    
    this.renderTasks();
  }

  bulkUpdate() {
    this.updateTaskStats();
    this.showToast('📝 Bulk update feature coming soon!', 'info');
  }

  generateReport() {
    const completionRate = this.stats.total > 0 ? Math.round((this.stats.completed / this.stats.total) * 100) : 0;
    
    this.showAIModal(`
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-800">📊 Progress Report</h4>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">${this.stats.total}</div>
            <div class="text-sm text-blue-600">Total Tasks</div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600">${completionRate}%</div>
            <div class="text-sm text-green-600">Completion Rate</div>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <h5 class="font-medium text-gray-700 mb-3">Task Breakdown</h5>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Completed:</span>
              <span class="font-medium text-green-600">${this.stats.completed}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">In Progress:</span>
              <span class="font-medium text-orange-600">${this.stats.inProgress}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">To Do:</span>
              <span class="font-medium text-blue-600">${this.stats.toDo}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-red-600">Overdue:</span>
              <span class="font-medium text-red-600">${this.stats.overdue}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <h5 class="font-medium text-orange-800 mb-2">💡 AI Insights</h5>
          <ul class="text-sm text-orange-700 space-y-1">
            <li>• Your completion rate is ${completionRate > 70 ? 'excellent' : completionRate > 50 ? 'good' : 'needs improvement'}</li>
            <li>• ${this.stats.overdue > 0 ? `Focus on ${this.stats.overdue} overdue tasks first` : 'Great job staying on top of deadlines!'}</li>
            <li>• Consider breaking down large tasks into smaller chunks</li>
          </ul>
        </div>
      </div>
    `);
  }

  // Search and filter functions
  async handleSearch() {
    const searchInput = document.getElementById('taskSearchInput');
    if (searchInput) {
      await this.searchTasks(searchInput.value);
    }
  }

  async handleFilter(status) {
    await this.filterTasks(status);
    
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('bg-orange-200', 'text-orange-800');
      btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[data-status="${status}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
      activeBtn.classList.add('bg-orange-200', 'text-orange-800');
    }
  }
}

// Initialize Task Agent when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Task Agent...');
  window.taskAgent = new TaskAgent();
  
  // Make functions globally available for onclick handlers
  window.executeTaskCommand = () => taskAgent.executeTaskCommand();
  window.setTaskCommand = (cmd) => taskAgent.setTaskCommand(cmd);
  window.createTask = () => taskAgent.createTask();
  window.prioritizeTasks = () => taskAgent.prioritizeTasks();
  window.bulkUpdate = () => taskAgent.bulkUpdate();
  window.generateReport = () => taskAgent.generateReport();
  window.closeAIModal = () => taskAgent.hideAIModal();
  
  console.log('✅ Task Agent initialized successfully');
});

// Global helper functions
function goHome() {
  window.location.href = 'index.html';
}

console.log('✅ Task Agent JS loaded successfully');