/**
 * app.js
 * - Mengambil daftar versi dari registry.npmjs.com (publik, tanpa API key).
 * - Merender kartu rilis dengan tombol Download (tarball resmi npm), Open in GitHub, & npm.
 * - Menjelajahi DUA struktur (read-only) dengan pewarnaan sintaksis + ikon ala VS Code:
 *     1) "Source"      -> isi repo GitHub apa adanya
 *     2) "Rilis"       -> folder cfg.releasesFolderPath (mis. @xayz/baileys/<versi>/...)
 *        yang diisi otomatis oleh workflow ekstraksi.
 * - Menampilkan pratinjau skrip publikasi TANPA pernah mengeksekusinya.
 *
 * Situs ini tidak pernah menjalankan kode yang diambil dari jaringan.
 * Semua fetch di sini murni untuk MEMBACA metadata/teks dan menampilkannya.
 */
(function () {
  "use strict";

  const cfg = window.XAYZ_CONFIG;
  const icons = window.XayzFileIcons;
  const grid = document.getElementById("release-grid");
  const errorBox = document.getElementById("release-error");
  const searchInput = document.getElementById("release-search");

  let allVersions = []; // [{version, date, tarball, ts}]

  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // ---------- Releases: pulled live from registry.npmjs.com ----------
  async function loadVersions() {
    const url = `${cfg.npmRegistryBase}/${encodeURIComponent(cfg.npmPackage).replace(
      "%40",
      "@"
    )}`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Registry merespons ${res.status}`);
      const data = await res.json();

      const versions = Object.keys(data.versions || {});
      allVersions = versions
        .map((v) => {
          const meta = data.versions[v];
          return {
            version: v,
            date: data.time ? data.time[v] : null,
            tarball: meta?.dist?.tarball || null,
            shasum: meta?.dist?.shasum || null,
          };
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1)); // terbaru dulu

      const latestTag = data["dist-tags"] && data["dist-tags"].latest;
      renderStats(latestTag, allVersions);
      renderReleases(allVersions, latestTag);
    } catch (err) {
      console.error(err);
      showRegistryError(err);
    }
  }

  function renderStats(latestTag, versions) {
    document.getElementById("stat-latest").textContent = latestTag || "—";
    document.getElementById("stat-count").textContent = String(versions.length || 0);
  }

  function showRegistryError(err) {
    grid.innerHTML = "";
    errorBox.hidden = false;
    errorBox.innerHTML = `
      Tidak dapat mengambil data dari <code>registry.npmjs.com/${escapeHtml(
        cfg.npmPackage
      )}</code> saat ini
      (${escapeHtml(err.message)}). Ini bisa terjadi jika paket belum dipublikasikan,
      nama scope belum sesuai, atau tidak ada koneksi internet.
      Anda tetap bisa membuka repositori sumbernya langsung di
      <a href="https://github.com/${escapeHtml(cfg.githubRepo)}" target="_blank" rel="noopener">GitHub</a>.
    `;
  }

  function renderReleases(versions, latestTag) {
    if (!versions.length) {
      showRegistryError(new Error("Belum ada versi terpublikasi"));
      return;
    }
    errorBox.hidden = true;
    grid.innerHTML = versions
      .map((v, i) => releaseCardHtml(v, v.version === latestTag, i === 0))
      .join("");
  }

  function npmStatUrl() {
    return `https://npm-stat.com/charts.html?package=${encodeURIComponent(cfg.npmPackage)}`;
  }

  function downloadsBadgeHtml(version) {
    const map = window.XAYZ_VERSION_DOWNLOADS;
    if (map && Object.prototype.hasOwnProperty.call(map, version)) {
      const n = map[version];
      return `<span class="release-card__dl-badge" title="Unduhan 7 hari terakhir (api.npmjs.org)">↓ ${n.toLocaleString(
        "id-ID"
      )}<span class="release-card__dl-badge-unit">/7 hari</span></span>`;
    }
    return `<span class="release-card__dl-badge release-card__dl-badge--pending" title="Memuat data unduhan…">↓ …</span>`;
  }

  function releaseCardHtml(v, isLatestTag, isNewest) {
    const badge = isLatestTag
      ? '<span class="tag tag--latest">latest</span>'
      : isNewest
      ? '<span class="tag tag--new">terbaru</span>'
      : "";
    const ghTag = `https://github.com/${cfg.githubRepo}/releases/tag/v${v.version}`;
    const npmVersionUrl = `https://www.npmjs.com/package/${cfg.npmPackage}/v/${v.version}`;
    return `
      <article class="release-card" data-version="${escapeHtml(v.version)}">
        <header class="release-card__head">
          <h3>v${escapeHtml(v.version)}</h3>
          ${badge}
        </header>
        <p class="release-card__date">${fmtDate(v.date)}</p>
        <div class="release-card__downloads-row" data-version="${escapeHtml(v.version)}">
          ${downloadsBadgeHtml(v.version)}
        </div>
        <div class="release-card__actions">
          ${
            v.tarball
              ? `<a class="btn btn--primary btn--small" href="${escapeHtml(
                  v.tarball
                )}" download>Download</a>`
              : `<span class="btn btn--primary btn--small btn--disabled">Tak tersedia</span>`
          }
          <a class="btn btn--outline btn--small" href="${ghTag}" target="_blank" rel="noopener">GitHub</a>
          <a class="btn btn--outline btn--small" href="${npmVersionUrl}" target="_blank" rel="noopener">npm</a>
        </div>
        <a class="release-card__downloads" href="${npmStatUrl()}" target="_blank" rel="noopener">
          Riwayat unduhan lengkap versi ini ↗
        </a>
        <p class="release-card__meta">
          ${
            v.shasum
              ? `sha1 <code>${escapeHtml(v.shasum.slice(0, 12))}…</code>`
              : ""
          }
        </p>
      </article>
    `;
  }

  // Begitu data unduhan per-versi (7 hari terakhir) selesai dimuat,
  // isi ulang badge di kartu yang sudah terlanjur dirender.
  window.addEventListener("xayz:version-downloads-ready", () => {
    document.querySelectorAll(".release-card__downloads-row").forEach((row) => {
      row.innerHTML = downloadsBadgeHtml(row.dataset.version);
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      const filtered = q
        ? allVersions.filter((v) => v.version.toLowerCase().includes(q))
        : allVersions;
      const latestTag = allVersions[0] ? allVersions[0].version : null;
      renderReleases(filtered, latestTag);
    });
  }

  loadVersions();

  // ---------- Code browser: GitHub contents API (read-only), dua mode ----------
  const treeEl = document.getElementById("ide-tree");
  const tabsEl = document.getElementById("ide-tabs");
  const codeEl = document.getElementById("ide-code-content");
  const modeButtons = document.querySelectorAll(".ide__mode-btn");
  const openTabs = new Map(); // path -> {name, content, lang}
  let activeTab = null;
  let currentMode = "source"; // "source" | "releases"

  function rootPathFor(mode) {
    return mode === "releases" ? cfg.releasesFolderPath : "";
  }

  function extToLang(name) {
    const ext = name.split(".").pop().toLowerCase();
    return (
      {
        js: "javascript",
        cjs: "javascript",
        mjs: "javascript",
        ts: "typescript",
        json: "json",
        sh: "bash",
        yml: "yaml",
        yaml: "yaml",
        md: "markdown",
        css: "css",
        html: "xml",
      }[ext] || "plaintext"
    );
  }

  async function loadTree(path) {
    const api = `https://api.github.com/repos/${cfg.githubRepo}/contents/${path}?ref=${cfg.githubBranch}`;
    const res = await fetch(api, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return res.json();
  }

  function quickLinksHtml(item, depth) {
    // Di root folder rilis, setiap folder versi dapat tautan cepat GitHub + npm.
    if (currentMode !== "releases" || depth !== 0 || item.type !== "dir") return "";
    const version = item.name;
    const ghUrl = `https://github.com/${cfg.githubRepo}/tree/${cfg.githubBranch}/${item.path}`;
    const npmUrl = `https://www.npmjs.com/package/${cfg.npmPackage}/v/${encodeURIComponent(
      version
    )}`;
    return `
      <span class="ide__quicklink" data-href="${escapeHtml(ghUrl)}" title="Buka di GitHub">GH</span>
      <span class="ide__quicklink" data-href="${escapeHtml(npmUrl)}" title="Buka di npm">npm</span>
    `;
  }

  function renderTreeNode(item, depth) {
    const isDir = item.type === "dir";
    const icon = isDir ? icons.iconForFolder(false) : icons.iconForFile(item.name);
    return `
      <li class="ide__node ${isDir ? "ide__node--dir" : "ide__node--file"}"
          data-path="${escapeHtml(item.path)}" data-type="${item.type}" data-depth="${depth}">
        <span class="ide__row">
          ${icon}
          <span class="ide__label">${escapeHtml(item.name)}</span>
          ${quickLinksHtml(item, depth)}
        </span>
      </li>
    `;
  }

  function sortItems(items) {
    return items.sort((a, b) =>
      a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1
    );
  }

  async function initTree() {
    treeEl.innerHTML = `<p class="ide__loading">Memuat struktur ${
      currentMode === "releases" ? "folder rilis" : "repositori"
    }…</p>`;
    try {
      const items = sortItems(await loadTree(rootPathFor(currentMode)));
      treeEl.innerHTML = `<ul class="ide__list">${items
        .map((i) => renderTreeNode(i, 0))
        .join("")}</ul>`;
    } catch (err) {
      const hint =
        currentMode === "releases"
          ? "Folder rilis mungkin belum dibuat — jalankan scripts/download-all.sh atau workflow ekstraksi terlebih dahulu."
          : "";
      treeEl.innerHTML = `<p class="ide__loading">Tidak dapat memuat struktur (${escapeHtml(
        err.message
      )}). ${hint} <a href="https://github.com/${escapeHtml(
        cfg.githubRepo
      )}" target="_blank" rel="noopener">Buka langsung di GitHub</a>.</p>`;
    }
  }

  treeEl.addEventListener("click", onTreeClick);

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.mode === currentMode) return;
      currentMode = btn.dataset.mode;
      modeButtons.forEach((b) => b.classList.toggle("ide__mode-btn--active", b === btn));
      initTree();
    });
  });

  async function onTreeClick(e) {
    const quick = e.target.closest(".ide__quicklink");
    if (quick) {
      e.stopPropagation();
      window.open(quick.dataset.href, "_blank", "noopener");
      return;
    }

    const li = e.target.closest(".ide__node");
    if (!li) return;
    const path = li.dataset.path;
    const type = li.dataset.type;
    const depth = Number(li.dataset.depth || 0);

    if (type === "dir") {
      const existing = li.querySelector(":scope > ul");
      const iconSpan = li.querySelector(":scope > .ide__row .ide__file-icon");
      if (existing) {
        existing.remove();
        li.dataset.expanded = "false";
        if (iconSpan) iconSpan.outerHTML = icons.iconForFolder(false);
        return;
      }
      try {
        const items = sortItems(await loadTree(path));
        li.insertAdjacentHTML(
          "beforeend",
          `<ul class="ide__list">${items.map((i) => renderTreeNode(i, depth + 1)).join("")}</ul>`
        );
        li.dataset.expanded = "true";
        if (iconSpan) iconSpan.outerHTML = icons.iconForFolder(true);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // file: open (read-only) in a tab
    if (openTabs.has(path)) {
      activateTab(path);
      return;
    }
    try {
      const raw = `https://raw.githubusercontent.com/${cfg.githubRepo}/${cfg.githubBranch}/${path}`;
      const res = await fetch(raw);
      const text = res.ok ? await res.text() : `// Tidak dapat memuat ${path}`;
      openTabs.set(path, {
        name: path.split("/").pop(),
        content: text,
        lang: extToLang(path),
      });
      activateTab(path);
    } catch (err) {
      console.error(err);
    }
  }

  function activateTab(path) {
    activeTab = path;
    renderTabs();
    if (!path) return;
    const tab = openTabs.get(path);
    codeEl.className = `hljs language-${tab.lang}`;
    codeEl.textContent = tab.content;
    if (window.hljs) window.hljs.highlightElement(codeEl);
  }

  function renderTabs() {
    tabsEl.innerHTML = [...openTabs.entries()]
      .map(([path, tab]) => {
        const icon = icons.iconForFile(tab.name);
        return `
        <button class="ide__tab ${path === activeTab ? "ide__tab--active" : ""}" data-path="${escapeHtml(
          path
        )}">
          ${icon}
          <span>${escapeHtml(tab.name)}</span>
          <span class="ide__tab-close" data-close="${escapeHtml(path)}">×</span>
        </button>`;
      })
      .join("");
    tabsEl.querySelectorAll(".ide__tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.target.dataset.close) {
          openTabs.delete(e.target.dataset.close);
          const remaining = [...openTabs.keys()];
          activateTab(remaining[remaining.length - 1] || null);
          if (!remaining.length) {
            codeEl.className = "hljs";
            codeEl.textContent = "# Pilih berkas di sebelah kiri untuk melihat isinya.";
          }
          return;
        }
        activateTab(btn.dataset.path);
      });
    });
  }

  initTree();

  // ---------- Publish console: preview only, never executes ----------
  const publishPre = document.getElementById("publish-script-preview");
  const copyBtn = document.getElementById("btn-copy-publish");

  async function loadPublishPreview() {
    try {
      const res = await fetch(cfg.publishScriptUrl);
      const text = res.ok
        ? await res.text()
        : "# Skrip tidak ditemukan di URL yang dikonfigurasi.";
      publishPre.textContent = text;
      publishPre.className = "hljs language-bash";
      if (window.hljs) window.hljs.highlightElement(publishPre);
    } catch (err) {
      publishPre.textContent = `# Tidak dapat memuat pratinjau (${err.message}).\n# Tinjau skrip ini secara manual sebelum menjalankannya:\n# ${cfg.publishScriptUrl}`;
    }
  }
  loadPublishPreview();

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(`bash publish-to-npm.sh`);
        copyBtn.textContent = "Tersalin ✓";
        setTimeout(() => (copyBtn.textContent = "Salin perintah"), 1500);
      } catch {
        /* clipboard may be unavailable; ignore silently */
      }
    });
  }

  // ---------- Footer social links (dari config.js) ----------
  // Ikon garis sederhana yang orisinal (bukan aset resmi platform).
  const SOCIAL_ICONS = {
    telegram: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M21 4 3 11.2l5.3 1.8L9.8 18l3-3.4L17.6 18 21 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m8.3 13 8.3-6.6-6.6 7.4" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" stroke-width="1.6"/><path d="M10.3 9.3v5.4l4.9-2.7-4.9-2.7Z" fill="currentColor"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M12 3.5a8.4 8.4 0 0 0-7.2 12.7L3.5 20.5l4.5-1.2A8.4 8.4 0 1 0 12 3.5Z" stroke="currentColor" stroke-width="1.6"/><path d="M8.7 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .6.4l.6 1.5c.1.2 0 .4-.1.5l-.5.5c-.1.1-.1.3 0 .4.4.8 1.2 1.6 2 2 .1.1.3.1.4 0l.5-.5c.1-.1.3-.2.5-.1l1.5.6c.3.2.4.4.4.6v.5c0 .2 0 .5-.4.7-.5.3-1.2.5-2 .3-1.6-.4-3.5-2.3-3.9-3.9-.2-.8 0-1.5.3-2Z" fill="currentColor"/></svg>`,
    github: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M12 3.2a9 9 0 0 0-2.8 17.5c.5.1.6-.2.6-.4v-1.6c-2.5.5-3-1.1-3-1.1-.4-1-1-1.3-1-1.3-.8-.5.1-.5.1-.5.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.7.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.4 0-1 .3-1.7.9-2.4-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9a8 8 0 0 1 4.4 0c1.7-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.6.7.9 1.5.9 2.4 0 3.4-2.1 4.1-4.1 4.4.3.3.6.8.6 1.7v2.5c0 .2.1.5.6.4A9 9 0 0 0 12 3.2Z" fill="currentColor"/></svg>`,
    npm: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="1.5" fill="currentColor"/><path d="M6 9h4v6H8.7v-4.6H7.3V15H6V9Zm6.3 0h5.4v4.6h-2.6V15h-1.4V9h-1.4Zm1.4 1.4v1.9h1.3v-1.9h-1.3Z" fill="#0a0d16"/></svg>`,
  };

  const socialRoot = document.getElementById("social-links");
  if (socialRoot && cfg.social) {
    const s = cfg.social;
    const items = [
      { label: "Kontak Telegram", url: s.telegramContact, icon: "telegram" },
      { label: "Channel Telegram", url: s.telegramChannel, icon: "telegram" },
      { label: "YouTube", url: s.youtube, icon: "youtube" },
      { label: "Channel WhatsApp", url: s.whatsappChannel, icon: "whatsapp" },
      { label: "GitHub", url: s.github, icon: "github" },
      { label: "npm", url: s.npm, icon: "npm" },
    ].filter((i) => i.url);

    socialRoot.innerHTML = items
      .map(
        (i) => `
        <a class="social-link" href="${escapeHtml(i.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(
          i.label
        )}" title="${escapeHtml(i.label)}">
          ${SOCIAL_ICONS[i.icon] || ""}
        </a>`
      )
      .join("");
  }
})();
