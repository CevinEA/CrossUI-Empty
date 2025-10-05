// Keyboard Shortcuts Controller
class KeyboardController {
    constructor(videoPlayer) {
        this.player = videoPlayer;
        this.video = videoPlayer.video;
        this.shortcutsHelp = document.getElementById('shortcutsHelp');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Shortcuts help
        document.getElementById('closeShortcuts').addEventListener('click', () => {
            this.hideShortcutsHelp();
        });
        
        // Close shortcuts on escape or click outside
        this.shortcutsHelp.addEventListener('click', (e) => {
            if (e.target === this.shortcutsHelp) {
                this.hideShortcutsHelp();
            }
        });
    }

    handleKeydown(e) {
        // Don't handle shortcuts if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }

        // Get key combination
        const key = e.key.toLowerCase();
        const shift = e.shiftKey;
        const ctrl = e.ctrlKey;
        const alt = e.altKey;

        // Handle shortcuts
        switch (key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.player.togglePlayPause();
                break;

            case 'arrowleft':
                e.preventDefault();
                this.seekBackward(shift ? 30 : 10);
                break;

            case 'arrowright':
                e.preventDefault();
                this.seekForward(shift ? 30 : 10);
                break;

            case 'arrowup':
                e.preventDefault();
                this.volumeUp();
                break;

            case 'arrowdown':
                e.preventDefault();
                this.volumeDown();
                break;

            case 'm':
                e.preventDefault();
                this.player.toggleMute();
                break;

            case 'f':
                e.preventDefault();
                this.player.toggleFullscreen();
                break;

            case 'c':
                e.preventDefault();
                this.toggleSubtitles();
                break;

            case 'p':
                if (shift) {
                    e.preventDefault();
                    this.player.previousVideo();
                }
                break;

            case 'n':
                if (shift) {
                    e.preventDefault();
                    this.player.nextVideo();
                }
                break;

            case 'j':
                e.preventDefault();
                this.seekBackward(10);
                break;

            case 'l':
                e.preventDefault();
                this.seekForward(10);
                break;

            case 'home':
                e.preventDefault();
                this.seekToBeginning();
                break;

            case 'end':
                e.preventDefault();
                this.seekToEnd();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                e.preventDefault();
                this.seekToPercentage(parseInt(key) * 10);
                break;

            case ',':
                e.preventDefault();
                this.frameBackward();
                break;

            case '.':
                e.preventDefault();
                this.frameForward();
                break;

            case '<':
                e.preventDefault();
                this.decreaseSpeed();
                break;

            case '>':
                e.preventDefault();
                this.increaseSpeed();
                break;

            case 'r':
                e.preventDefault();
                this.resetSpeed();
                break;

            case 'escape':
                e.preventDefault();
                this.handleEscape();
                break;

            case '?':
            case '/':
                e.preventDefault();
                this.showShortcutsHelp();
                break;

            case 'o':
                if (ctrl) {
                    e.preventDefault();
                    this.player.openFileDialog();
                }
                break;

            case 's':
                if (ctrl) {
                    e.preventDefault();
                    // Could implement save/bookmark functionality
                }
                break;

            default:
                // Handle other keys if needed
                break;
        }
    }

    // Seeking functions
    seekBackward(seconds) {
        if (this.video.duration) {
            this.video.currentTime = Math.max(0, this.video.currentTime - seconds);
            this.showSeekFeedback(`-${seconds}s`);
        }
    }

    seekForward(seconds) {
        if (this.video.duration) {
            this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + seconds);
            this.showSeekFeedback(`+${seconds}s`);
        }
    }

    seekToPercentage(percentage) {
        if (this.video.duration) {
            this.video.currentTime = (percentage / 100) * this.video.duration;
            this.showSeekFeedback(`${percentage}%`);
        }
    }

    seekToBeginning() {
        this.video.currentTime = 0;
        this.showSeekFeedback('Beginning');
    }

    seekToEnd() {
        if (this.video.duration) {
            this.video.currentTime = this.video.duration - 1;
            this.showSeekFeedback('End');
        }
    }

    frameBackward() {
        if (this.video.duration) {
            // Approximate frame duration (assuming 30fps)
            const frameDuration = 1 / 30;
            this.video.currentTime = Math.max(0, this.video.currentTime - frameDuration);
            this.showSeekFeedback('Frame -');
        }
    }

    frameForward() {
        if (this.video.duration) {
            // Approximate frame duration (assuming 30fps)
            const frameDuration = 1 / 30;
            this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + frameDuration);
            this.showSeekFeedback('Frame +');
        }
    }

    // Volume functions
    volumeUp() {
        const newVolume = Math.min(1, this.video.volume + 0.1);
        this.player.setVolume(newVolume);
        this.showVolumeFeedback(Math.round(newVolume * 100) + '%');
    }

    volumeDown() {
        const newVolume = Math.max(0, this.video.volume - 0.1);
        this.player.setVolume(newVolume);
        this.showVolumeFeedback(Math.round(newVolume * 100) + '%');
    }

    // Speed functions
    increaseSpeed() {
        const currentSpeed = this.video.playbackRate;
        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        const currentIndex = speeds.findIndex(speed => Math.abs(speed - currentSpeed) < 0.01);
        const nextIndex = Math.min(speeds.length - 1, currentIndex + 1);
        
        this.player.setPlaybackSpeed(speeds[nextIndex]);
        this.showSpeedFeedback(speeds[nextIndex] + 'x');
    }

    decreaseSpeed() {
        const currentSpeed = this.video.playbackRate;
        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        const currentIndex = speeds.findIndex(speed => Math.abs(speed - currentSpeed) < 0.01);
        const prevIndex = Math.max(0, currentIndex - 1);
        
        this.player.setPlaybackSpeed(speeds[prevIndex]);
        this.showSpeedFeedback(speeds[prevIndex] + 'x');
    }

    resetSpeed() {
        this.player.setPlaybackSpeed(1);
        this.showSpeedFeedback('1x');
    }

    // Other functions
    toggleSubtitles() {
        const subtitlesBtn = document.getElementById('subtitlesBtn');
        // Implement subtitle toggle logic here
        this.showFeedback('Subtitles toggled');
    }

    handleEscape() {
        // Close any open panels
        if (this.shortcutsHelp.classList.contains('show')) {
            this.hideShortcutsHelp();
        } else if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            // Could close settings panel or other modals
            const settingsPanel = document.getElementById('settingsPanel');
            if (settingsPanel && settingsPanel.classList.contains('show')) {
                settingsPanel.classList.remove('show');
            }
        }
    }

    // Shortcuts help
    showShortcutsHelp() {
        this.shortcutsHelp.classList.add('show');
    }

    hideShortcutsHelp() {
        this.shortcutsHelp.classList.remove('show');
    }

    // Feedback functions
    showSeekFeedback(text) {
        this.showFeedback(text, 'seek');
    }

    showVolumeFeedback(text) {
        this.showFeedback(text, 'volume');
    }

    showSpeedFeedback(text) {
        this.showFeedback(text, 'speed');
    }

    showFeedback(text, type = 'general') {
        // Create or update feedback element
        let feedback = document.getElementById('keyboardFeedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'keyboardFeedback';
            feedback.className = 'keyboard-feedback';
            this.player.container.appendChild(feedback);
        }

        feedback.textContent = text;
        feedback.className = `keyboard-feedback ${type} show`;

        // Clear existing timeout
        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
        }

        // Hide after delay
        this.feedbackTimeout = setTimeout(() => {
            feedback.classList.remove('show');
        }, 1000);
    }
}

// Add feedback styles
const feedbackStyles = `
.keyboard-feedback {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    z-index: 15;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    white-space: nowrap;
}

.keyboard-feedback.show {
    opacity: 1;
}

.keyboard-feedback.seek {
    background: rgba(255, 0, 0, 0.9);
}

.keyboard-feedback.volume {
    background: rgba(0, 150, 255, 0.9);
}

.keyboard-feedback.speed {
    background: rgba(255, 165, 0, 0.9);
}
`;

// Inject feedback styles
const style = document.createElement('style');
style.textContent = feedbackStyles;
document.head.appendChild(style);

// Initialize keyboard controller when video player is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.videoPlayer) {
            window.keyboardController = new KeyboardController(window.videoPlayer);
        }
    }, 100);
});