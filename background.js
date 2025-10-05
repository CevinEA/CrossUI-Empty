// Background Service Worker
class BackgroundService {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstall(details);
        });

        // Handle extension startup
        chrome.runtime.onStartup.addListener(() => {
            this.handleStartup();
        });

        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Handle tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });

        // Handle keyboard shortcuts
        chrome.commands.onCommand.addListener((command) => {
            this.handleCommand(command);
        });
    }

    handleInstall(details) {
        console.log('Extension installed:', details);
        
        if (details.reason === 'install') {
            // First time installation
            this.setupDefaultSettings();
            this.createContextMenus();
        } else if (details.reason === 'update') {
            // Extension updated
            this.handleUpdate(details);
        }
    }

    handleStartup() {
        console.log('Extension started');
        this.createContextMenus();
    }

    setupDefaultSettings() {
        const defaultSettings = {
            volume: 0.5,
            playbackSpeed: 1,
            autoplay: false,
            gestureControls: true,
            theme: 'dark'
        };

        chrome.storage.sync.set({ settings: defaultSettings }, () => {
            console.log('Default settings saved');
        });
    }

    createContextMenus() {
        // Remove existing context menus
        chrome.contextMenus.removeAll(() => {
            // Create new context menus
            chrome.contextMenus.create({
                id: 'openVideoPlayer',
                title: 'Open with Advanced Video Player',
                contexts: ['link', 'video'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });

            chrome.contextMenus.create({
                id: 'openVideoPlayerNewWindow',
                title: 'Open in New Window',
                contexts: ['link', 'video'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });
        });
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'openPlayer':
                this.openPlayer(message.data, sendResponse);
                break;
            case 'openPlayerNewWindow':
                this.openPlayerNewWindow(message.data, sendResponse);
                break;
            case 'getSettings':
                this.getSettings(sendResponse);
                break;
            case 'saveSettings':
                this.saveSettings(message.data, sendResponse);
                break;
            case 'downloadVideo':
                this.downloadVideo(message.data, sendResponse);
                break;
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        // Inject content script when tab is ready
        if (changeInfo.status === 'complete' && tab.url && 
            (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
            
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).catch(err => {
                // Ignore errors for tabs where we can't inject scripts
                console.log('Could not inject content script:', err);
            });
        }
    }

    handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'openVideoPlayer':
                this.openPlayerFromContext(info, tab);
                break;
            case 'openVideoPlayerNewWindow':
                this.openPlayerNewWindowFromContext(info, tab);
                break;
        }
    }

    handleCommand(command) {
        switch (command) {
            case 'toggle-player':
                this.togglePlayer();
                break;
            case 'open-player-new-window':
                this.openPlayerNewWindow();
                break;
        }
    }

    async openPlayer(data, sendResponse) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.tabs.sendMessage(tab.id, { 
                action: 'showPlayer',
                data: data 
            });
            
            sendResponse({ success: true });
        } catch (error) {
            console.error('Error opening player:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async openPlayerNewWindow(data, sendResponse) {
        try {
            const playerUrl = chrome.runtime.getURL('player.html');
            
            const window = await chrome.windows.create({
                url: playerUrl,
                type: 'popup',
                width: 1200,
                height: 800,
                focused: true
            });

            // Store data for the new window if provided
            if (data) {
                await chrome.storage.local.set({ 
                    [`playerData_${window.id}`]: data 
                });
            }
            
            if (sendResponse) {
                sendResponse({ success: true, windowId: window.id });
            }
        } catch (error) {
            console.error('Error opening new window:', error);
            if (sendResponse) {
                sendResponse({ success: false, error: error.message });
            }
        }
    }

    async openPlayerFromContext(info, tab) {
        const videoUrl = info.linkUrl || info.srcUrl;
        
        if (videoUrl) {
            await this.openPlayer({ videoUrl: videoUrl });
        } else {
            await this.openPlayer();
        }
    }

    async openPlayerNewWindowFromContext(info, tab) {
        const videoUrl = info.linkUrl || info.srcUrl;
        
        if (videoUrl) {
            await this.openPlayerNewWindow({ videoUrl: videoUrl });
        } else {
            await this.openPlayerNewWindow();
        }
    }

    async togglePlayer() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Check if player is already open
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'togglePlayer' 
            });
            
            if (!response.success) {
                // Player not open, show it
                await this.openPlayer();
            }
        } catch (error) {
            // Content script not available, open in new window
            await this.openPlayerNewWindow();
        }
    }

    getSettings(sendResponse) {
        chrome.storage.sync.get(['settings'], (result) => {
            sendResponse({ 
                success: true, 
                settings: result.settings || {} 
            });
        });
    }

    saveSettings(settings, sendResponse) {
        chrome.storage.sync.set({ settings: settings }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({ 
                    success: false, 
                    error: chrome.runtime.lastError.message 
                });
            } else {
                sendResponse({ success: true });
            }
        });
    }

    downloadVideo(data, sendResponse) {
        // This would implement video download functionality
        // For now, just return success
        sendResponse({ success: true, message: 'Download feature not implemented yet' });
    }

    handleUpdate(details) {
        console.log('Extension updated from version', details.previousVersion, 'to', chrome.runtime.getManifest().version);
        
        // Handle any migration logic here
        this.createContextMenus();
    }
}

// Initialize background service
new BackgroundService();