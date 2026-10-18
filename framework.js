(() => {
  const root = document.documentElement;
  const config = window.CHI_APP_CONFIG || {};
  const setText = (selector, value) => { const node = document.querySelector(selector); if (node && typeof value === "string") node.textContent = value; };
  if (typeof config.title === "string") document.title = config.title;
  if (typeof config.brand === "string") {
    const brand = document.querySelector("[data-app-brand]");
    if (brand) brand.replaceChildren(document.createTextNode(config.brand));
  }
  setText("[data-app-version]", config.version);
  setText("[data-app-context]", config.context);
  setText("[data-app-footer-title]", config.footerTitle);
  setText("[data-app-footer-note]", config.footerNote);
  if (Array.isArray(config.navigation)) {
    const nav = document.querySelector("[data-app-navigation]");
    if (nav) {
      const icons = {
        grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
        file: '<path d="M5 4.5h14v15H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        settings: '<circle cx="12" cy="12" r="3"/><path d="m19 13.5 1.2 1-1.5 2.6-1.5-.5a7 7 0 0 1-1.7 1l-.3 1.6h-3l-.3-1.6a7 7 0 0 1-1.7-1l-1.5.5-1.5-2.6 1.2-1a7 7 0 0 1 0-2l-1.2-1 1.5-2.6 1.5.5a7 7 0 0 1 1.7-1l.3-1.6h3l.3 1.6a7 7 0 0 1 1.7 1l1.5-.5 1.5 2.6-1.2 1a7 7 0 0 1 0 2Z"/>',
      };
      nav.replaceChildren();
      config.navigation.forEach((item, index) => {
        if (!item || typeof item.label !== "string" || typeof item.href !== "string") return;
        const link = document.createElement("a");
        link.href = item.href;
        if (index === 0) { link.classList.add("is-active"); link.setAttribute("aria-current", "page"); }
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("aria-hidden", "true"); svg.classList.add("chi-sidebar__icon");
        svg.innerHTML = icons[item.icon] || icons.file;
        link.append(svg, document.createTextNode(item.label));
        nav.append(link);
      });
    }
  }
  const themeSelect = document.querySelector("[data-theme-select]");
  const savedTheme = (() => { try { return localStorage.getItem("chi-theme-mode"); } catch { return null; } })();
  const validTheme = value => ["system", "light", "dark"].includes(value);
  const applyTheme = mode => {
    const selected = validTheme(mode) ? mode : "system";
    root.dataset.chiTheme = selected === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : selected;
    root.dataset.chiThemeMode = selected;
    if (themeSelect) themeSelect.value = selected;
    try { localStorage.setItem("chi-theme-mode", selected); } catch {}
  };
  applyTheme(validTheme(savedTheme) ? savedTheme : "system");
  themeSelect?.addEventListener("change", event => applyTheme(event.target.value));
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener?.("change", () => {
    if (root.dataset.chiThemeMode === "system") applyTheme("system");
  });

  const sidebar = document.querySelector("#sidebar");
  const menuToggle = document.querySelector("[data-sidebar-toggle]");
  const closeSidebar = () => {
    sidebar?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "開啟導覽");
  };
  menuToggle?.addEventListener("click", () => {
    const open = !sidebar?.classList.contains("is-open");
    sidebar?.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "關閉導覽" : "開啟導覽");
  });
  const navLinks = [...document.querySelectorAll(".chi-sidebar__nav a")];
  const syncActiveLink = () => {
    const hash = window.location.hash || "#overview";
    const active = navLinks.find(link => link.getAttribute("href") === hash) || navLinks[0];
    navLinks.forEach(link => {
      const selected = link === active;
      link.classList.toggle("is-active", selected);
      if (selected) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };
  navLinks.forEach(link => link.addEventListener("click", () => {
    closeSidebar();
    syncActiveLink();
  }));
  window.addEventListener("hashchange", syncActiveLink);
  syncActiveLink();
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSidebar();
  });
  document.addEventListener("click", event => {
    if (sidebar?.classList.contains("is-open") && !sidebar.contains(event.target) && !menuToggle?.contains(event.target)) closeSidebar();
  });

  const toastRegion = document.querySelector("[data-toast-region]");
  const toast = message => {
    if (!toastRegion) return;
    const item = document.createElement("div");
    item.className = "chi-toast-message";
    item.setAttribute("role", "status");
    item.textContent = message;
    toastRegion.append(item);
    window.setTimeout(() => item.remove(), 2800);
  };
  document.querySelectorAll("[data-toast]").forEach(button => button.addEventListener("click", () => toast(button.dataset.toast)));
  document.querySelector("[data-demo-form]")?.addEventListener("submit", event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    toast("表單示範成功，尚未連接任何後端。");
  });
  document.querySelector("[data-reset-demo]")?.addEventListener("click", () => {
    document.querySelector("[data-demo-form]")?.reset();
    applyTheme("system");
    toast("示範設定已重設。");
  });
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
      : "舒適模式：留白較多，適合一般瀏覽。";
  }));

  let progress = 68;
  const progressNode = document.querySelector("[data-demo-progress]");
  const progressValue = document.querySelector("[data-progress-value]");
  const progressBar = progressNode?.querySelector(".chi-progress__bar");
  document.querySelector("[data-progress-advance]")?.addEventListener("click", () => {
    progress = progress >= 100 ? 0 : Math.min(100, progress + 16);
    if (progressNode) progressNode.setAttribute("aria-valuenow", String(progress));
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressValue) progressValue.textContent = `${progress}%`;
    toast(progress === 100 ? "示範工作已完成。" : `示範進度已更新至 ${progress}%。`);
  });

  let currentPage = 1;
  const pageButtons = [...document.querySelectorAll("[data-demo-page]")];
  const pageDescription = document.querySelector("[data-page-description]");
  const pagePrev = document.querySelector('[data-page-step="-1"]');
  const pageNext = document.querySelector('[data-page-step="1"]');
  const setPage = value => {
    currentPage = Math.max(1, Math.min(3, value));
    pageButtons.forEach(button => {
      if (Number(button.dataset.demoPage) === currentPage) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (pagePrev) pagePrev.disabled = currentPage === 1;
    if (pageNext) pageNext.disabled = currentPage === 3;
    if (pageDescription) pageDescription.textContent = `目前顯示第 ${currentPage} 頁。`;
  };
  pageButtons.forEach(button => button.addEventListener("click", () => setPage(Number(button.dataset.demoPage))));
  pagePrev?.addEventListener("click", () => setPage(currentPage - 1));
  pageNext?.addEventListener("click", () => setPage(currentPage + 1));

})();
