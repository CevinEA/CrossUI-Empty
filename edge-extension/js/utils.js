export function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return '00:00';
  const seconds = Math.max(0, Math.floor(totalSeconds % 60));
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  const two = (n) => (n < 10 ? `0${n}` : `${n}`);
  return hours > 0 ? `${hours}:${two(minutes)}:${two(seconds)}` : `${two(minutes)}:${two(seconds)}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function withPersistentState(key, defaultValue) {
  let current = defaultValue;
  const listeners = new Set();
  chrome.storage.local.get([key], (data) => {
    if (data && data[key] !== undefined) {
      current = data[key];
      for (const fn of listeners) fn(current);
    }
  });
  function set(value) {
    current = value;
    chrome.storage.local.set({ [key]: value });
    for (const fn of listeners) fn(current);
  }
  function subscribe(fn) {
    listeners.add(fn);
    fn(current);
    return () => listeners.delete(fn);
  }
  return { get: () => current, set, subscribe };
}
