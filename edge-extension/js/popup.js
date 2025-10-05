async function openPlayerIn(type) {
  const url = chrome.runtime.getURL('player.html');
  if (type === 'popup') {
    await chrome.windows.create({ url, type: 'popup', width: 1100, height: 700 });
  } else {
    await chrome.tabs.create({ url });
  }
}

document.getElementById('openTabBtn')?.addEventListener('click', () => openPlayerIn('tab'));
document.getElementById('openPopupBtn')?.addEventListener('click', () => openPlayerIn('popup'));
