// Clock Manager
class ClockManager {
    constructor() {
        this.clocks = [];
        this.updateInterval = 1000;
        this.intervalId = null;
        this.format12h = true;
        this.showSeconds = true;
        this.clockSize = 'medium';
        this.loadClocks();
    }

    addClock(timezone) {
        const clock = {
            id: Date.now(),
            timezone: timezone,
            format12h: this.format12h,
            showSeconds: this.showSeconds
        };
        this.clocks.push(clock);
        this.saveClocks();
        return clock;
    }

    removeClock(id) {
        this.clocks = this.clocks.filter(c => c.id !== id);
        this.saveClocks();
    }

    removeAllClocks() {
        this.clocks = [];
        this.saveClocks();
    }

    saveClocks() {
        localStorage.setItem('clocks', JSON.stringify(this.clocks));
    }

    loadClocks() {
        const saved = localStorage.getItem('clocks');
        if (saved) {
            try {
                this.clocks = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading clocks:', e);
                this.clocks = [];
            }
        }
    }

    getClocks() {
        return this.clocks;
    }

    setUpdateInterval(interval) {
        this.updateInterval = interval;
    }

    getTimeInTimezone(timezone, format12h, showSeconds) {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour12: format12h,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            let timeString = formatter.format(new Date());
            if (!showSeconds) {
                timeString = timeString.replace(/:\d{2}\s/, ' ');
            }
            return timeString;
        } catch (e) {
            return 'Invalid TZ';
        }
    }

    getOffsetForTimezone(timezone) {
        try {
            const now = new Date();
            const utcString = now.toLocaleString('en-US', { timeZone: 'UTC' });
            const tzString = now.toLocaleString('en-US', { timeZone: timezone });
            
            const utcTime = new Date(utcString);
            const tzTime = new Date(tzString);
            
            const offset = (tzTime - utcTime) / (1000 * 60 * 60);
            const sign = offset >= 0 ? '+' : '';
            const hours = Math.floor(Math.abs(offset));
            const minutes = Math.round((Math.abs(offset) - hours) * 60);
            
            return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
        } catch (e) {
            return 'UTC±0:00';
        }
    }

    getAnalogTime(timezone) {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const timeString = formatter.format(new Date());
            const [hour, minute, second] = timeString.split(':').map(Number);

            return {
                hours: hour % 12,
                minutes: minute,
                seconds: second
            };
        } catch (e) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }
    }
}

// Timezone Database
const TIMEZONES = [
    // Americas
    'America/Anchorage',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/New_York',
    'America/Toronto',
    'America/Mexico_City',
    'America/Argentina/Buenos_Aires',
    'America/Sao_Paulo',
    // Europe
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Amsterdam',
    'Europe/Moscow',
    'Europe/Istanbul',
    // Asia
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'Asia/Hong_Kong',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Singapore',
    'Asia/Jakarta',
    'Asia/Manila',
    // Australia & Pacific
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'Pacific/Fiji',
    'Pacific/Honolulu'
];

// UI Manager
class UIManager {
    constructor(clockManager) {
        this.clockManager = clockManager;
        this.initElements();
        this.attachEventListeners();
        this.populateTimezones();
        this.renderClocks();
        this.startClockUpdates();
    }

    initElements() {
        this.timezoneSearch = document.getElementById('timezoneSearch');
        this.addClockBtn = document.getElementById('addClockBtn');
        this.clocksGrid = document.getElementById('clocksGrid');
        this.emptyState = document.getElementById('emptyState');
        this.timezoneModal = document.getElementById('timezoneModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.timezoneList = document.getElementById('timezoneList');
        this.modalSearch = document.getElementById('modalSearch');
        this.modalClose = document.querySelector('.modal-close');
        this.format12hCheckbox = document.getElementById('format12h');
        this.showSecondsCheckbox = document.getElementById('showSeconds');
        this.autoUpdateSelect = document.getElementById('autoUpdate');
        this.clockSizeSelect = document.getElementById('clockSize');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.quickBtns = document.querySelectorAll('.quick-btn');
    }

    attachEventListeners() {
        this.addClockBtn.addEventListener('click', () => this.openModal());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', () => this.closeModal());
        
        this.modalSearch.addEventListener('input', (e) => this.filterTimezones(e.target.value));
        this.timezoneSearch.addEventListener('input', (e) => this.filterTimezones(e.target.value));

        this.format12hCheckbox.addEventListener('change', (e) => {
            this.clockManager.format12h = e.target.checked;
            this.renderClocks();
        });

        this.showSecondsCheckbox.addEventListener('change', (e) => {
            this.clockManager.showSeconds = e.target.checked;
            this.renderClocks();
        });

        this.autoUpdateSelect.addEventListener('change', (e) => {
            this.clockManager.setUpdateInterval(parseInt(e.target.value));
            clearInterval(this.clockManager.intervalId);
            this.startClockUpdates();
        });

        this.clockSizeSelect.addEventListener('change', (e) => {
            this.clockManager.clockSize = e.target.value;
            this.renderClocks();
        });

        this.clearAllBtn.addEventListener('click', () => {
            if (confirm('Clear all clocks?')) {
                this.clockManager.removeAllClocks();
                this.renderClocks();
            }
        });

        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const timezone = btn.dataset.timezone;
                this.addClockQuick(timezone);
            });
        });
    }

    populateTimezones() {
        const filteredTimezones = TIMEZONES.sort();
        
        this.timezoneList.innerHTML = filteredTimezones.map(tz => `
            <div class="timezone-item" data-timezone="${tz}">
                <div class="timezone-item-main">${tz}</div>
                <div class="timezone-item-offset">UTC${this.clockManager.getOffsetForTimezone(tz)}</div>
            </div>
        `).join('');

        this.timezoneList.querySelectorAll('.timezone-item').forEach(item => {
            item.addEventListener('click', () => {
                const timezone = item.dataset.timezone;
                this.addClockQuick(timezone);
            });
        });
    }

    filterTimezones(searchTerm) {
        const filtered = TIMEZONES.filter(tz => 
            tz.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort();

        if (filtered.length === 0) {
            this.timezoneList.innerHTML = '<p class="no-results">No timezones found</p>';
            return;
        }

        this.timezoneList.innerHTML = filtered.map(tz => `
            <div class="timezone-item" data-timezone="${tz}">
                <div class="timezone-item-main">${tz}</div>
                <div class="timezone-item-offset">UTC${this.clockManager.getOffsetForTimezone(tz)}</div>
            </div>
        `).join('');

        this.timezoneList.querySelectorAll('.timezone-item').forEach(item => {
            item.addEventListener('click', () => {
                const timezone = item.dataset.timezone;
                this.addClockQuick(timezone);
            });
        });
    }

    openModal() {
        this.timezoneModal.classList.remove('hidden');
        this.modalOverlay.classList.remove('hidden');
        this.modalSearch.focus();
    }

    closeModal() {
        this.timezoneModal.classList.add('hidden');
        this.modalOverlay.classList.add('hidden');
        this.modalSearch.value = '';
        this.populateTimezones();
    }

    addClockQuick(timezone) {
        // Check if clock already exists
        if (this.clockManager.clocks.some(c => c.timezone === timezone)) {
            alert(`Clock for ${timezone} already exists!`);
            return;
        }
        
        this.clockManager.addClock(timezone);
        this.renderClocks();
        this.closeModal();
    }

    renderClocks() {
        const clocks = this.clockManager.getClocks();

        if (clocks.length === 0) {
            this.clocksGrid.innerHTML = '';
            this.emptyState.classList.add('show');
            return;
        }

        this.emptyState.classList.remove('show');

        this.clocksGrid.innerHTML = clocks.map(clock => this.createClockCard(clock)).join('');

        clocks.forEach(clock => {
            const deleteBtn = document.querySelector(`[data-clock-id="${clock.id}"]`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.clockManager.removeClock(clock.id);
                    this.renderClocks();
                });
            }
        });
    }

    createClockCard(clock) {
        const timezone = clock.timezone;
        const offset = this.clockManager.getOffsetForTimezone(timezone);
        const time = this.clockManager.getTimeInTimezone(timezone, this.clockManager.format12h, this.clockManager.showSeconds);
        const analogTime = this.clockManager.getAnalogTime(timezone);
        
        const hourDegrees = (analogTime.hours * 30) + (analogTime.minutes * 0.5);
        const minuteDegrees = (analogTime.minutes * 6) + (analogTime.seconds * 0.1);
        const secondDegrees = analogTime.seconds * 6;

        const sizeClass = this.clockManager.clockSize;

        return `
            <div class="clock-card ${sizeClass}">
                <div class="timezone-name">${timezone.split('/')[1] || timezone}</div>
                <div class="timezone-offset">UTC${offset}</div>
                <div class="digital-display">${time}</div>
                <div class="analog-display">
                    <div class="clock-hand hour-hand" style="transform: rotate(${hourDegrees}deg)"></div>
                    <div class="clock-hand minute-hand" style="transform: rotate(${minuteDegrees}deg)"></div>
                    <div class="clock-hand second-hand" style="transform: rotate(${secondDegrees}deg)"></div>
                    <div class="analog-center"></div>
                </div>
                <div class="clock-actions">
                    <button class="btn-small btn-delete" data-clock-id="${clock.id}">Remove</button>
                </div>
            </div>
        `;
    }

    startClockUpdates() {
        this.updateClocks();
        this.clockManager.intervalId = setInterval(() => {
            this.updateClocks();
        }, this.clockManager.updateInterval);
    }

    updateClocks() {
        const clocks = this.clockManager.getClocks();
        clocks.forEach(clock => {
            const timeElement = document.querySelector(`[data-clock-id="${clock.id}"]`)?.closest('.clock-card')?.querySelector('.digital-display');
            if (timeElement) {
                const time = this.clockManager.getTimeInTimezone(clock.timezone, this.clockManager.format12h, this.clockManager.showSeconds);
                timeElement.textContent = time;

                const analogTime = this.clockManager.getAnalogTime(clock.timezone);
                const card = timeElement.closest('.clock-card');
                
                const hourDegrees = (analogTime.hours * 30) + (analogTime.minutes * 0.5);
                const minuteDegrees = (analogTime.minutes * 6) + (analogTime.seconds * 0.1);
                const secondDegrees = analogTime.seconds * 6;

                const hourHand = card.querySelector('.hour-hand');
                const minuteHand = card.querySelector('.minute-hand');
                const secondHand = card.querySelector('.second-hand');

                if (hourHand) hourHand.style.transform = `rotate(${hourDegrees}deg)`;
                if (minuteHand) minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
                if (secondHand) secondHand.style.transform = `rotate(${secondDegrees}deg)`;
            }
        });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    const clockManager = new ClockManager();
    const uiManager = new UIManager(clockManager);
});
