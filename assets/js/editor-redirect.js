/**
 * editor-redirect.js
 *
 * Rantai fallback untuk tombol "Edit & Publish":
 *
 *   Desktop (Windows / macOS / Linux)
 *     1. Coba buka aplikasi VS Code lokal lewat skema resmi `vscode://`
 *        (VS Code sendiri yang menangani clone repo — situs ini tidak
 *        menjalankan perintah apa pun).
 *     2. Jika tidak terdeteksi terbuka dalam beberapa detik, jatuh ke
 *        editor web github.dev (VS Code untuk web, resmi dari GitHub).
 *
 *   Android
 *     Langsung diarahkan ke GitHub Codespaces (lingkungan dev di cloud)
 *     karena `vscode://` tidak reliabel di Android, dengan tautan
 *     cadangan ke panduan VPS.
 *
 *   iOS / lainnya
 *     Langsung ke github.dev (tidak ada aplikasi desktop untuk dicoba).
 *
 * Semua path di atas hanya melakukan NAVIGASI ke aplikasi/URL resmi.
 * Tidak ada skrip yang diunduh-lalu-dijalankan secara otomatis di sini.
 */
(function () {
  "use strict";

  const cfg = window.XAYZ_CONFIG;
  const btn = document.getElementById("btn-edit-publish");
  const modal = document.getElementById("editor-modal");
  const modalText = document.getElementById("editor-modal-text");
  const modalCancel = document.getElementById("editor-modal-cancel");
  if (!btn) return;

  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isDesktop = !isAndroid && !isIOS;

  function repoUrl(repo) {
    return `https://github.com/${repo}`;
  }
  function githubDevUrl(repo) {
    return `https://github.dev/${repo}`;
  }
  function codespacesUrl(repo) {
    return `https://github.com/codespaces/new?repo=${encodeURIComponent(repo)}`;
  }
  function vscodeCloneUri(repo) {
    return `vscode://vscode.git/clone?url=${encodeURIComponent(repoUrl(repo) + ".git")}`;
  }

  function showModal(text) {
    modalText.textContent = text;
    modal.hidden = false;
  }
  function hideModal() {
    modal.hidden = true;
  }
  modalCancel.addEventListener("click", hideModal);

  function openInNewTab(url) {
    window.open(url, "_blank", "noopener");
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    const repo = btn.dataset.repo || cfg.githubRepo;

    if (isAndroid) {
      showModal(
        "Perangkat Android terdeteksi — membuka GitHub Codespaces (editor cloud). " +
          "Jika Codespaces tidak tersedia untuk repo ini, gunakan panduan VPS di bagian “Jalankan di mana saja”."
      );
      setTimeout(() => {
        openInNewTab(codespacesUrl(repo));
        hideModal();
      }, 900);
      return;
    }

    if (isIOS) {
      showModal("Membuka github.dev (VS Code untuk web)…");
      setTimeout(() => {
        openInNewTab(githubDevUrl(repo));
        hideModal();
      }, 700);
      return;
    }

    // Desktop: try local VS Code app first via official vscode:// URI scheme.
    showModal("Mencoba membuka aplikasi VS Code di perangkat Anda…");

    let fellBack = false;
    const fallbackTimer = setTimeout(() => {
      if (fellBack) return;
      fellBack = true;
      showModal("VS Code lokal tidak terdeteksi — membuka github.dev sebagai gantinya…");
      setTimeout(() => {
        openInNewTab(githubDevUrl(repo));
        hideModal();
      }, 500);
    }, cfg.vscodeUriTimeoutMs || 1600);

    // If the tab loses visibility, that's a strong signal the OS handed off
    // control to the native VS Code app — cancel the web fallback.
    function onVisibilityChange() {
      if (document.hidden) {
        fellBack = true;
        clearTimeout(fallbackTimer);
        hideModal();
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Trigger the OS-level URI handler. Browsers show their own
    // "open VS Code?" confirmation for custom schemes — this is standard,
    // user-confirmed behavior, not a hidden action.
    window.location.href = vscodeCloneUri(repo);
  });
})();
