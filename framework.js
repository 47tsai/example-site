(() => {
  "use strict";
  const root = document.documentElement;
  const config = window.CHI_APP_CONFIG || {};
  if (typeof config.title === "string") document.title = config.title;

  const themeSelect = document.querySelector("[data-theme-select]");
  const validTheme = value => ["system", "light", "dark"].includes(value);
  let storedTheme = "system";
  try {
    const saved = localStorage.getItem("chi-theme-mode");
    if (validTheme(saved)) storedTheme = saved;
  } catch {}
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const applyTheme = mode => {
    const selected = validTheme(mode) ? mode : "system";
    const resolved = selected === "system" ? (systemTheme.matches ? "dark" : "light") : selected;
    root.dataset.chiTheme = resolved;
    root.dataset.chiThemeMode = selected;
    if (themeSelect) themeSelect.value = selected;
    try { localStorage.setItem("chi-theme-mode", selected); } catch {}
  };
  applyTheme(storedTheme);
  themeSelect?.addEventListener("change", event => applyTheme(event.currentTarget.value));
  systemTheme.addEventListener?.("change", () => {
    if (root.dataset.chiThemeMode === "system") applyTheme("system");
  });

  const sidebar = document.querySelector("#sidebar");
  const menuToggle = document.querySelector("[data-sidebar-toggle]");
  const scrim = document.querySelector("[data-sidebar-scrim]");
  const closeSidebar = () => {
    sidebar?.classList.remove("is-open");
    scrim?.classList.remove("is-visible");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "開啟導覽");
  };
  const openSidebar = () => {
    sidebar?.classList.add("is-open");
    scrim?.classList.add("is-visible");
    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "關閉導覽");
  };
  menuToggle?.addEventListener("click", () => sidebar?.classList.contains("is-open") ? closeSidebar() : openSidebar());
  scrim?.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSidebar();
  });
  document.addEventListener("click", event => {
    if (sidebar?.classList.contains("is-open") && !sidebar.contains(event.target) && !menuToggle?.contains(event.target)) closeSidebar();
  });

  const navLinks = [...document.querySelectorAll(".sidebar-nav a")];
  const syncActiveLink = () => {
    const hash = window.location.hash || "#overview";
    const active = navLinks.find(link => link.getAttribute("href") === hash) || navLinks[0];
    navLinks.forEach(link => {
      const selected = link === active;
      link.classList.toggle("is-active", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  navLinks.forEach(link => link.addEventListener("click", () => {
    closeSidebar();
    syncActiveLink();
  }));
  window.addEventListener("hashchange", syncActiveLink);
  syncActiveLink();

  const toastRegion = document.querySelector("[data-toast-region]");
  const toast = message => {
    if (!toastRegion || !message) return;
    const item = document.createElement("div");
    item.className = "toast-message";
    item.setAttribute("role", "status");
    item.textContent = message;
    toastRegion.append(item);
    window.setTimeout(() => {
      item.style.opacity = "0";
      item.style.transform = "translateY(5px)";
      window.setTimeout(() => item.remove(), 180);
    }, 3000);
  };
  document.querySelectorAll("[data-toast]").forEach(button => {
    button.addEventListener("click", () => toast(button.dataset.toast));
  });

  const form = document.querySelector("[data-demo-form]");
  form?.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = String(new FormData(form).get("name") || "").trim();
    toast(`「${name}」表單驗證成功。這只是介面示範，沒有送出資料。`);
  });
  form?.addEventListener("reset", () => toast("欄位已清除。"));

  const filterInput = document.querySelector("[data-table-filter]");
  const filterRows = [...document.querySelectorAll("[data-filter-row]")];
  const filterCount = document.querySelector("[data-table-count]");
  const filterTable = () => {
    const query = (filterInput?.value || "").trim().toLocaleLowerCase();
    let visible = 0;
    filterRows.forEach(row => {
      const matches = row.textContent.toLocaleLowerCase().includes(query);
      row.hidden = !matches;
      if (matches) visible += 1;
    });
    if (filterCount) filterCount.textContent = query ? `找到 ${visible} / ${filterRows.length} 個項目` : `顯示 ${visible} 個項目`;
  };
  filterInput?.addEventListener("input", filterTable);

  const viewButtons = [...document.querySelectorAll("[data-view-mode]")];
  const viewPreview = document.querySelector("[data-view-preview]");
  const viewDescription = document.querySelector("[data-view-description]");
  viewButtons.forEach(button => button.addEventListener("click", () => {
    const compact = button.dataset.viewMode === "compact";
    viewButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    viewPreview?.classList.toggle("is-compact", compact);
    if (viewDescription) viewDescription.textContent = compact
      ? "緊湊模式：縮小垂直間距，適合高密度管理介面。"
      : "舒適模式：保留呼吸感，適合一般瀏覽。";
  }));

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.setAttribute("tabindex", "-1");
    });
  });
})();