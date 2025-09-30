document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  const status = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['userName', 'theme', 'defaultSearch'], (result) => {
    document.getElementById('user-name').value = result.userName || '';
    document.getElementById('theme').value = result.theme || 'default';
    document.getElementById('default-search').value = result.defaultSearch || 'https://www.google.com/search?q=';
  });

  saveBtn.addEventListener('click', () => {
    const settings = {
      userName: document.getElementById('user-name').value.trim(),
      theme: document.getElementById('theme').value,
      defaultSearch: document.getElementById('default-search').value
    };

    chrome.storage.sync.set(settings, () => {
      status.textContent = '✅ Settings saved!';
      setTimeout(() => status.textContent = '', 2000);
    });
  });
});