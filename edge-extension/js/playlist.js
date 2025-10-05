import { clamp } from './utils.js';

export class PlaylistManager {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.items = [];
    this.currentIndex = -1;
    this.onChange = null;
    containerEl.addEventListener('click', (e) => {
      const itemEl = e.target.closest('[data-index]');
      if (!itemEl) return;
      const index = Number(itemEl.getAttribute('data-index'));
      this.play(index);
    });
  }

  async addFiles(fileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('video/'));
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    for (const file of files) {
      const url = URL.createObjectURL(file);
      this.items.push({ url, name: file.name, file });
    }
    this.render();
    if (this.currentIndex === -1 && this.items.length > 0) this.play(0);
  }

  async addFileSystemEntries(entries) {
    // For directory selection via webkitdirectory input
    return this.addFiles(entries);
  }

  play(index) {
    this.currentIndex = clamp(index, 0, this.items.length - 1);
    this.render();
    if (this.onChange) this.onChange(this.items[this.currentIndex], this.currentIndex);
  }

  next() {
    if (this.items.length === 0) return;
    this.play((this.currentIndex + 1) % this.items.length);
  }

  prev() {
    if (this.items.length === 0) return;
    this.play((this.currentIndex - 1 + this.items.length) % this.items.length);
  }

  getCurrent() {
    return this.items[this.currentIndex] || null;
  }

  render() {
    const { items, currentIndex } = this;
    this.containerEl.innerHTML = items
      .map((item, i) => `<div class="playlist-item ${i===currentIndex?'active':''}" data-index="${i}">${item.name}</div>`) 
      .join('');
  }
}
