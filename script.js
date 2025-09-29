document.addEventListener("DOMContentLoaded", () => {
  const e = document.getElementById("greeting-text"),
    t = document.getElementById("clock"),
    n = document.getElementById("search-form"),
    a = document.getElementById("search-input"),
    r = document.getElementById("search-engine"),
    o = document.getElementById("shortcut-list"),
    c = document.getElementById("add-shortcut-form"),
    d = document.getElementById("shortcut-name"),
    l = document.getElementById("shortcut-url"),
    u = document.getElementById("todo-form"),
    s = document.getElementById("todo-input"),
    i = document.getElementById("todo-list"),
    m = () => {
      const n = new Date(),
        a = n.getHours(),
        r = a % 12 || 12,
        o = n.getMinutes().toString().padStart(2, "0"),
        c = n.getSeconds().toString().padStart(2, "0"),
        d = a >= 12 ? "PM" : "AM";
      let l = "Hello";
      (l =
        a >= 5 && a < 12
          ? "Good morning Silent"
          : a >= 12 && a < 18
          ? "Good afternoon Silent"
          : a >= 18 || a < 5
          ? "Good evening Silent"
          : "Hello"),
        (e.textContent = l),
        (t.textContent = `${r}:${o}:${c} ${d}`);
    };
  m(),
    setInterval(m, 1e3),
    n.addEventListener("submit", (e) => {
      e.preventDefault();
      const t = a.value.trim(),
        o = r.value;
      if (!t) return alert("Please enter a search term."), a.focus(), void 0;
      if (!o) return alert("Please select a search engine."), r.focus(), void 0;
      window.location.href = `${o}${encodeURIComponent(t)}`;
    });
  let f = JSON.parse(localStorage.getItem("shortcuts")) || [
    { name: "YouTube", url: "https://youtube.com" },
    { name: "X", url: "https://x.com" },
  ];
  const g = (e) => {
      try {
        return `https://www.google.com/s2/favicons?domain=${
          new URL(e).hostname
        }&sz=64`;
      } catch {
        return "";
      }
    },
    p = () => {
      (o.innerHTML = ""),
        f.forEach((e, t) => {
          const n = document.createElement("a");
          Object.assign(n, {
            href: e.url,
            target: "_blank",
            className: "tile",
          });
          const a = g(e.url);
          n.innerHTML = `<span class=\"icon\"><img src=\"${a}\" alt=\"${
            e.name
          }\" class=\"favicon-img\" onerror=\"this.style.display='none'; this.parentNode.querySelector('.favicon-text').style.display='block';\"><span class=\"favicon-text\" style=\"${
            a ? "display:none;" : "display:block;"
          }\">${e.name
            .charAt(0)
            .toUpperCase()}</span></span><span class=\"name\">${e.name}</span>`;
          const r = document.createElement("button");
          (r.innerHTML = "×"),
            (r.className = "btn-icon delete-btn"),
            (r.title = "Delete Shortcut"),
            Object.assign(r.style, {
              position: "absolute",
              top: "5px",
              right: "5px",
              opacity: "0",
              transition: "opacity 0.2s",
              background: "rgba(0,0,0,0.1)",
              color: "white",
              zIndex: "10",
            }),
            (n.style.position = "relative"),
            n.addEventListener("mouseenter", () => (r.style.opacity = "1")),
            n.addEventListener("mouseleave", () => (r.style.opacity = "0")),
            r.addEventListener("click", (a) => {
              a.preventDefault(),
                a.stopPropagation(),
                f.splice(t, 1),
                localStorage.setItem("shortcuts", JSON.stringify(f)),
                p();
            }),
            n.appendChild(r),
            o.appendChild(n);
        });
    };
  c.addEventListener("submit", (e) => {
    e.preventDefault();
    let t = d.value.trim(),
      n = l.value.trim();
    if (!t) return alert("Please enter a shortcut name."), d.focus(), void 0;
    if (!n) return alert("Please enter a shortcut URL."), l.focus(), void 0;
    try {
      n.startsWith("http://") ||
        n.startsWith("https://") ||
        (n = "https://" + n),
        new URL(n);
    } catch (e) {
      return alert("Please enter a valid URL."), l.focus(), void 0;
    }
    f.push({ name: t, url: n }),
      localStorage.setItem("shortcuts", JSON.stringify(f)),
      p(),
      (d.value = ""),
      (l.value = "");
  }),
    p();
  let h = JSON.parse(localStorage.getItem("todos")) || [
      { task: "Finish coding assignment", completed: !1 },
      { task: "Take a break and stretch!", completed: !1 },
    ],
    v = () => {
      (i.innerHTML = ""),
        [...h]
          .sort((e, t) =>
            e.completed === t.completed ? 0 : e.completed ? 1 : -1
          )
          .forEach((e) => {
            const t = h.findIndex(
                (t) => t.task === e.task && t.completed === e.completed
              ),
              n = document.createElement("li");
            n.className = "todo-item";
            const a = document.createElement("span");
            (a.textContent = e.task),
              (a.className = "task-text"),
              e.completed && a.classList.add("completed"),
              n.appendChild(a),
              n.addEventListener("click", () => {
                -1 !== t &&
                  ((h[t].completed = !h[t].completed),
                  localStorage.setItem("todos", JSON.stringify(h)),
                  v());
              });
            const r = document.createElement("button");
            (r.innerHTML = "×"),
              (r.className = "btn-icon delete-btn"),
              (r.title = "Delete Task"),
              r.addEventListener("click", (a) => {
                a.stopPropagation(),
                  -1 !== t &&
                    (h.splice(t, 1),
                    localStorage.setItem("todos", JSON.stringify(h)),
                    v());
              }),
              n.appendChild(r),
              i.appendChild(n);
          });
    };
  u.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = s.value.trim();
    if (!t) return alert("Please enter a to-do task."), s.focus(), void 0;
    h.push({ task: t, completed: !1 }),
      localStorage.setItem("todos", JSON.stringify(h)),
      v(),
      (s.value = "");
  }),
    v();
});
