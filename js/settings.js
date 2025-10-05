// Settings Controller
class SettingsController {
    constructor(videoPlayer) {
        this.player = videoPlayer;
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettingsUI();
    }

    setupEventListeners() {
        // Settings panel toggle
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        
        // Click outside to close
        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) {
                this.hideSettings();
            }
        });

        // Setting controls
        document.getElementById('autoplayToggle').addEventListener('change', (e) => {
            this.updateSetting('autoplay', e.target.checked);
        });

        document.getElementById('defaultSpeed').addEventListener('change', (e) => {
            const speed = parseFloat(e.target.value);
            this.updateSetting('playbackSpeed', speed);
            this.player.setPlaybackSpeed(speed);
        });

        document.getElementById('defaultVolume').addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.updateSetting('volume', volume);
            this.player.setVolume(volume);
            this.updateVolumeDisplay(e.target.value);
        });

        document.getElementById('gestureControls').addEventListener('change', (e) => {
            this.updateSetting('gestureControls', e.target.checked);
            if (window.gestureController) {
                window.gestureController.setGestureControls(e.target.checked);
            }
        });

        document.getElementById('subtitleFile').addEventListener('change', (e) => {
            this.handleSubtitleFile(e.target.files[0]);
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });
    }

    toggleSettings() {
        const isVisible = this.settingsPanel.classList.contains('show');
        if (isVisible) {
            this.hideSettings();
        } else {
            this.showSettings();
        }
    }

    showSettings() {
        this.settingsPanel.classList.add('show');
        this.loadSettingsUI(); // Refresh UI with current values
    }

    hideSettings() {
        this.settingsPanel.classList.remove('show');
    }

    updateSetting(key, value) {
        this.player.settings[key] = value;
        this.player.saveSettings();
    }

    loadSettingsUI() {
        const settings = this.player.settings;

        // Autoplay
        const autoplayToggle = document.getElementById('autoplayToggle');
        autoplayToggle.checked = settings.autoplay;

        // Default speed
        const defaultSpeed = document.getElementById('defaultSpeed');
        defaultSpeed.value = settings.playbackSpeed;

        // Default volume
        const defaultVolume = document.getElementById('defaultVolume');
        defaultVolume.value = settings.volume * 100;
        this.updateVolumeDisplay(settings.volume * 100);

        // Gesture controls
        const gestureControls = document.getElementById('gestureControls');
        gestureControls.checked = settings.gestureControls;
    }

    updateVolumeDisplay(value) {
        const volumeValue = document.getElementById('volumeValue');
        volumeValue.textContent = Math.round(value) + '%';
    }

    handleSubtitleFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.loadSubtitles(content, file.name);
        };

        if (file.name.endsWith('.vtt')) {
            reader.readAsText(file);
        } else if (file.name.endsWith('.srt')) {
            reader.readAsText(file);
            // Convert SRT to VTT format
        } else {
            alert('Supported subtitle formats: .vtt, .srt');
        }
    }

    loadSubtitles(content, filename) {
        try {
            // Remove existing subtitle tracks
            const existingTracks = this.player.video.querySelectorAll('track');
            existingTracks.forEach(track => track.remove());

            // Create new track element
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = filename;
            track.srclang = 'en';
            track.default = true;

            // Convert content to blob URL
            let processedContent = content;
            
            // Convert SRT to VTT if needed
            if (filename.endsWith('.srt')) {
                processedContent = this.convertSrtToVtt(content);
            }

            const blob = new Blob([processedContent], { type: 'text/vtt' });
            track.src = URL.createObjectURL(blob);

            // Add track to video
            this.player.video.appendChild(track);

            // Enable subtitles
            track.addEventListener('load', () => {
                const textTrack = this.player.video.textTracks[0];
                if (textTrack) {
                    textTrack.mode = 'showing';
                }
            });

            this.showNotification(`Subtitles loaded: ${filename}`);
        } catch (error) {
            console.error('Error loading subtitles:', error);
            this.showNotification('Error loading subtitles', 'error');
        }
    }

    convertSrtToVtt(srtContent) {
        // Basic SRT to VTT conversion
        let vttContent = 'WEBVTT\n\n';
        
        // Replace SRT timestamp format with VTT format
        vttContent += srtContent
            .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4')
            .replace(/^\d+$/gm, '') // Remove sequence numbers
            .replace(/\n\n\n/g, '\n\n'); // Clean up extra newlines
        
        return vttContent;
    }

    resetSettings() {
        const defaultSettings = {
            volume: 0.5,
            playbackSpeed: 1,
            autoplay: false,
            gestureControls: true
        };

        // Update player settings
        this.player.settings = { ...defaultSettings };
        this.player.saveSettings();

        // Apply settings
        this.player.applySettings();

        // Update UI
        this.loadSettingsUI();

        // Reset brightness if gesture controller exists
        if (window.gestureController) {
            window.gestureController.resetBrightness();
        }

        this.showNotification('Settings reset to default');
    }

    showNotification(message, type = 'success') {
        // Create or update notification element
        let notification = document.getElementById('settingsNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'settingsNotification';
            notification.className = 'settings-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `settings-notification ${type} show`;

        // Clear existing timeout
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        // Hide after delay
        this.notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Export/Import Settings
    exportSettings() {
        const settings = {
            ...this.player.settings,
            brightness: window.gestureController ? window.gestureController.getBrightness() : 1
        };

        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'video-player-settings.json';
        link.click();

        URL.revokeObjectURL(url);
        this.showNotification('Settings exported');
    }

    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Validate settings
                if (typeof settings === 'object' && settings !== null) {
                    // Update player settings
                    this.player.settings = { ...this.player.settings, ...settings };
                    this.player.saveSettings();
                    this.player.applySettings();

                    // Update brightness if available
                    if (settings.brightness && window.gestureController) {
                        window.gestureController.setBrightness(settings.brightness);
                    }

                    // Update UI
                    this.loadSettingsUI();

                    this.showNotification('Settings imported successfully');
                } else {
                    throw new Error('Invalid settings format');
                }
            } catch (error) {
                console.error('Error importing settings:', error);
                this.showNotification('Error importing settings', 'error');
            }
        };

        reader.readAsText(file);
    }
}

// Add notification styles
const notificationStyles = `
.settings-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 0.9rem;
    z-index: 1000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    max-width: 300px;
}

.settings-notification.show {
    opacity: 1;
    transform: translateX(0);
}

.settings-notification.success {
    border-left: 4px solid #4CAF50;
}

.settings-notification.error {
    border-left: 4px solid #f44336;
}

.settings-notification.warning {
    border-left: 4px solid #ff9800;
}
`;

// Inject notification styles
const notificationStyleEl = document.createElement('style');
notificationStyleEl.textContent = notificationStyles;
document.head.appendChild(notificationStyleEl);

// Initialize settings controller when video player is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.videoPlayer) {
            window.settingsController = new SettingsController(window.videoPlayer);
        }
    }, 100);
});