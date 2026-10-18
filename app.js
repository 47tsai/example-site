(() => {
  const root = document.documentElement;
  const shell = document.querySelector(".app-shell");
  const sidebar = document.querySelector("#sidebar");
  const menu = document.querySelector("#menu-trigger");
  const close = document.querySelector("#sidebar-close");
  const scrim = document.querySelector("#drawer-scrim");
  const collapse = document.querySelector("#sidebar-collapse");
  const themeButton = document.querySelector("#theme-trigger");
  const themeIcon = document.querySelector("#theme-icon");
  const themeLabel = document.querySelector("#theme-label");
  const mediaMobile = matchMedia("(max-width: 760px)");
  const mediaDark = matchMedia("(prefers-color-scheme: dark)");
  const modes = ["system", "light", "dark"];
  const names = { system: "系統", light: "淺色", dark: "深色" };
  const icons = {
    system: '<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    dark: '<path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.8 8.8 0 1 0 20.2 15.2Z"/>'
  };
  let mode = "system";
  let previousFocus = null;
  try { if (modes.includes(localStorage.getItem("chi-theme-mode"))) mode = localStorage.getItem("chi-theme-mode"); } catch {}

  function renderTheme() {
    const dark = mode === "dark" || (mode === "system" && mediaDark.matches);
    root.dataset.theme = dark ? "dark" : "light";
    root.dataset.themeMode = mode;
    themeIcon.innerHTML = icons[mode];
    themeLabel.textContent = names[mode];
    themeButton.title = "外觀：" + (mode === "system" ? "跟隨系統" : names[mode] + "模式");
    themeButton.setAttribute("aria-label", themeButton.title + "，點擊切換");
    document.querySelector('meta[name="theme-color"]').content = dark ? "#11151c" : "#f4f7fc";
  }

  function setDrawer(open, restore = true) {
    if (open && !mediaMobile.matches) return;
    sidebar.classList.toggle("is-open", open);
    scrim.classList.toggle("is-visible", open);
    document.body.classList.toggle("drawer-open", open);
    menu.setAttribute("aria-expanded", String(open));
    sidebar.setAttribute("aria-hidden", String(mediaMobile.matches && !open));
    if (open) {
      previousFocus = document.activeElement;
      close.focus({ preventScroll: true });
    } else if (restore && previousFocus instanceof HTMLElement) {
      previousFocus.focus({ preventScroll: true });
    }
  }

  menu.addEventListener("click", () => setDrawer(!sidebar.classList.contains("is-open")));
  close.addEventListener("click", () => setDrawer(false));
  scrim.addEventListener("click", () => setDrawer(false));
  collapse.addEventListener("click", () => {
    const collapsed = shell.classList.toggle("is-collapsed");
    collapse.setAttribute("aria-label", collapsed ? "展開側邊欄" : "收合側邊欄");
    collapse.title = collapsed ? "展開側邊欄" : "收合側邊欄";
  });
  themeButton.addEventListener("click", () => {
    mode = modes[(modes.indexOf(mode) + 1) % modes.length];
    try { localStorage.setItem("chi-theme-mode", mode); } catch {}
    renderTheme();
  });
  document.addEventListener("keydown", event => {
    if (!sidebar.classList.contains("is-open")) return;
    if (event.key === "Escape") { event.preventDefault(); setDrawer(false); return; }
    if (event.key !== "Tab") return;
    const items = [...sidebar.querySelectorAll('a[href],button:not([disabled])')].filter(el => el.getClientRects().length);
    if (!items.length) return;
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
  });
  mediaDark.addEventListener("change", () => { if (mode === "system") renderTheme(); });
  mediaMobile.addEventListener("change", () => {
    if (!mediaMobile.matches) setDrawer(false, false);
    sidebar.setAttribute("aria-hidden", String(mediaMobile.matches && !sidebar.classList.contains("is-open")));
  });
  sidebar.addEventListener("click", event => { if (event.target.closest("a")) setDrawer(false, false); });
  renderTheme();
  sidebar.setAttribute("aria-hidden", String(mediaMobile.matches));
})();