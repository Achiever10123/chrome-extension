document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const greetingEl = document.getElementById("greeting-text");
  const clockEl = document.getElementById("clock");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchEngineSelect = document.getElementById("search-engine");
  const shortcutList = document.getElementById("shortcut-list");
  const addShortcutForm = document.getElementById("add-shortcut-form");
  const shortcutNameInput = document.getElementById("shortcut-name");
  const shortcutUrlInput = document.getElementById("shortcut-url");
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");
  // Error message elements
  const searchError = document.getElementById("search-error");
  const shortcutError = document.getElementById("shortcut-error");
  const todoError = document.getElementById("todo-error");
chrome.storage.sync.get(["userName", "defaultSearch"], (settings) => {
    const defaultSearch =
      settings.defaultSearch || "https://www.google.com/search?q=";
    searchEngineSelect.value = defaultSearch;
  });

  document.getElementById("settings-btn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Clear errors on input
  const clearError = (el) => () => {
    el.textContent = "";
  };
  searchInput.addEventListener("input", clearError(searchError));
  shortcutNameInput.addEventListener("input", clearError(shortcutError));
  shortcutUrlInput.addEventListener("input", clearError(shortcutError));
  todoInput.addEventListener("input", clearError(todoError));

  // Load settings and initialize
  chrome.storage.sync.get(["userName", "defaultSearch"], (settings) => {
    const userName = settings.userName || "Silent";
    const defaultSearch =
      settings.defaultSearch || "https://www.google.com/search?q=";
    searchEngineSelect.value = defaultSearch;

    // Clock & Greeting updater
    const updateClockAndGreeting = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;

      let greeting;
      if (hours >= 5 && hours < 12) {
        greeting = `Good morning ${userName}`;
      } else if (hours >= 12 && hours < 18) {
        greeting = `Good afternoon ${userName}`;
      } else if (hours >= 18 || hours < 5) {
        greeting = `Good evening ${userName}`;
      } else {
        greeting = `Hello, ${userName}`;
      }

      greetingEl.textContent = greeting;
      clockEl.textContent = `${displayHours}:${minutes}:${seconds} ${ampm}`;
    };

    updateClockAndGreeting();
    setInterval(updateClockAndGreeting, 1000);

    // === Search Form ===
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      const engine = searchEngineSelect.value.trim(); // Trim to fix extra spaces

      if (!query) {
        searchError.textContent = "Please enter a search term.";
        searchInput.focus();
        return;
      }
      if (!engine) {
        searchError.textContent = "Please select a search engine.";
        searchEngineSelect.focus();
        return;
      }

      window.location.href = `${engine}${encodeURIComponent(query)}`;
    });

    // === Shortcuts ===
    let shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [
      { name: "YouTube", url: "https://youtube.com" },
      { name: "X", url: "https://x.com" },
    ];

    const getFaviconUrl = (url) => {
      try {
        const parsedUrl = new URL(url);

        // List of common favicon paths to try
        const faviconPaths = [
          "/favicon.ico", // Standard location
          "/favicon.png", // Alternative format
          "/favicon.jpg", // Alternative format
          "/favicon.svg", // Modern format (like your site)
          "/apple-touch-icon.png", // iOS fallback
          "/apple-touch-icon-precomposed.png", // iOS older
          // Add more paths if needed
        ];

        // Loop through paths and return the first potential match
        // This doesn't guarantee it exists, but constructs the most likely URL
        for (let path of faviconPaths) {
          const faviconUrl = `${parsedUrl.origin}${path}`;
          // Check if the path is likely the one your site uses
          // This is a basic heuristic; a more robust check would involve actually fetching
          if (
            path === "/favicon.jpg" &&
            parsedUrl.hostname.includes("silentdev-rho")
          ) {
            // Example: Specific override for your site
            return faviconUrl;
          }
          // Or, just return the first standard one found
          if (path === "/favicon.ico") {
            return faviconUrl;
          }
        }

        // If no specific override, fallback to Google's service
        return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
      } catch {
        // If the URL is invalid, return an empty string
        return "";
      }
    };

    const renderShortcuts = () => {
      shortcutList.innerHTML = "";
      shortcuts.forEach((item, index) => {
        const link = document.createElement("a");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener"; // Security best practice
        link.className = "tile";

        const iconSpan = document.createElement("span");
        iconSpan.className = "icon";

        const img = document.createElement("img");
        const faviconUrl = getFaviconUrl(item.url);
        img.src = faviconUrl;
        img.alt = item.name;
        img.className = "favicon-img";
        img.loading = "lazy";

        const fallback = document.createElement("span");
        fallback.className = "favicon-text";
        fallback.textContent = item.name.charAt(0).toUpperCase();
        fallback.style.display = faviconUrl ? "none" : "block";

        img.onerror = () => {
          img.style.display = "none";
          fallback.style.display = "block";
        };

        iconSpan.appendChild(img);
        iconSpan.appendChild(fallback);

        const nameSpan = document.createElement("span");
        nameSpan.className = "name";
        nameSpan.textContent = item.name;

        link.appendChild(iconSpan);
        link.appendChild(nameSpan);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "×";
        deleteBtn.className = "btn-icon delete-btn";
        deleteBtn.title = "Delete Shortcut";
        Object.assign(deleteBtn.style, {
          position: "absolute",
          top: "5px",
          right: "5px",
          opacity: "0",
          transition: "opacity 0.2s",
          background: "rgba(0,0,0,0.1)",
          color: "white",
          zIndex: "10",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
        });

        link.style.position = "relative";
        link.addEventListener(
          "mouseenter",
          () => (deleteBtn.style.opacity = "1")
        );
        link.addEventListener(
          "mouseleave",
          () => (deleteBtn.style.opacity = "0")
        );

        deleteBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          shortcuts.splice(index, 1);
          localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
          renderShortcuts();

          
        });

        link.appendChild(deleteBtn);
        shortcutList.appendChild(link);
      });
    };

    addShortcutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let name = shortcutNameInput.value.trim();
      let url = shortcutUrlInput.value.trim();

      if (!name) {
        shortcutError.textContent = "Please enter a shortcut name.";
        shortcutNameInput.focus();
        return;
      }
      if (!url) {
        shortcutError.textContent = "Please enter a shortcut URL.";
        shortcutUrlInput.focus();
        return;
      }

      // Auto-prepend https:// if missing
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        shortcutError.textContent = "Please enter a valid URL.";
        shortcutUrlInput.focus();
        return;
      }

      shortcuts.push({ name, url });
      localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
      renderShortcuts();
      shortcutNameInput.value = "";
      shortcutUrlInput.value = "";
    });

    renderShortcuts();

    // === To-Do List ===
    let todos = JSON.parse(localStorage.getItem("todos")) || [
      { task: "Finish coding assignment", completed: false },
      { task: "Take a break and stretch!", completed: false },
    ];

    const renderTodos = () => {
      todoList.innerHTML = "";
      [...todos]
        .sort((a, b) =>
          a.completed === b.completed ? 0 : a.completed ? 1 : -1
        )
        .forEach((item) => {
          const actualIndex = todos.findIndex(
            (t) => t.task === item.task && t.completed === item.completed
          );
          if (actualIndex === -1) return;

          const li = document.createElement("li");
          li.className = "todo-item";

          const taskSpan = document.createElement("span");
          taskSpan.textContent = item.task;
          taskSpan.className = "task-text";
          if (item.completed) taskSpan.classList.add("completed");

          li.appendChild(taskSpan);

          li.addEventListener("click", () => {
            todos[actualIndex].completed = !todos[actualIndex].completed;
            localStorage.setItem("todos", JSON.stringify(todos));
            renderTodos();
          });

          const deleteBtn = document.createElement("button");
          deleteBtn.innerHTML = "×";
          deleteBtn.className = "btn-icon delete-btn";
          deleteBtn.title = "Delete Task";
          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            todos.splice(actualIndex, 1);
            localStorage.setItem("todos", JSON.stringify(todos));
            renderTodos();
          });

          li.appendChild(deleteBtn);
          todoList.appendChild(li);
        });
    };

    todoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const task = todoInput.value.trim();
      if (!task) {
        todoError.textContent = "Please enter a to-do task.";
        todoInput.focus();
        return;
      }
      todos.push({ task, completed: false });
      localStorage.setItem("todos", JSON.stringify(todos));
      renderTodos();
      todoInput.value = "";
      const updateStats = () => {
        // Update shortcut count
        // 'shortcuts' is the array defined earlier in your script
        const shortcutCount = shortcuts.length;
        document.getElementById("stats-shortcuts").textContent = shortcutCount;

        // Update task counts
        // 'todos' is the array defined earlier in your script
        const totalTasks = todos.length;
        const completedTasks = todos.filter((todo) => todo.completed).length;

        document.getElementById("stats-tasks-done").textContent =
          completedTasks;
        document.getElementById("stats-tasks-total").textContent = totalTasks;
      };

      updateStats();
    });

    renderTodos();
  });
});

document.addEventListener("keydown", (e) => {
  // Focus search on "/"
  if (e.key === "/" && e.target.tagName !== "INPUT") {
    e.preventDefault();
    searchInput.focus();
  }

  // Add new todo on "T"
  if (e.key === "t" && e.ctrlKey) {
    e.preventDefault();
    todoInput.focus();
  }

  // Focus shortcut name on "S"
  if (e.key === "s" && e.ctrlKey) {
    e.preventDefault();
    shortcutNameInput.focus();
  }
});

document.getElementById("export-btn").addEventListener("click", () => {
  chrome.storage.sync.get(["shortcuts", "todos"], (data) => {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "silenttab-backup.json";
    a.click();
  });
});
document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-input").click();
});
document.getElementById("import-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      chrome.storage.sync.set(data, () => {
        alert("Data imported successfully!");
      });
    } catch (e) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
});
