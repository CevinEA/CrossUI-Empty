import { clamp } from './utils.js';

export function bindHotkeys(root, video, actions) {
  root.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.isComposing) return;

    // YouTube-like keys
    switch (e.key.toLowerCase()) {
      case ' ': // Space
      case 'k':
        e.preventDefault();
        actions.togglePlay();
        break;
      case 'j':
        e.preventDefault();
        actions.seekBy(-10);
        break;
      case 'l':
        e.preventDefault();
        actions.seekBy(10);
        break;
      case 'arrowleft':
        actions.seekBy(-5);
        break;
      case 'arrowright':
        actions.seekBy(5);
        break;
      case 'arrowup':
        e.preventDefault();
        video.volume = clamp((video.volume || 0) + 0.05, 0, 1);
        break;
      case 'arrowdown':
        e.preventDefault();
        video.volume = clamp((video.volume || 0) - 0.05, 0, 1);
        break;
      case 'm':
        video.muted = !video.muted;
        break;
      case 'f':
        actions.toggleFullscreen();
        break;
      case 'c':
        actions.toggleCaptions();
        break;
      case 'n':
        if (e.shiftKey) actions.next();
        break;
      case 'p':
        if (e.shiftKey) actions.prev();
        break;
      case ',': // speed down (frame back not supported on HTML video reliably)
        video.playbackRate = clamp((video.playbackRate || 1) - 0.25, 0.25, 4);
        break;
      case '.': // speed up
        video.playbackRate = clamp((video.playbackRate || 1) + 0.25, 0.25, 4);
        break;
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        {
          const n = Number(e.key);
          const p = n / 10;
          if (Number.isFinite(video.duration)) video.currentTime = video.duration * p;
        }
        break;
      default:
        break;
    }
  });
}
