import { formatTime, clamp } from './utils.js';

export class Controls {
  constructor(video, timelineEl, previewEl, canvasEl, timeEl) {
    this.video = video;
    this.timelineEl = timelineEl;
    this.previewEl = previewEl;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.timeEl = timeEl;
    this.dragging = false;
    this.bound = this.timelineEl.getBoundingClientRect();

    const updateBound = () => { this.bound = this.timelineEl.getBoundingClientRect(); };
    const ro = new ResizeObserver(updateBound);
    ro.observe(this.timelineEl);

    this.timelineEl.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());

    video.addEventListener('timeupdate', () => this.renderProgress());
    video.addEventListener('durationchange', () => this.renderProgress());
  }

  getPercentFromEvent(e) {
    const x = clamp(e.clientX - this.bound.left, 0, this.bound.width);
    return this.bound.width === 0 ? 0 : x / this.bound.width;
  }

  seekToPercent(p) {
    const targetTime = clamp(p, 0, 1) * (this.video.duration || 0);
    if (Number.isFinite(targetTime)) this.video.currentTime = targetTime;
  }

  renderProgress() {
    const p = (this.video.currentTime || 0) / (this.video.duration || 1);
    const progress = clamp(p, 0, 1) * 100;
    const progressEl = this.timelineEl.querySelector('.timeline-progress');
    const thumbEl = this.timelineEl.querySelector('.timeline-thumb');
    progressEl.style.width = `${progress}%`;
    thumbEl.style.left = `${progress}%`;
  }

  async drawPreviewAtPercent(p) {
    if (!Number.isFinite(this.video.duration) || this.video.readyState < 2) return;
    const time = clamp(p, 0, 1) * this.video.duration;
    this.timeEl.textContent = formatTime(time);
    const rect = this.timelineEl.getBoundingClientRect();
    this.previewEl.style.left = `${clamp(p * rect.width, 0, rect.width)}px`;
    this.previewEl.classList.remove('hidden');

    // Draw current video frame into canvas by seeking a hidden video clone if needed
    // For simplicity, we sample current frame (close approximation during drag)
    try {
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    } catch {}
  }

  onPointerDown(e) {
    this.dragging = true;
    this.timelineEl.setPointerCapture(e.pointerId);
    const p = this.getPercentFromEvent(e);
    this.drawPreviewAtPercent(p);
    this.seekToPercent(p);
  }

  onPointerMove(e) {
    if (!this.dragging) return;
    const p = this.getPercentFromEvent(e);
    this.drawPreviewAtPercent(p);
    this.seekToPercent(p);
  }

  onPointerUp() {
    this.dragging = false;
    this.previewEl.classList.add('hidden');
  }
}
