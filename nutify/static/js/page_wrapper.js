// BasePage class for application pages
class BasePage {
    constructor() {
        // Get timezone from the centralized timezone.js
        this._timezone = cache_timezone_js();
        
        // Initialize common properties
        this.isRealTimeMode = true;
        this.initialLoadTime = new Date();
        this.REALTIME_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.initializeWebSocket();
    }

    startRealTimeMode() {
        this.isRealTimeMode = true;
        this.initialLoadTime = new Date();
        
        // Set the UI immediately in realtime mode
        document.querySelectorAll('.range-options a').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.range === 'realtime') {
                option.classList.add('active');
            }
        });
        this.updateDisplayedRange('Real Time');
        
        // Start the realtime updates
        this.startRealTimeUpdates();
        
        // Start the timer for the mode check
        this.modeCheckInterval = setInterval(() => {
            this.checkInitialMode();
        }, 30000);
    }

    async checkInitialMode() {
        const now = new Date();
        const timeElapsed = now - this.initialLoadTime;

        if (this.isRealTimeMode && timeElapsed >= this.REALTIME_DURATION) {
            webLogger.page('Switching to Today mode after 5 minutes');
            
            // First stop the realtime
            this.stopRealTimeUpdates();
            this.isRealTimeMode = false;
            
            // Then update the UI
            const currentTime = format_time_js(now);

            // Update the input fields with the correct values
            const fromTimeInput = document.getElementById('fromTime');
            const toTimeInput = document.getElementById('toTime');
            if (fromTimeInput) fromTimeInput.value = '00:00';
            if (toTimeInput) toTimeInput.value = currentTime;

            document.querySelectorAll('.range-options a').forEach(option => {
                option.classList.remove('active');
                if (option.dataset.range === 'today') {
                    option.classList.add('active');
                }
            });

            this.updateDisplayedRange(`Today (00:00 - ${currentTime})`);
            
            // Load the data with the correct parameters
            await this.loadData('day', '00:00', currentTime);
            return false;
        }
        return this.isRealTimeMode;
    }

    stopRealTimeMode() {
        if (this.modeCheckInterval) {
            clearInterval(this.modeCheckInterval);
        }
        this.isRealTimeMode = false;
    }

    initializeWebSocket() {
        try {
            this.socket = io();
            this.socket.on('connect', () => {
                webLogger.data('Connected to WebSocket');
            });
        } catch (error) {
            webLogger.error('WebSocket initialization error:', error);
        }
    }
}

class StaticPage {
    constructor() {
        // Get timezone from the centralized timezone.js
        this._timezone = cache_timezone_js();
    }
}

// Global event listener: Dark Mode toggle
document.addEventListener('DOMContentLoaded', function() {
    // When the page loads, check if a theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme && storedTheme === 'dark') {
        document.body.classList.add('dark');
    }

    // Updated the ID from darkToggle to themeToggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            // Toggle the "dark" class on the body element
            document.body.classList.toggle('dark');
            
            // Persist the theme selection in localStorage
            if (document.body.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
                // Optional: update the icon for the dark theme
                this.querySelector('i').classList.add('fa-rotate-180');
            } else {
                localStorage.setItem('theme', 'light');
                // Optional: restore the icon for the light theme
                this.querySelector('i').classList.remove('fa-rotate-180');
            }
        });

        // Set the initial rotation of the icon based on the current theme
        if (document.body.classList.contains('dark')) {
            themeToggle.querySelector('i').classList.add('fa-rotate-180');
        }
    }
}); 