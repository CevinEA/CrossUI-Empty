import { withPersistentState } from './utils.js';

export class SettingsManager {
  constructor(panelEl) {
    this.panelEl = panelEl;
    this.visible = false;

    this.autoplayState = withPersistentState('autoplay', false);
    this.speedState = withPersistentState('speed', 1);

    const autoplayToggle = panelEl.querySelector('#autoplayToggle');
    const speedSelect = panelEl.querySelector('#speedSelect');

    // hydrate
    this.autoplayState.subscribe((v) => { if (autoplayToggle) autoplayToggle.checked = !!v; });
    this.speedState.subscribe((v) => { if (speedSelect) speedSelect.value = String(v); });

    autoplayToggle?.addEventListener('change', () => this.autoplayState.set(autoplayToggle.checked));
    speedSelect?.addEventListener('change', () => this.speedState.set(parseFloat(speedSelect.value)));
  }

  toggle() {
    this.visible = !this.visible;
    this.panelEl.classList.toggle('hidden', !this.visible);
  }
}
