/**
 * Calendar Agent Specific Functions
 */

class CalendarAgent {
  constructor() {
    this.totalActions = 0;
    this.init();
  }

  init() {
    Utils.time.updateLastUpdated('lastSync');
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    Utils.events.onEnterKey('calendarCommand', () => this.executeCalendarCommand());
  }

  setCalendarCommand(command) {
    Utils.form.setInputValue('calendarCommand', command);
    this.executeCalendarCommand();
  }

  async executeCalendarCommand() {
    const command = Utils.form.getInputValue('calendarCommand');
    if (!command) {
      Utils.toast.warning('Please enter a command');
      return;
    }

    Utils.button.setLoading('calendarAiBtn', 'Processing...', 'fa-spinner fa-spin');

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = this.generateCalendarAIResponse(command);
      Utils.modal.showAI(response);
      
      this.updateCalendarStats();
      Utils.time.updateLastUpdated('lastSync');

    } catch (error) {
      Utils.toast.error('Error processing command: ' + error.message);
    } finally {
      Utils.button.restore('calendarAiBtn', 'Execute', 'fa-robot');
      Utils.form.clearInput('calendarCommand');
    }
  }

  generateCalendarAIResponse(command) {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('schedule') && lowerCommand.includes('meeting')) {
      return `
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-gray-800">📅 Schedule Meeting</h4>
          <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h5 class="font-medium text-green-800 mb-2">✅ Optimal Time Found</h5>
            <p class="text-sm text-green-700 mb-3">Best time for all attendees: <strong>Tomorrow 3:30 PM - 4:30 PM</strong></p>
            <div class="space-y-2 text-sm text-green-700">
              <div class="flex items-center gap-2">
                <i class="fas fa-users text-green-600"></i>
                <span>5 attendees available</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-map-marker-alt text-green-600"></i>
                <span>Conference Room B reserved</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-video text-green-600"></i>
                <span>Zoom link generated</span>
              </div>
            </div>
          </div>
          <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h5 class="font-medium text-blue-800 mb-2">📋 Meeting Details</h5>
            <div class="space-y-2 text-sm text-blue-700">
              <p><strong>Title:</strong> Team Strategy Discussion</p>
              <p><strong>Duration:</strong> 1 hour</p>
              <p><strong>Attendees:</strong> Sarah, John, Mike, Lisa, David</p>
              <p><strong>Agenda:</strong> Q1 planning and resource allocation</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Confirm & Send Invites</button>
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Modify Details</button>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-800">🤖 Calendar AI Response</h4>
        <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p class="text-green-700">Processing your request: "<em>${command}</em>"</p>
          <p class="text-sm text-green-600 mt-2">I can help you with:</p>
          <ul class="mt-3 space-y-1 text-sm text-green-700">
            <li>• Smart meeting scheduling and optimization</li>
            <li>• Finding optimal free time slots</li>
            <li>• Conflict detection and resolution</li>
            <li>• Focus time blocking and protection</li>
            <li>• Calendar analysis and insights</li>
          </ul>
        </div>
      </div>
    `;
  }

  updateCalendarStats() {
    Utils.stats.increment('aiScheduled');
    this.totalActions++;
  }

  // Quick action functions
  scheduleMeeting() {
    Utils.modal.showAI(`
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-800">📅 Schedule New Meeting</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Meeting Title:</label>
            <input type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Team Strategy Discussion">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date:</label>
              <input type="date" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Duration:</label>
              <select class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="30">30 minutes</option>
                <option value="60" selected>1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Attendees:</label>
            <input type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="sarah@company.com, john@company.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Meeting Type:</label>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="meetingType" value="inPerson" class="mr-2">
                <span class="text-sm">In-Person</span>
              </label>
              <label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="meetingType" value="virtual" class="mr-2" checked>
                <span class="text-sm">Virtual</span>
              </label>
            </div>
          </div>
          <button class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
            🤖 Find Optimal Time & Schedule
          </button>
        </div>
      </div>
    `);
  }

  findFreeTime() {
    this.updateCalendarStats();
    Utils.toast.info('🔍 Found 3 optimal time slots this week for your requirements');
  }

  blockFocusTime() {
    this.updateCalendarStats();
    Utils.toast.success('🧠 Protected 2-hour focus block scheduled for tomorrow 10-12 AM');
  }

  optimizeSchedule() {
    if (confirm('Let AI optimize your schedule for maximum productivity?')) {
      this.updateCalendarStats();
      Utils.toast.success('✨ Schedule optimized! Moved 3 meetings to create better focus blocks and reduced meeting fragmentation by 40%.');
    }
  }
}

// Initialize Calendar Agent when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.calendarAgent = new CalendarAgent();
  
  // Make functions globally available for onclick handlers
  window.executeCalendarCommand = () => calendarAgent.executeCalendarCommand();
  window.setCalendarCommand = (cmd) => calendarAgent.setCalendarCommand(cmd);
  window.scheduleMeeting = () => calendarAgent.scheduleMeeting();
  window.findFreeTime = () => calendarAgent.findFreeTime();
  window.blockFocusTime = () => calendarAgent.blockFocusTime();
  window.optimizeSchedule = () => calendarAgent.optimizeSchedule();
  window.closeAIModal = () => Utils.modal.hideAI();
  window.goHome = () => Utils.navigation.goHome();
});