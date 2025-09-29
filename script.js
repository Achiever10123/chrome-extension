document.addEventListener("DOMContentLoaded", () => {
  // -------- 1. DOM Element References --------

  // Header Elements
  const greetingText = document.getElementById("greeting-text");
  const clockElement = document.getElementById("clock");

  // Search Elements
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchEngineSelect = document.getElementById("search-engine");

  // Shortcut Elements
  const shortcutList = document.getElementById("shortcut-list");
  const addShortcutForm = document.getElementById("add-shortcut-form");
  const shortcutNameInput = document.getElementById("shortcut-name");
  const shortcutUrlInput = document.getElementById("shortcut-url");

  // To-Do Elements
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");

  // -------- 2. Clock and Greeting Logic --------

  /**
   * Updates the clock and sets a friendly greeting based on the time.
   * NOW INCLUDES SECONDS for a more dynamic display.
   */
  const updateTimeAndGreeting = () => {
    const now = new Date();
    const hours = now.getHours();
    // 12-hour format display
    const displayHours = hours % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, "0");
    // Added seconds calculation
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Set greeting based on time of day
    let greeting = "Hello";
    if (hours >= 5 && hours < 12) {
      // 5 AM to 11:59 AM
      greeting = "Good morning Silent";
    } else if (hours >= 12 && hours < 18) {
      // 12 PM to 5:59 PM
      greeting = "Good afternoon Silent";
    } else if (hours >= 18 || hours < 5) {
      // 6 PM to 4:59 AM
      greeting = "Good evening Silent";
    }

    greetingText.textContent = greeting;
    // Updated clock format to include seconds
    clockElement.textContent = `${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  // Run immediately and then every second
  updateTimeAndGreeting();
  setInterval(updateTimeAndGreeting, 1000);

  // -------- 3. Search Functionality --------

  /**
   * Handles search form submission to redirect the user to the selected search engine.
   */
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    const searchEngine = searchEngineSelect.value;
    if (!searchTerm) {
      alert("Please enter a search term.");
      searchInput.focus();
      return;
    }
    if (!searchEngine) {
      alert("Please select a search engine.");
      searchEngineSelect.focus();
      return;
    }
    window.location.href = `${searchEngine}${encodeURIComponent(searchTerm)}`;
  });

  // -------- 4. Shortcuts Logic (with Favicon Fetching) --------

  // Load shortcuts from localStorage or set defaults
  let shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [
    { name: "YouTube", url: "https://youtube.com" },
    { name: "X", url: "https://x.com" },
  ];

  /**
   * Constructs the URL for a site's favicon using a reliable external service.
   */
  const getFaviconUrl = (url) => {
    try {
      const { hostname } = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
      return "";
    }
  };

  /**
   * Renders the list of shortcuts from the array. Delete icon is now '×'.
   */
  const renderShortcuts = () => {
    shortcutList.innerHTML = "";
    shortcuts.forEach((shortcut, index) => {
      const shortcutItem = document.createElement("a");
      Object.assign(shortcutItem, {
        href: shortcut.url,
        target: "_blank",
        className: "tile",
      });
      const iconUrl = getFaviconUrl(shortcut.url);
      shortcutItem.innerHTML = `
        <span class="icon">
          <img 
            src="${iconUrl}" 
            alt="${shortcut.name}" 
            class="favicon-img" 
            onerror="this.style.display='none'; this.parentNode.querySelector('.favicon-text').style.display='block';"
          >
          <span class="favicon-text" style="${
            iconUrl ? "display:none;" : "display:block;"
          }">
            ${shortcut.name.charAt(0).toUpperCase()}
          </span>
        </span>
        <span class="name">${shortcut.name}</span>
      `;
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
      });
      shortcutItem.style.position = "relative";
      shortcutItem.addEventListener(
        "mouseenter",
        () => (deleteBtn.style.opacity = "1")
      );
      shortcutItem.addEventListener(
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
      shortcutItem.appendChild(deleteBtn);
      shortcutList.appendChild(shortcutItem);
    });
  };

  /**
   * Handles adding a new shortcut from the form.
   */
  addShortcutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = shortcutNameInput.value.trim();
    let url = shortcutUrlInput.value.trim();

    // Input validation
    if (!name) {
      alert("Please enter a shortcut name.");
      shortcutNameInput.focus();
      return;
    }
    if (!url) {
      alert("Please enter a shortcut URL.");
      shortcutUrlInput.focus();
      return;
    }
    // Basic URL format validation
    try {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      new URL(url);
    } catch (e) {
      alert("Please enter a valid URL.");
      shortcutUrlInput.focus();
      return;
    }
    shortcuts.push({ name, url });
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    renderShortcuts();
    shortcutNameInput.value = "";
    shortcutUrlInput.value = "";
  });

  // Initial render of shortcuts
  renderShortcuts();

  // -------- 5. To-Do List Logic --------

  // Load todos from localStorage or set initial items
  let todos = JSON.parse(localStorage.getItem("todos")) || [
    { task: "Finish coding assignment", completed: false },
    { task: "Take a break and stretch!", completed: false },
  ];

  /**
   * Renders the list of to-do items. Delete icon is now '×'.
   */
  const renderTodos = () => {
    todoList.innerHTML = "";
    const sortedTodos = [...todos].sort((a, b) =>
      a.completed === b.completed ? 0 : a.completed ? 1 : -1
    );
    sortedTodos.forEach((todo) => {
      const originalIndex = todos.findIndex(
        (item) => item.task === todo.task && item.completed === todo.completed
      );
      const todoItem = document.createElement("li");
      todoItem.className = "todo-item";
      const taskText = document.createElement("span");
      taskText.textContent = todo.task;
      taskText.className = "task-text";
      if (todo.completed) taskText.classList.add("completed");
      todoItem.appendChild(taskText);
      todoItem.addEventListener("click", () => {
        if (originalIndex !== -1) {
          todos[originalIndex].completed = !todos[originalIndex].completed;
          localStorage.setItem("todos", JSON.stringify(todos));
          renderTodos();
        }
      });
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "×";
      deleteBtn.className = "btn-icon delete-btn";
      deleteBtn.title = "Delete Task";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (originalIndex !== -1) {
          todos.splice(originalIndex, 1);
          localStorage.setItem("todos", JSON.stringify(todos));
          renderTodos();
        }
      });
      todoItem.appendChild(deleteBtn);
      todoList.appendChild(todoItem);
    });
  };

  /**
   * Handles the add new to-do task form submission.
   */
  todoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const task = todoInput.value.trim();
    if (!task) {
      alert("Please enter a to-do task.");
      todoInput.focus();
      return;
    }
    todos.push({ task, completed: false });
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
    todoInput.value = "";
  });

  // Initial render of todos
  renderTodos();
});
