/**
 * file-icons.js — set ikon SVG bergaya editor kode (mirip VS Code),
 * satu ikon khas per jenis berkas & folder. Dibuat orisinal (bukan
 * ekstrak dari paket ikon pihak ketiga) supaya bebas dipakai di mana saja.
 */
(function () {
  "use strict";

  function svg(inner, viewBox) {
    return `<svg class="ide__file-icon" viewBox="${viewBox || "0 0 16 16"}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  }

  const ICONS = {
    folder: svg(
      `<path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.1a1.5 1.5 0 0 1 1.2.6l.9 1.2H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13.8H3A1.5 1.5 0 0 1 1.5 12.3v-8.8Z" fill="#6ea8fe"/>`
    ),
    folderOpen: svg(
      `<path d="M1.5 4.2A1.5 1.5 0 0 1 3 2.7h3.1a1.5 1.5 0 0 1 1.2.6l.7 1H13a1.3 1.3 0 0 1 1.28 1.53l-.9 5.4A1.5 1.5 0 0 1 11.9 12.5H3.1a1.5 1.5 0 0 1-1.48-1.28L1 5.6a1.3 1.3 0 0 1 .5-1.4Z" fill="#8fc1ff"/>`
    ),
    js: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#2a2a1a"/><path d="M8.6 11.4c.3.5.7.8 1.3.8.6 0 1-.3 1-.8 0-.5-.4-.7-1.1-1l-.4-.2c-1.1-.5-1.9-1.1-1.9-2.3 0-1.2 1-2 2.3-2 1 0 1.7.4 2.2 1.2l-1.2.8c-.3-.5-.5-.6-1-.6-.4 0-.7.3-.7.6 0 .4.3.6 1 .9l.4.2c1.3.6 2 1.1 2 2.4 0 1.4-1.1 2.2-2.6 2.2-1.4 0-2.4-.7-2.9-1.6l1.6-.6ZM3.4 11.5c.2.4.5.7 1 .7.5 0 .8-.2.8-1V6.1H6.9v5.1c0 1.5-.9 2.3-2.2 2.3-1.2 0-1.9-.6-2.3-1.4l1-.6Z" fill="#f7df1e"/>`
    ),
    ts: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#0f2a4a"/><path d="M3 6.3h4.4v1.2H5.9V13H4.6V7.5H3V6.3Z" fill="#3b82f6"/><path d="M8.9 11.4c.3.5.7.8 1.3.8.6 0 .9-.3.9-.7 0-.5-.4-.7-1.1-1l-.4-.1c-1-.5-1.7-1-1.7-2.2 0-1.1.9-1.9 2.1-1.9 1 0 1.6.4 2 1.1l-1.1.7c-.2-.4-.5-.6-.9-.6-.4 0-.6.2-.6.6 0 .3.2.5.9.8l.4.2c1.2.5 1.9 1 1.9 2.2 0 1.3-1 2.1-2.4 2.1-1.3 0-2.2-.6-2.6-1.5l1.3-.5Z" fill="#3b82f6"/>`
    ),
    json: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#241f0f"/><path d="M5.6 3.6c-1 0-1.5.5-1.5 1.5v1.4c0 .6-.2.9-.9 1v.9c.7.1.9.4.9 1v1.4c0 1 .5 1.5 1.5 1.5h.5v-1H5.8c-.3 0-.4-.1-.4-.5v-1.5c0-.7-.2-1.1-.6-1.4.4-.2.6-.6.6-1.3V5.1c0-.4.1-.5.4-.5h.3v-1h-.5Zm4.8 0h-.5v1h.3c.3 0 .4.1.4.5v1.5c0 .7.2 1.1.6 1.3-.4.3-.6.7-.6 1.4v1.5c0 .4-.1.5-.4.5h-.3v1h.5c1 0 1.5-.5 1.5-1.5v-1.4c0-.6.2-.9.9-1v-.9c-.7-.1-.9-.4-.9-1V5.1c0-1-.5-1.5-1.5-1.5Z" fill="#f5b942"/>`
    ),
    bash: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#0c1e14"/><path d="M3.2 5.4 6.6 8l-3.4 2.6" stroke="#34d399" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.6 11h5" stroke="#34d399" stroke-width="1.3" stroke-linecap="round"/>`
    ),
    yaml: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#2a1610"/><path d="M4 5.2 6 8v3.1H4.9V8L2.9 5.2h1.3L5.4 7l1-1.8Z" fill="#f87171"/><path d="M9.4 5.2h1.2l-1.5 3.8v2.1H8v-2L6.6 5.2h1.3l.8 2.4.7-2.4Z" fill="#f87171"/>`
    ),
    md: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#101a2a"/><path d="M3 11V5.4h1.3L6 8l1.7-2.6H9V11H7.7V7.6L6 10.1 4.3 7.6V11H3Zm8.9 0L9.8 8.6h1.3V5.4h1.4v3.2H14L11.9 11Z" fill="#93c5fd"/>`
    ),
    css: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#0e2233"/><path d="m3 3 .8 8.6L8 13l4.2-1.4L13 3H3Z" fill="#38bdf8"/><path d="M8 4.3v8.4l3.3-1.1.6-6.7H8Z" fill="#0ea5e9"/>`
    ),
    html: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#331a10"/><path d="m3 3 .8 8.6L8 13l4.2-1.4L13 3H3Z" fill="#fb923c"/><path d="M8 4.3v8.4l3.3-1.1.6-6.7H8Z" fill="#f97316"/>`
    ),
    image: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#1a1030"/><circle cx="5.3" cy="6" r="1.2" fill="#c4b5fd"/><path d="m2.5 12 3.4-4 2.3 2.7L10.6 7l3 5H2.5Z" fill="#a78bfa"/>`
    ),
    lock: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#241318"/><path d="M5.4 7V5.6a2.6 2.6 0 1 1 5.2 0V7" stroke="#f472b6" stroke-width="1.2" fill="none"/><rect x="4.4" y="7" width="7.2" height="5" rx="1" fill="#f472b6"/>`
    ),
    git: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#1c1006"/><circle cx="8" cy="8" r="4.2" fill="none" stroke="#fb923c" stroke-width="1.2"/><circle cx="8" cy="8" r="1.1" fill="#fb923c"/>`
    ),
    generic: svg(
      `<rect x="1" y="1" width="14" height="14" rx="2" fill="#1a1f2e"/><path d="M4 3.5h5.5L12 6v6.5H4v-9Z" fill="none" stroke="#8b93a7" stroke-width="1" /><path d="M9.5 3.5V6H12" stroke="#8b93a7" stroke-width="1" fill="none"/>`
    ),
  };

  const EXT_MAP = {
    js: "js",
    cjs: "js",
    mjs: "js",
    jsx: "js",
    ts: "ts",
    tsx: "ts",
    json: "json",
    sh: "bash",
    bash: "bash",
    yml: "yaml",
    yaml: "yaml",
    md: "md",
    markdown: "md",
    css: "css",
    scss: "css",
    html: "html",
    htm: "html",
    png: "image",
    jpg: "image",
    jpeg: "image",
    svg: "image",
    gif: "image",
    webp: "image",
    ico: "image",
    lock: "lock",
    gitignore: "git",
  };

  function iconForFile(name) {
    const lower = name.toLowerCase();
    if (lower === ".gitignore" || lower === ".gitattributes") return ICONS.git;
    if (lower === "package-lock.json" || lower.endsWith(".lock")) return ICONS.lock;
    const ext = lower.split(".").pop();
    const key = EXT_MAP[ext] || "generic";
    return ICONS[key];
  }

  function iconForFolder(open) {
    return open ? ICONS.folderOpen : ICONS.folder;
  }

  window.XayzFileIcons = { iconForFile, iconForFolder };
})();
