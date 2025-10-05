import { clamp } from './utils.js';

export class GestureManager {
  constructor(rootEl, video, overlays) {
    this.rootEl = rootEl; // gesture layer
    this.video = video;
    this.hud = overlays.hud;
    this.hudIcon = overlays.hudIcon;
    this.hudText = overlays.hudText;
    this.brightnessOverlay = overlays.brightnessOverlay;

    this.startX = 0; this.startY = 0;
    this.lastX = 0; this.lastY = 0;
    this.gesture = null; // 'seek' | 'volume' | 'brightness'

    rootEl.addEventListener('pointerdown', (e) => this.onDown(e));
    rootEl.addEventListener('pointermove', (e) => this.onMove(e));
    rootEl.addEventListener('pointerup', () => this.onUp());
  }

  showHud(icon, text) {
    this.hudIcon.textContent = icon;
    this.hudText.textContent = text;
    this.hud.classList.remove('hidden');
    clearTimeout(this.hudTimer);
    this.hudTimer = setTimeout(() => this.hud.classList.add('hidden'), 800);
  }

  onDown(e) {
    this.startX = this.lastX = e.clientX;
    this.startY = this.lastY = e.clientY;
    this.gesture = null;
  }

  onMove(e) {
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const width = this.rootEl.clientWidth;
    const height = this.rootEl.clientHeight;
    const leftZone = e.clientX < (width / 2);

    if (!this.gesture) {
      if (absX > 20 && absX > absY) this.gesture = 'seek';
      else if (absY > 20) this.gesture = leftZone ? 'brightness' : 'volume';
      else return;
    }

    if (this.gesture === 'seek') {
      const deltaSeconds = dx / width * 120; // up to ±120s across width
      const target = clamp((this.video.currentTime || 0) + deltaSeconds, 0, this.video.duration || 0);
      this.video.currentTime = target;
      const sign = deltaSeconds >= 0 ? '+' : '−';
      this.showHud('⇆', `${sign}${Math.abs(deltaSeconds)|0}s`);
    } else if (this.gesture === 'volume') {
      // volume adjust by vertical swipe on right
      const delta = -dy / height; // swipe up increases
      const vol = clamp((this.video.volume || 0) + delta, 0, 1);
      this.video.volume = vol;
      this.showHud('🔊', `${Math.round(vol * 100)}%`);
    } else if (this.gesture === 'brightness') {
      // brightness simulated via overlay opacity (0 = bright, 0.8 = dim)
      const delta = dy / height; // swipe down increases overlay (dimmer)
      const opacity = clamp((this.brightnessOverlay.style.opacity ? parseFloat(this.brightnessOverlay.style.opacity) : 0) + delta, 0, 0.8);
      this.brightnessOverlay.style.opacity = String(opacity);
      this.showHud('🔆', `${Math.round((1 - opacity / 0.8) * 100)}%`);
    }

    this.lastX = e.clientX; this.lastY = e.clientY;
  }

  onUp() {
    this.gesture = null;
  }
}
