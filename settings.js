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
      // Check file size (e.g., warn if > 500KB, as data URL will be > 650KB)
      const maxSizeInBytes = 500 * 1024; // 500 KB
      if (file.size > maxSizeInBytes) {
          status.textContent = `⚠️ File size is ${Math.round(file.size / 1024)}KB. It might be too large and cause saving errors. Try a smaller image.`;
          console.warn("Selected file is large:", Math.round(file.size / 1024), "KB");
          // Optionally clear the input
          // e.target.value = '';
          // return;
      } else {
          status.textContent = ''; // Clear any previous warnings/messages
      }

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
        const file = bgImageUpload.files[0];
        const fileSizeInBytes = file.size;
        const maxSizeInBytesForDataURL = 6 * 1024; // Conservative limit for data URL item size

        if (fileSizeInBytes > maxSizeInBytesForDataURL) {
            status.textContent = `❌ Error: Selected file (${Math.round(fileSizeInBytes / 1024)}KB) is too large to save. Please choose a smaller image (under ~${maxSizeInBytesForDataURL / 1024}KB).`;
            console.error("File size exceeds limit for chrome.storage.sync data URL:", fileSizeInBytes, "bytes");
            return; // Stop execution if file is too large
        }

        // If file is small enough, create a promise for reading it
        savePromise = new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            settings.bgImage = event.target.result;
            console.log("File read, bgImage set (length):", settings.bgImage.length); // Debug log - length of data URL
            if (settings.bgImage.length > 8192) { // Check length of resulting data URL string
                status.textContent = '❌ Error: Image data is too large to save.';
                console.error("Data URL length exceeds 8KB limit:", settings.bgImage.length);
                reject(new Error("Data URL too large"));
                return;
            }
            resolve(); // Resolve the promise when file is read and validated
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
        console.log("Attempting to save settings:", Object.keys(settings).reduce((obj, key) => { // Debug log - only key names and lengths/types for bgImage
            if (key === 'bgImage') {
                obj[key] = settings[key] ? (typeof settings[key] === 'string' ? `String (${settings[key].length} chars)` : 'Object/Array') : 'null';
            } else {
                obj[key] = settings[key];
            }
            return obj;
        }, {})); // Log settings object keys and a summary of bgImage
        return chrome.storage.sync.set(settings); // Return the chrome.storage promise
      })
      .then(() => {
          console.log("Settings saved successfully!"); // Debug log
          status.textContent = '✅ Settings saved!';
          setTimeout(() => status.textContent = '', 2000);
      })
      .catch((error) => {
          console.error("Error saving settings:", error); // Debug log
          // Provide a more specific error message if it's the size issue
          if (error && error.message && error.message.includes("QUOTA_BYTES")) {
              status.textContent = '❌ Error: Storage quota exceeded. Please remove some data or use a smaller background image.';
          } else if (error && error.message && error.message.includes("Data URL too large")) {
              // Message already set before reject
          } else {
              status.textContent = '❌ Error saving settings. Check console for details.';
          }
          setTimeout(() => status.textContent = '', 3000); // Slightly longer for error
      });
  });
});