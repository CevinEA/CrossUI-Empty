// Main Video Player Controller
class VideoPlayer {
    constructor() {
        this.video = document.getElementById('videoElement');
        this.container = document.getElementById('videoPlayerContainer');
        this.controls = document.getElementById('videoControls');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressPlayed = document.querySelector('.progress-played');
        this.progressBuffer = document.querySelector('.progress-buffer');
        this.progressHandle = document.querySelector('.progress-handle');
        this.timeTooltip = document.querySelector('.time-tooltip');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isDragging = false;
        this.controlsTimeout = null;
        this.settings = this.loadSettings();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.hideControlsAfterDelay();
    }

    setupEventListeners() {
        // Video events
        this.video.addEventListener('loadstart', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('progress', () => this.updateBuffer());
        this.video.addEventListener('ended', () => this.onVideoEnded());
        this.video.addEventListener('error', (e) => this.onVideoError(e));
        this.video.addEventListener('click', () => this.togglePlayPause());

        // Control buttons
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousVideo());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextVideo());
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('addFilesBtn').addEventListener('click', () => this.openFileDialog());

        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));

        // Progress bar
        this.progressBar.addEventListener('mousedown', (e) => this.startSeeking(e));
        this.progressBar.addEventListener('mousemove', (e) => this.showTimeTooltip(e));
        this.progressBar.addEventListener('mouseleave', () => this.hideTimeTooltip());
        document.addEventListener('mousemove', (e) => this.handleSeeking(e));
        document.addEventListener('mouseup', () => this.stopSeeking());

        // File inputs
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelection(e));
        document.getElementById('folderInput').addEventListener('change', (e) => this.handleFolderSelection(e));

        // Speed control
        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', (e) => this.setPlaybackSpeed(parseFloat(e.target.dataset.speed)));
        });

        // Container events
        this.container.addEventListener('mousemove', () => this.showControls());
        this.container.addEventListener('mouseleave', () => this.hideControlsAfterDelay());

        // Window events
        window.addEventListener('beforeunload', () => this.saveSettings());
    }

    // Playback Controls
    togglePlayPause() {
        if (this.video.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        const playPromise = this.video.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updatePlayPauseButton();
            }).catch(error => {
                console.error('Play failed:', error);
            });
        }
    }

    pause() {
        this.video.pause();
        this.isPlaying = false;
        this.updatePlayPauseButton();
    }

    updatePlayPauseButton() {
        const btn = document.getElementById('playPauseBtn');
        btn.classList.toggle('playing', this.isPlaying);
    }

    // Playlist Navigation
    previousVideo() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadVideo(this.playlist[this.currentIndex]);
    }

    nextVideo() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadVideo(this.playlist[this.currentIndex]);
    }

    onVideoEnded() {
        if (this.settings.autoplay && this.playlist.length > 1) {
            this.nextVideo();
        }
    }

    // Volume Controls
    setVolume(volume) {
        this.video.volume = Math.max(0, Math.min(1, volume));
        this.updateVolumeDisplay();
        this.settings.volume = volume;
    }

    toggleMute() {
        this.video.muted = !this.video.muted;
        this.updateMuteButton();
    }

    updateVolumeDisplay() {
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.value = this.video.volume * 100;
        
        const volumeValue = document.getElementById('volumeValue');
        if (volumeValue) {
            volumeValue.textContent = Math.round(this.video.volume * 100) + '%';
        }
    }

    updateMuteButton() {
        const muteBtn = document.getElementById('muteBtn');
        muteBtn.classList.toggle('muted', this.video.muted);
    }

    // Seeking Controls
    startSeeking(e) {
        this.isDragging = true;
        this.seek(e);
    }

    handleSeeking(e) {
        if (!this.isDragging) return;
        this.seek(e);
    }

    stopSeeking() {
        this.isDragging = false;
    }

    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        if (this.video.duration) {
            const time = percent * this.video.duration;
            this.video.currentTime = time;
            this.updateProgressHandle(percent);
        }
    }

    showTimeTooltip(e) {
        if (this.isDragging) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        if (this.video.duration) {
            const time = percent * this.video.duration;
            const timeText = this.formatTime(time);
            
            this.timeTooltip.querySelector('.preview-time').textContent = timeText;
            this.timeTooltip.style.left = e.clientX - rect.left + 'px';
            this.timeTooltip.classList.add('show');
        }
    }

    hideTimeTooltip() {
        if (!this.isDragging) {
            this.timeTooltip.classList.remove('show');
        }
    }

    // Progress Updates
    updateProgress() {
        if (this.isDragging || !this.video.duration) return;
        
        const percent = this.video.currentTime / this.video.duration;
        this.updateProgressHandle(percent);
        this.updateCurrentTime();
    }

    updateProgressHandle(percent) {
        this.progressPlayed.style.width = (percent * 100) + '%';
        this.progressHandle.style.left = (percent * 100) + '%';
    }

    updateBuffer() {
        if (!this.video.duration) return;
        
        const buffered = this.video.buffered;
        if (buffered.length > 0) {
            const percent = buffered.end(buffered.length - 1) / this.video.duration;
            this.progressBuffer.style.width = (percent * 100) + '%';
        }
    }

    updateCurrentTime() {
        this.currentTimeEl.textContent = this.formatTime(this.video.currentTime);
    }

    updateDuration() {
        this.durationEl.textContent = this.formatTime(this.video.duration);
    }

    // Playback Speed
    setPlaybackSpeed(speed) {
        this.video.playbackRate = speed;
        
        // Update speed display
        const speedText = document.querySelector('.speed-text');
        speedText.textContent = speed === 1 ? '1x' : speed + 'x';
        
        // Update active speed option
        document.querySelectorAll('.speed-option').forEach(option => {
            option.classList.toggle('active', parseFloat(option.dataset.speed) === speed);
        });
        
        this.settings.playbackSpeed = speed;
    }

    // Fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // File Management
    openFileDialog() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    }

    handleFileSelection(e) {
        const files = Array.from(e.target.files);
        this.addFilesToPlaylist(files);
    }

    handleFolderSelection(e) {
        const files = Array.from(e.target.files);
        const videoFiles = files.filter(file => this.isVideoFile(file));
        this.addFilesToPlaylist(videoFiles);
    }

    addFilesToPlaylist(files) {
        const videoFiles = files.filter(file => this.isVideoFile(file));
        
        videoFiles.forEach(file => {
            const url = URL.createObjectURL(file);
            this.playlist.push({
                name: file.name,
                url: url,
                size: file.size,
                type: file.type
            });
        });

        if (videoFiles.length > 0 && !this.video.src) {
            this.currentIndex = this.playlist.length - videoFiles.length;
            this.loadVideo(this.playlist[this.currentIndex]);
        }

        this.saveRecentFiles();
    }

    isVideoFile(file) {
        const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/mkv'];
        return videoTypes.some(type => file.type.includes(type.split('/')[1]));
    }

    loadVideo(videoData) {
        this.showLoading();
        this.video.src = videoData.url;
        this.video.load();
        
        // Update document title
        document.title = `Advanced Video Player - ${videoData.name}`;
    }

    // UI Controls
    showControls() {
        this.controls.classList.add('show');
        clearTimeout(this.controlsTimeout);
    }

    hideControlsAfterDelay() {
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = setTimeout(() => {
            if (!this.video.paused) {
                this.controls.classList.remove('show');
            }
        }, 3000);
    }

    showLoading() {
        this.loadingIndicator.classList.add('show');
    }

    hideLoading() {
        this.loadingIndicator.classList.remove('show');
    }

    onVideoError(e) {
        this.hideLoading();
        console.error('Video error:', e);
        // You could show an error message to the user here
    }

    // Settings Management
    loadSettings() {
        const defaultSettings = {
            volume: 0.5,
            playbackSpeed: 1,
            autoplay: false,
            gestureControls: true
        };

        try {
            const saved = localStorage.getItem('videoPlayerSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('videoPlayerSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    applySettings() {
        this.setVolume(this.settings.volume);
        this.setPlaybackSpeed(this.settings.playbackSpeed);
        
        // Apply other settings
        const autoplayToggle = document.getElementById('autoplayToggle');
        if (autoplayToggle) {
            autoplayToggle.checked = this.settings.autoplay;
        }
        
        const gestureToggle = document.getElementById('gestureControls');
        if (gestureToggle) {
            gestureToggle.checked = this.settings.gestureControls;
        }
    }

    saveRecentFiles() {
        try {
            const recentFiles = this.playlist.slice(-10).map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            }));
            localStorage.setItem('recentVideoFiles', JSON.stringify(recentFiles));
        } catch (e) {
            console.error('Failed to save recent files:', e);
        }
    }

    // Utility Methods
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoPlayer = new VideoPlayer();
});