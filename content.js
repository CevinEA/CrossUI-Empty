// Content Script for Video Player Extension
class VideoPlayerContent {
    constructor() {
        this.overlay = null;
        this.playerFrame = null;
        this.init();
    }

    init() {
        this.setupMessageListener();
        this.createOverlay();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'showPlayer':
                    this.showPlayer();
                    sendResponse({ success: true });
                    break;
                case 'hidePlayer':
                    this.hidePlayer();
                    sendResponse({ success: true });
                    break;
                case 'openSettings':
                    this.openSettings();
                    sendResponse({ success: true });
                    break;
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        });
    }

    createOverlay() {
        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'video-player-overlay';
        this.overlay.id = 'videoPlayerOverlay';

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'video-player-close';
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close Video Player';
        closeBtn.addEventListener('click', () => this.hidePlayer());

        // Create iframe for player
        this.playerFrame = document.createElement('iframe');
        this.playerFrame.className = 'video-player-iframe';
        this.playerFrame.src = chrome.runtime.getURL('player.html');
        this.playerFrame.allowFullscreen = true;

        // Append elements
        this.overlay.appendChild(closeBtn);
        this.overlay.appendChild(this.playerFrame);
        
        // Add to page (but keep hidden)
        document.body.appendChild(this.overlay);

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('show')) {
                this.hidePlayer();
            }
        });

        // Handle clicks outside player (optional)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                // Uncomment to close on outside click
                // this.hidePlayer();
            }
        });
    }

    showPlayer() {
        if (!this.overlay) {
            this.createOverlay();
        }
        
        this.overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus the iframe for keyboard controls
        setTimeout(() => {
            this.playerFrame.focus();
        }, 100);
    }

    hidePlayer() {
        if (this.overlay) {
            this.overlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    openSettings() {
        // Send message to player iframe to open settings
        if (this.playerFrame && this.playerFrame.contentWindow) {
            this.playerFrame.contentWindow.postMessage({ action: 'openSettings' }, '*');
        }
    }

    // Handle messages from player iframe
    handlePlayerMessage(event) {
        if (event.source !== this.playerFrame.contentWindow) return;

        switch (event.data.action) {
            case 'closePlayer':
                this.hidePlayer();
                break;
            case 'toggleFullscreen':
                this.toggleFullscreen();
                break;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.overlay.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Initialize content script
const videoPlayerContent = new VideoPlayerContent();

// Listen for messages from player iframe
window.addEventListener('message', (event) => {
    videoPlayerContent.handlePlayerMessage(event);
});

// Inject player styles if not already present
if (!document.getElementById('videoPlayerStyles')) {
    const link = document.createElement('link');
    link.id = 'videoPlayerStyles';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('styles/content.css');
    document.head.appendChild(link);
}