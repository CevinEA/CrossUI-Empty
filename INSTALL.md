# Installation Guide - Advanced Video Player Extension

## Quick Start

### 1. Download the Extension
- Download all files from this repository
- Keep the folder structure intact

### 2. Install in Microsoft Edge

1. **Open Microsoft Edge**
2. **Navigate to Extensions**:
   - Type `edge://extensions/` in the address bar, OR
   - Click the three dots menu → Extensions
3. **Enable Developer Mode**:
   - Toggle "Developer mode" in the left sidebar
4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the folder containing `manifest.json`
   - The extension should appear in your extensions list

### 3. Pin the Extension (Optional)
- Click the puzzle piece icon in the toolbar
- Find "Advanced Video Player" and click the pin icon
- The extension icon will now appear in your toolbar

## First Use

### Opening the Player
1. **Click the extension icon** in your toolbar
2. **Choose an option**:
   - "Open Video Player" - Opens as overlay on current page
   - "Open in New Window" - Opens in dedicated popup window

### Loading Your First Video
1. **Click the "+" button** in the bottom right of the player
2. **Select video files** from your computer
3. **The video will start loading** automatically
4. **Use controls** or keyboard shortcuts to play

### Testing Gesture Controls
1. **Load a video** and start playing
2. **Move your mouse up/down** on the left side of the video (brightness)
3. **Move your mouse up/down** on the right side of the video (volume)
4. **Watch for visual feedback** showing the current levels

## Keyboard Shortcuts Quick Test

Once you have a video loaded, try these shortcuts:
- `Space` - Play/Pause
- `←` `→` - Seek backward/forward
- `↑` `↓` - Volume up/down
- `F` - Fullscreen
- `?` - Show all shortcuts

## Troubleshooting Installation

### Extension Won't Load
- **Check file structure**: Make sure `manifest.json` is in the root folder
- **Verify permissions**: Ensure you have permission to read the files
- **Check Edge version**: Make sure you're using a recent version of Edge

### "Manifest is not valid" Error
- **Check manifest.json**: Ensure the file isn't corrupted
- **Verify syntax**: The JSON should be properly formatted
- **Check file paths**: All referenced files should exist

### Extension Loads but Won't Work
- **Refresh the extensions page**: Try disabling and re-enabling
- **Check permissions**: The extension needs storage and activeTab permissions
- **Clear browser cache**: Sometimes helps with loading issues

### Content Script Issues
- **Reload the page**: Content scripts inject when pages load
- **Check page URL**: Some pages block content scripts
- **Try different sites**: Test on multiple websites

## File Structure Verification

Your folder should look like this:
```
advanced-video-player/
├── manifest.json          ✓ Required
├── popup.html             ✓ Required
├── player.html            ✓ Required
├── content.js             ✓ Required
├── background.js          ✓ Required
├── styles/
│   ├── popup.css          ✓ Required
│   ├── player.css         ✓ Required
│   └── content.css        ✓ Required
├── js/
│   ├── popup.js           ✓ Required
│   ├── player.js          ✓ Required
│   ├── gestures.js        ✓ Required
│   ├── keyboard.js        ✓ Required
│   └── settings.js        ✓ Required
├── icons/
│   ├── icon16.png         ✓ Required
│   ├── icon32.png         ✓ Required
│   ├── icon48.png         ✓ Required
│   └── icon128.png        ✓ Required
└── README.md              ℹ Optional
```

## Advanced Installation Options

### For Developers
1. **Clone/download** the repository
2. **Make modifications** as needed
3. **Test changes** by reloading the extension
4. **Use Developer Tools** for debugging

### For Chrome Users
1. **Modify manifest.json**:
   - Change `"manifest_version": 3` to `"manifest_version": 2` (if needed)
   - Update permissions format if required
2. **Follow similar steps** in Chrome's extension management

### Corporate/Managed Environments
- **Check policies**: Some organizations block extension installation
- **Request permissions**: You may need IT approval
- **Use alternative**: Try the new window mode if overlay is blocked

## Getting Help

If you encounter issues:

1. **Check the console**: Press F12 and look for error messages
2. **Verify file permissions**: Make sure all files are readable
3. **Test in incognito**: Rules out other extension conflicts
4. **Update browser**: Ensure you're using a recent version
5. **Check README.md**: Contains detailed usage information

## Next Steps

Once installed:
- **Read the README.md** for detailed feature information
- **Try all keyboard shortcuts** to learn efficient navigation
- **Experiment with settings** to customize your experience
- **Load different video formats** to test compatibility

---

**Tip**: Keep the extension folder in a permanent location. If you move or delete it, the extension will stop working and need to be reinstalled.