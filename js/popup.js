// Popup Script
class PopupController {
    constructor() {
        this.recentFilesList = document.getElementById('recentFilesList');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRecentFiles();
    }

    setupEventListeners() {
        // Open player button
        document.getElementById('openPlayer').addEventListener('click', () => {
            this.openPlayer();
        });

        // Open in new window button
        document.getElementById('openInNewWindow').addEventListener('click', () => {
            this.openInNewWindow();
        });

        // Settings button
        document.getElementById('openSettings').addEventListener('click', () => {
            this.openSettings();
        });
    }

    async openPlayer() {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Inject content script to show player overlay
            await chrome.tabs.sendMessage(tab.id, { action: 'showPlayer' });
            
            // Close popup
            window.close();
        } catch (error) {
            console.error('Error opening player:', error);
            // Fallback: open in new tab
            this.openInNewTab();
        }
    }

    async openInNewWindow() {
        try {
            const playerUrl = chrome.runtime.getURL('player.html');
            await chrome.windows.create({
                url: playerUrl,
                type: 'popup',
                width: 1200,
                height: 800,
                focused: true
            });
            window.close();
        } catch (error) {
            console.error('Error opening new window:', error);
        }
    }

    async openInNewTab() {
        try {
            const playerUrl = chrome.runtime.getURL('player.html');
            await chrome.tabs.create({ url: playerUrl });
            window.close();
        } catch (error) {
            console.error('Error opening new tab:', error);
        }
    }

    openSettings() {
        // Open player with settings panel open
        this.openPlayer().then(() => {
            // Send message to open settings
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'openSettings' });
            });
        });
    }

    loadRecentFiles() {
        try {
            const recentFiles = JSON.parse(localStorage.getItem('recentVideoFiles') || '[]');
            
            if (recentFiles.length === 0) {
                this.showNoFiles();
                return;
            }

            this.recentFilesList.innerHTML = '';
            
            recentFiles.slice(-5).reverse().forEach((file, index) => {
                const fileItem = this.createFileItem(file, index);
                this.recentFilesList.appendChild(fileItem);
            });
        } catch (error) {
            console.error('Error loading recent files:', error);
            this.showNoFiles();
        }
    }

    createFileItem(file, index) {
        const item = document.createElement('div');
        item.className = 'file-item';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        fileName.title = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = this.formatFileSize(file.size);
        
        item.appendChild(fileName);
        item.appendChild(fileSize);
        
        item.addEventListener('click', () => {
            this.openPlayerWithFile(file);
        });
        
        return item;
    }

    showNoFiles() {
        this.recentFilesList.innerHTML = '<p class="no-files">No recent files</p>';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    async openPlayerWithFile(file) {
        try {
            // Store file info for player to access
            await chrome.storage.local.set({ 
                pendingFile: file,
                openPlayerWithFile: true 
            });
            
            // Open player
            await this.openPlayer();
        } catch (error) {
            console.error('Error opening player with file:', error);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});