# Advanced Video Player - Edge Extension

A powerful video player extension for Microsoft Edge with gesture controls, YouTube-like features, and advanced playback options.

## Features

### 🎮 Gesture Controls
- **Left side vertical gestures**: Brightness control (50% to 200%)
- **Right side vertical gesures**: Volume control (0% to 100%)
- **Visual feedback**: Real-time indicators showing current levels
- **Touch and mouse support**: Works on both desktop and touch devices

### 🎵 Media Controls
- **Play/Pause**: Space bar or click video
- **Previous/Next**: Navigate through playlist
- **Volume control**: Mouse wheel, arrow keys, or gesture
- **Mute/Unmute**: M key or button click
- **Seek bar**: Click to jump, drag to scrub with real-time preview

### ⚡ YouTube-like Features
- **Keyboard shortcuts**: Full set of YouTube-compatible hotkeys
- **Speed control**: 0.25x to 2x playback speeds
- **Fullscreen support**: F key or button
- **Progress preview**: Hover seek bar for time preview
- **Auto-hide controls**: Clean viewing experience

### 📁 File Management
- **Multiple file support**: Add individual files or entire folders
- **Playlist navigation**: Previous/next buttons for multiple videos
- **Recent files**: Quick access to recently played videos
- **Drag & drop**: Easy file loading (planned feature)

### ⚙️ Settings & Customization
- **Autoplay**: Automatically play next video in playlist
- **Default volume**: Set preferred volume level
- **Playback speed**: Set default playback rate
- **Subtitle support**: Load .vtt and .srt subtitle files
- **Gesture controls**: Enable/disable gesture functionality

### 🖥️ Window Options
- **Popup overlay**: Play videos over current webpage
- **New window**: Dedicated player window
- **Fullscreen mode**: Immersive viewing experience

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `←` / `J` | Seek backward 10s |
| `→` / `L` | Seek forward 10s |
| `Shift + ←` | Seek backward 30s |
| `Shift + →` | Seek forward 30s |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Mute/Unmute |
| `F` | Toggle fullscreen |
| `C` | Toggle subtitles |
| `Shift + P` | Previous video |
| `Shift + N` | Next video |
| `0-9` | Seek to percentage (0% to 90%) |
| `,` | Previous frame |
| `.` | Next frame |
| `<` | Decrease speed |
| `>` | Increase speed |
| `R` | Reset speed to 1x |
| `Home` | Seek to beginning |
| `End` | Seek to end |
| `Ctrl + O` | Open file dialog |
| `?` | Show keyboard shortcuts |
| `Esc` | Close modals/exit fullscreen |

## Installation

1. **Download the extension files** to a local folder
2. **Open Microsoft Edge** and navigate to `edge://extensions/`
3. **Enable Developer mode** (toggle in the left sidebar)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

## Usage

### Opening the Player
- **Click the extension icon** in the toolbar
- **Choose "Open Video Player"** for overlay mode
- **Choose "Open in New Window"** for dedicated window

### Loading Videos
- **Click the "+" button** in the player to add files
- **Use Ctrl+O** keyboard shortcut
- **Right-click video links** and select "Open with Advanced Video Player"

### Gesture Controls
1. **Brightness**: Move mouse/finger up/down on the left side of the video
2. **Volume**: Move mouse/finger up/down on the right side of the video
3. **Visual feedback** shows current levels during adjustment

### Settings
- **Click the gear icon** to open settings panel
- **Adjust preferences** for autoplay, speed, volume, etc.
- **Load subtitle files** using the file input
- **Reset to defaults** if needed

## File Structure

```
advanced-video-player/
├── manifest.json              # Extension manifest
├── popup.html                 # Extension popup interface
├── player.html                # Main video player
├── content.js                 # Content script for webpage integration
├── background.js              # Background service worker
├── styles/
│   ├── popup.css             # Popup styling
│   ├── player.css            # Main player styling
│   └── content.css           # Content script styling
├── js/
│   ├── popup.js              # Popup functionality
│   ├── player.js             # Main player controller
│   ├── gestures.js           # Gesture control system
│   ├── keyboard.js           # Keyboard shortcuts
│   └── settings.js           # Settings management
├── icons/
│   ├── icon16.png            # 16x16 icon
│   ├── icon32.png            # 32x32 icon
│   ├── icon48.png            # 48x48 icon
│   └── icon128.png           # 128x128 icon
└── README.md                 # This file
```

## Supported Video Formats

- **MP4** (.mp4)
- **WebM** (.webm)
- **OGG** (.ogg)
- **AVI** (.avi)
- **MOV** (.mov)
- **MKV** (.mkv)

## Supported Subtitle Formats

- **WebVTT** (.vtt)
- **SubRip** (.srt) - automatically converted to VTT

## Browser Compatibility

- **Microsoft Edge** (Chromium-based)
- **Google Chrome** (with minor manifest adjustments)
- **Other Chromium browsers** (Opera, Brave, etc.)

## Development

### Prerequisites
- Basic knowledge of HTML, CSS, and JavaScript
- Microsoft Edge or Chrome for testing
- Text editor or IDE

### Customization
- **Modify styles** in the `styles/` directory
- **Add features** by extending the JavaScript classes
- **Update shortcuts** in `js/keyboard.js`
- **Customize gestures** in `js/gestures.js`

### Building Icons
If you have Python and Pillow installed:
```bash
cd icons
python3 create_icons.py
```

## Troubleshooting

### Player Won't Open
- Ensure the extension is enabled in Edge
- Check that content scripts are allowed on the current page
- Try opening in a new window instead of overlay mode

### Videos Won't Play
- Verify the video format is supported
- Check browser console for error messages
- Ensure the video file isn't corrupted

### Gestures Not Working
- Enable gesture controls in settings
- Make sure you're dragging in the correct areas (left for brightness, right for volume)
- Check that the gesture overlay isn't blocked by other elements

### Keyboard Shortcuts Not Working
- Click on the video player to ensure it has focus
- Check that you're not typing in an input field
- Verify the shortcuts in the help panel (press `?`)

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by YouTube's video player interface
- Gesture controls inspired by mobile video players
- Icons and UI elements follow modern design principles

---

**Note**: This extension is designed for local video playback and does not stream or download videos from external sources. Always ensure you have the right to play any video content you load into the player.