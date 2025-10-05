import { Controls } from './controls.js';
import { PlaylistManager } from './playlist.js';
import { GestureManager } from './gestures.js';
import { bindHotkeys } from './hotkeys.js';
import { SettingsManager } from './settings.js';
import { formatTime } from './utils.js';

const $ = (sel) => document.querySelector(sel);

const video = $('#video');
const timeline = $('#timeline');
const seekPreview = $('#seekPreview');
const seekCanvas = $('#seekCanvas');
const seekTime = $('#seekTime');
const playlistEl = $('#playlist');
const settingsPanel = $('#settingsPanel');
const brightnessOverlay = $('#brightnessOverlay');
const hud = $('#hud');
const hudIcon = $('#hudIcon');
const hudText = $('#hudText');

const prevBtn = $('#prevBtn');
const playPauseBtn = $('#playPauseBtn');
const nextBtn = $('#nextBtn');
const fullscreenBtn = $('#fullscreenBtn');
const addBtn = $('#addBtn');
const fileInput = $('#fileInput');
const folderInput = $('#folderInput');
const settingsBtn = $('#settingsBtn');
const subtitleInput = $('#subtitleInput');
const subtitleTrack = $('#subtitleTrack');
const dropOverlay = $('#dropOverlay');
const gestureLayer = $('#gestureLayer');

const controls = new Controls(video, timeline, seekPreview, seekCanvas, seekTime);
const playlist = new PlaylistManager(playlistEl);
const settings = new SettingsManager(settingsPanel);
const gestures = new GestureManager(gestureLayer, video, { hud, hudIcon, hudText, brightnessOverlay });

function togglePlay() {
  if (video.paused) { video.play(); playPauseBtn.textContent = '⏸'; }
  else { video.pause(); playPauseBtn.textContent = '▶'; }
}

function updatePlayBtn() {
  playPauseBtn.textContent = video.paused ? '▶' : '⏸';
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

function toggleCaptions() {
  if (!subtitleTrack) return;
  const track = subtitleTrack.track;
  if (!track) return;
  track.mode = track.mode === 'showing' ? 'disabled' : 'showing';
}

function seekBy(sec) {
  if (!Number.isFinite(video.duration)) return;
  video.currentTime = Math.max(0, Math.min(video.duration, (video.currentTime || 0) + sec));
}

bindHotkeys(document, video, { togglePlay, toggleFullscreen, toggleCaptions, seekBy, next: () => playlist.next(), prev: () => playlist.prev() });

playPauseBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => playlist.prev());
nextBtn.addEventListener('click', () => playlist.next());
fullscreenBtn.addEventListener('click', toggleFullscreen);
settingsBtn.addEventListener('click', () => settings.toggle());

video.addEventListener('play', updatePlayBtn);
video.addEventListener('pause', updatePlayBtn);
video.addEventListener('timeupdate', () => {
  // update buffer bar
  const bufferEl = timeline.querySelector('.timeline-buffer');
  try {
    if (video.buffered.length) {
      const end = video.buffered.end(video.buffered.length - 1);
      const percent = (end / (video.duration || 1)) * 100;
      bufferEl.style.width = `${percent}%`;
    }
  } catch {}
});

playlist.onChange = (item) => {
  settingsPanel.classList.add('hidden');
  video.src = item.url;
  chrome.storage.local.get(['speed'], (data) => {
    const rate = data && data.speed ? Number(data.speed) : (Number(localStorage.getItem('speed')) || 1);
    if (Number.isFinite(rate)) video.playbackRate = rate;
    video.play().catch(() => {});
  });
};

// add files/folder
addBtn.addEventListener('click', () => {
  const menu = document.createElement('div');
  Object.assign(menu.style, { position: 'absolute', bottom: '56px', right: '56px', background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px' });
  menu.innerHTML = `<button id="chooseFiles" class="btn">Choose files</button> <button id="chooseFolder" class="btn">Choose folder</button>`;
  document.body.appendChild(menu);
  const remove = () => menu.remove();
  setTimeout(() => document.addEventListener('click', remove, { once: true }));
  menu.querySelector('#chooseFiles').addEventListener('click', () => fileInput.click());
  menu.querySelector('#chooseFolder').addEventListener('click', () => folderInput.click());
});

fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files && files.length) playlist.addFiles(files);
  fileInput.value = '';
});

folderInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files && files.length) playlist.addFileSystemEntries(files);
  folderInput.value = '';
});

subtitleInput?.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'vtt') {
    alert('Only .vtt is supported in this demo.');
    return;
  }
  const url = URL.createObjectURL(file);
  subtitleTrack.setAttribute('src', url);
  subtitleTrack.track.mode = 'showing';
});

// Drag & drop
window.addEventListener('dragover', (e) => { e.preventDefault(); dropOverlay.classList.remove('hidden'); });
window.addEventListener('dragleave', (e) => { if (e.target === document || e.clientX <= 0 || e.clientY <= 0) dropOverlay.classList.add('hidden'); });
window.addEventListener('drop', (e) => {
  e.preventDefault();
  dropOverlay.classList.add('hidden');
  if (e.dataTransfer && e.dataTransfer.files) playlist.addFiles(e.dataTransfer.files);
});

// Autoplay-next behavior
video.addEventListener('ended', () => {
  chrome.storage.local.get(['autoplay'], (data) => {
    if (data.autoplay) playlist.next();
  });
});

// Keep speed synced to settings
chrome.storage.local.get(['speed'], (data) => {
  if (data.speed) video.playbackRate = data.speed;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.speed) video.playbackRate = changes.speed.newValue;
});

// initial UI
updatePlayBtn();
