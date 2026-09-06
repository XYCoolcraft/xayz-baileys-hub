/**
 * app.js
 * - Mengambil daftar versi dari registry.npmjs.com (publik, tanpa API key).
 * - Merender kartu rilis dengan tombol Download (tarball resmi npm) & Open in GitHub.
 * - Menjelajahi struktur repo GitHub (read-only) dengan pewarnaan sintaksis.
 * - Menampilkan pratinjau skrip publikasi TANPA pernah mengeksekusinya.
 *
 * Situs ini tidak pernah menjalankan kode yang diambil dari jaringan.
 * Semua fetch di sini murni untuk MEMBACA metadata/teks dan menampilkannya.
 */
(function () {
  "use strict";

  const cfg = window.XAYZ_CONFIG;
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
    document.getElementById("stat-updated").textContent = versions[0]
      ? fmtDate(versions[0].date)
      : "—";
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

  function releaseCardHtml(v, isLatestTag, isNewest) {
    const badge = isLatestTag
      ? '<span class="tag tag--latest">latest</span>'
      : isNewest
      ? '<span class="tag tag--new">terbaru</span>'
      : "";
    const ghTag = `https://github.com/${cfg.githubRepo}/releases/tag/v${v.version}`;
    const ghTree = `https://github.com/${cfg.githubRepo}/tree/${cfg.githubBranch}`;
    return `
      <article class="release-card" data-version="${escapeHtml(v.version)}">
        <header class="release-card__head">
          <h3>v${escapeHtml(v.version)}</h3>
          ${badge}
        </header>
        <p class="release-card__date">${fmtDate(v.date)}</p>
        <div class="release-card__actions">
          ${
            v.tarball
              ? `<a class="btn btn--primary btn--small" href="${escapeHtml(
                  v.tarball
                )}" download>Download</a>`
              : `<span class="btn btn--primary btn--small btn--disabled">Tak tersedia</span>`
          }
          <a class="btn btn--outline btn--small" href="${ghTag}" target="_blank" rel="noopener">Open in GitHub</a>
        </div>
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

  // ---------- Code browser: GitHub contents API (read-only) ----------
  const treeEl = document.getElementById("ide-tree");
  const tabsEl = document.getElementById("ide-tabs");
  const codeEl = document.getElementById("ide-code-content");
  const openTabs = new Map(); // path -> {name, content, lang}
  let activeTab = null;

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
      }[ext] || "plaintext"
    );
  }

  async function loadTree(path = "") {
    const api = `https://api.github.com/repos/${cfg.githubRepo}/contents/${path}?ref=${cfg.githubBranch}`;
    const res = await fetch(api, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return res.json();
  }

  function renderTreeNode(item) {
    const isDir = item.type === "dir";
    return `
      <li class="ide__node ${isDir ? "ide__node--dir" : "ide__node--file"}"
          data-path="${escapeHtml(item.path)}" data-type="${item.type}">
        <span class="ide__icon" aria-hidden="true">${isDir ? "📁" : "📄"}</span>
        <span class="ide__label">${escapeHtml(item.name)}</span>
      </li>
    `;
  }

  async function initTree() {
    try {
      const items = await loadTree("");
      items.sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1
      );
      treeEl.innerHTML = `<ul class="ide__list">${items.map(renderTreeNode).join("")}</ul>`;
      treeEl.addEventListener("click", onTreeClick);
    } catch (err) {
      treeEl.innerHTML = `<p class="ide__loading">Tidak dapat memuat struktur repo (${escapeHtml(
        err.message
      )}). <a href="https://github.com/${escapeHtml(
        cfg.githubRepo
      )}" target="_blank" rel="noopener">Buka langsung di GitHub</a>.</p>`;
    }
  }

  async function onTreeClick(e) {
    const li = e.target.closest(".ide__node");
    if (!li) return;
    const path = li.dataset.path;
    const type = li.dataset.type;

    if (type === "dir") {
      const expanded = li.dataset.expanded === "true";
      const existing = li.querySelector(":scope > ul");
      if (existing) {
        existing.remove();
        li.dataset.expanded = "false";
        return;
      }
      try {
        const items = await loadTree(path);
        items.sort((a, b) =>
          a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1
        );
        li.insertAdjacentHTML(
          "beforeend",
          `<ul class="ide__list">${items.map(renderTreeNode).join("")}</ul>`
        );
        li.dataset.expanded = "true";
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
      openTabs.set(path, { name: path.split("/").pop(), content: text, lang: extToLang(path) });
      activateTab(path);
    } catch (err) {
      console.error(err);
    }
  }

  function activateTab(path) {
    activeTab = path;
    renderTabs();
    const tab = openTabs.get(path);
    codeEl.className = `hljs language-${tab.lang}`;
    codeEl.textContent = tab.content;
    if (window.hljs) window.hljs.highlightElement(codeEl);
  }

  function renderTabs() {
    tabsEl.innerHTML = [...openTabs.entries()]
      .map(
        ([path, tab]) => `
        <button class="ide__tab ${path === activeTab ? "ide__tab--active" : ""}" data-path="${escapeHtml(
          path
        )}">
          ${escapeHtml(tab.name)}
          <span class="ide__tab-close" data-close="${escapeHtml(path)}">×</span>
        </button>`
      )
      .join("");
    tabsEl.querySelectorAll(".ide__tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.target.dataset.close) {
          openTabs.delete(e.target.dataset.close);
          const remaining = [...openTabs.keys()];
          activateTab(remaining[remaining.length - 1] || null);
          if (!remaining.length) {
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
})();
