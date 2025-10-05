// Gesture Controls for Video Player
class GestureController {
    constructor(videoPlayer) {
        this.player = videoPlayer;
        this.video = videoPlayer.video;
        this.container = videoPlayer.container;
        this.gestureOverlay = document.getElementById('gestureOverlay');
        this.brightnessArea = document.querySelector('.brightness-area');
        this.volumeArea = document.querySelector('.volume-area');
        this.brightnessIndicator = document.querySelector('.brightness-indicator');
        this.volumeIndicator = document.querySelector('.volume-indicator');
        
        this.isGesturing = false;
        this.gestureType = null;
        this.startY = 0;
        this.startValue = 0;
        this.brightness = 1; // 0 to 2 (50% to 200%)
        this.gestureTimeout = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadBrightness();
    }

    setupEventListeners() {
        // Touch events for mobile
        this.brightnessArea.addEventListener('touchstart', (e) => this.startGesture(e, 'brightness'), { passive: false });
        this.volumeArea.addEventListener('touchstart', (e) => this.startGesture(e, 'volume'), { passive: false });
        
        // Mouse events for desktop
        this.brightnessArea.addEventListener('mousedown', (e) => this.startGesture(e, 'brightness'));
        this.volumeArea.addEventListener('mousedown', (e) => this.startGesture(e, 'volume'));
        
        // Global move and end events
        document.addEventListener('touchmove', (e) => this.handleGestureMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.endGesture(e), { passive: false });
        document.addEventListener('mousemove', (e) => this.handleGestureMove(e));
        document.addEventListener('mouseup', (e) => this.endGesture(e));
        
        // Prevent context menu on gesture areas
        this.brightnessArea.addEventListener('contextmenu', (e) => e.preventDefault());
        this.volumeArea.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    startGesture(e, type) {
        if (!this.player.settings.gestureControls) return;
        
        e.preventDefault();
        
        this.isGesturing = true;
        this.gestureType = type;
        
        // Get starting position
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.startY = clientY;
        
        // Get starting value
        if (type === 'brightness') {
            this.startValue = this.brightness;
        } else if (type === 'volume') {
            this.startValue = this.video.volume;
        }
        
        // Show appropriate indicator
        this.showGestureIndicator(type);
        
        // Add active class to gesture area
        const area = type === 'brightness' ? this.brightnessArea : this.volumeArea;
        area.classList.add('active');
    }

    handleGestureMove(e) {
        if (!this.isGesturing || !this.gestureType) return;
        
        e.preventDefault();
        
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = this.startY - clientY; // Inverted for natural feel
        const sensitivity = 0.005; // Adjust sensitivity
        
        if (this.gestureType === 'brightness') {
            this.adjustBrightness(deltaY * sensitivity);
        } else if (this.gestureType === 'volume') {
            this.adjustVolume(deltaY * sensitivity);
        }
    }

    endGesture(e) {
        if (!this.isGesturing) return;
        
        this.isGesturing = false;
        
        // Remove active class from gesture areas
        this.brightnessArea.classList.remove('active');
        this.volumeArea.classList.remove('active');
        
        // Hide gesture indicator after delay
        this.hideGestureIndicatorAfterDelay();
        
        // Save brightness setting
        if (this.gestureType === 'brightness') {
            this.saveBrightness();
        }
        
        this.gestureType = null;
    }

    adjustBrightness(delta) {
        this.brightness = Math.max(0.1, Math.min(2, this.startValue + delta));
        this.applyBrightness();
        this.updateBrightnessIndicator();
    }

    adjustVolume(delta) {
        const newVolume = Math.max(0, Math.min(1, this.startValue + delta));
        this.player.setVolume(newVolume);
        this.updateVolumeIndicator();
    }

    applyBrightness() {
        // Apply brightness filter to video
        this.video.style.filter = `brightness(${this.brightness})`;
    }

    showGestureIndicator(type) {
        const indicator = type === 'brightness' ? this.brightnessIndicator : this.volumeIndicator;
        indicator.classList.add('active');
        
        if (type === 'brightness') {
            this.updateBrightnessIndicator();
        } else {
            this.updateVolumeIndicator();
        }
    }

    updateBrightnessIndicator() {
        const percentage = Math.round(this.brightness * 100);
        const valueEl = this.brightnessIndicator.querySelector('.indicator-value');
        valueEl.textContent = `${percentage}%`;
        
        // Update icon based on brightness level
        const iconEl = this.brightnessIndicator.querySelector('.indicator-icon');
        if (this.brightness < 0.5) {
            iconEl.textContent = '🌙'; // Low brightness
        } else if (this.brightness < 1) {
            iconEl.textContent = '☀️'; // Medium brightness
        } else {
            iconEl.textContent = '🔆'; // High brightness
        }
    }

    updateVolumeIndicator() {
        const percentage = Math.round(this.video.volume * 100);
        const valueEl = this.volumeIndicator.querySelector('.indicator-value');
        valueEl.textContent = `${percentage}%`;
        
        // Update icon based on volume level
        const iconEl = this.volumeIndicator.querySelector('.indicator-icon');
        if (this.video.muted || this.video.volume === 0) {
            iconEl.textContent = '🔇'; // Muted
        } else if (this.video.volume < 0.3) {
            iconEl.textContent = '🔈'; // Low volume
        } else if (this.video.volume < 0.7) {
            iconEl.textContent = '🔉'; // Medium volume
        } else {
            iconEl.textContent = '🔊'; // High volume
        }
    }

    hideGestureIndicatorAfterDelay() {
        clearTimeout(this.gestureTimeout);
        this.gestureTimeout = setTimeout(() => {
            this.brightnessIndicator.classList.remove('active');
            this.volumeIndicator.classList.remove('active');
        }, 1000);
    }

    loadBrightness() {
        try {
            const saved = localStorage.getItem('videoBrightness');
            if (saved) {
                this.brightness = parseFloat(saved);
                this.applyBrightness();
            }
        } catch (e) {
            console.error('Failed to load brightness:', e);
        }
    }

    saveBrightness() {
        try {
            localStorage.setItem('videoBrightness', this.brightness.toString());
        } catch (e) {
            console.error('Failed to save brightness:', e);
        }
    }

    // Public methods for external control
    setBrightness(value) {
        this.brightness = Math.max(0.1, Math.min(2, value));
        this.applyBrightness();
        this.saveBrightness();
    }

    getBrightness() {
        return this.brightness;
    }

    resetBrightness() {
        this.setBrightness(1);
    }

    // Enable/disable gesture controls
    setGestureControls(enabled) {
        this.player.settings.gestureControls = enabled;
        
        if (!enabled) {
            // End any active gesture
            this.endGesture();
        }
    }
}

// Initialize gesture controller when video player is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for video player to initialize
    setTimeout(() => {
        if (window.videoPlayer) {
            window.gestureController = new GestureController(window.videoPlayer);
        }
    }, 100);
});