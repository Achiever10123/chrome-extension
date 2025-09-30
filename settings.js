document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  const status = document.getElementById('status');

  // Get elements for background settings
  const bgTypeSelect = document.getElementById('bg-type');
  const customBgSection = document.getElementById('custom-bg-section');
  const bgImageUpload = document.getElementById('bg-image-upload');
  const bgImageUrl = document.getElementById('bg-image-url');
  const bgPreview = document.getElementById('bg-preview');

  // Load saved settings
  chrome.storage.sync.get(['userName', 'theme', 'defaultSearch', 'bgType', 'bgImage'], (result) => {
    console.log("Loaded settings:", result); // Debug log
    document.getElementById('user-name').value = result.userName || '';
    document.getElementById('theme').value = result.theme || 'default';
    document.getElementById('default-search').value = result.defaultSearch || 'https://www.google.com/search?q=';
    document.getElementById('bg-type').value = result.bgType || 'default';

    if (result.bgImage) {
        bgPreview.style.backgroundImage = `url(${result.bgImage})`;
    }
    customBgSection.style.display = (document.getElementById('bg-type').value === 'custom') ? 'block' : 'none';
  });

  // Handle background type selection change
  bgTypeSelect.addEventListener('change', () => {
    customBgSection.style.display = (bgTypeSelect.value === 'custom') ? 'block' : 'none';
    if (bgTypeSelect.value !== 'custom') {
        bgPreview.style.backgroundImage = 'none';
        bgImageUpload.value = '';
        bgImageUrl.value = '';
    }
  });

  // Handle custom image upload
  bgImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        bgPreview.style.backgroundImage = `url(${event.target.result})`;
        bgImageUrl.value = ''; // Clear URL if file is selected
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle custom image URL input
  bgImageUrl.addEventListener('input', () => {
    const url = bgImageUrl.value.trim();
    if (url) {
      bgPreview.style.backgroundImage = `url(${url})`;
      bgImageUpload.value = ''; // Clear file if URL is entered
    } else {
      bgPreview.style.backgroundImage = 'none';
    }
  });

  saveBtn.addEventListener('click', () => {
    console.log("Save button clicked!"); // Debug log

    const settings = {
      userName: document.getElementById('user-name').value.trim(),
      theme: document.getElementById('theme').value,
      defaultSearch: document.getElementById('default-search').value,
      bgType: bgTypeSelect.value,
      bgImage: null
    };

    let savePromise = Promise.resolve(); // Start with a resolved promise

    if (settings.bgType === 'custom') {
      if (bgImageUpload.files[0]) {
        // If a file was selected, create a promise for reading it
        savePromise = new Promise((resolve, reject) => {
          const file = bgImageUpload.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            settings.bgImage = event.target.result;
            console.log("File read, bgImage set:", settings.bgImage.substring(0, 50) + "..."); // Debug log
            resolve(); // Resolve the promise when file is read
          };
          reader.onerror = (error) => {
            console.error("Error reading file:", error);
            status.textContent = '❌ Error reading image file.';
            reject(error); // Reject the promise on error
          };
          reader.readAsDataURL(file);
        });
      } else if (bgImageUrl.value.trim()) {
        settings.bgImage = bgImageUrl.value.trim();
        console.log("URL entered, bgImage set:", settings.bgImage); // Debug log
      }
    } else {
        console.log("Not custom bg, bgImage remains null"); // Debug log
    }

    // Chain the save operation to happen after the file reading (if applicable)
    savePromise
      .then(() => {
        console.log("Attempting to save settings:", settings); // Debug log
        return chrome.storage.sync.set(settings); // Return the chrome.storage promise
      })
      .then(() => {
          console.log("Settings saved successfully!"); // Debug log
          status.textContent = '✅ Settings saved!';
          setTimeout(() => status.textContent = '', 2000);
      })
      .catch((error) => {
          console.error("Error saving settings:", error); // Debug log
          status.textContent = '❌ Error saving settings.';
          setTimeout(() => status.textContent = '', 2000);
      });
  });
});