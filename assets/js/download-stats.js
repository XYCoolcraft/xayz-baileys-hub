/**
 * download-stats.js
 *
 * Menampilkan statistik unduhan NYATA dari endpoint publik npm
 * (api.npmjs.org) — total unduhan & grafik batang per hari (30 hari
 * terakhir), tanpa API key.
 *
 * CATATAN JUJUR: npm TIDAK menyediakan API publik untuk "jumlah unduhan
 * per versi". Endpoint publik (api.npmjs.org/downloads/...) hanya
 * menghitung total unduhan per PAKET per hari, tergabung dari semua versi.
 * Supaya tidak menampilkan angka karangan, kartu versi menautkan ke
 * npm-stat.com — alat pihak ketiga yang memang dibuat untuk membedah
 * unduhan per versi dari data registry npm — alih-alih menampilkan
 * angka per-versi palsu di sini.
 */
(function () {
  "use strict";

  const cfg = window.XAYZ_CONFIG;
  const totalEl = document.getElementById("stat-downloads-total");
  const chartEl = document.getElementById("downloads-chart");
  const chartNote = document.getElementById("downloads-chart-note");

  // Diisi setelah fetch selesai; dibaca oleh app.js saat merender kartu versi.
  // Bentuk: { "1.2.3": 42, "1.2.2": 7, ... } — unduhan 7 hari terakhir per versi.
  // Endpoint ini publik tapi tidak resmi didokumentasikan npm; jika suatu saat
  // berhenti bekerja, kartu versi cukup menyembunyikan angka & tetap
  // menautkan ke npm-stat.com (lihat app.js).
  window.XAYZ_VERSION_DOWNLOADS = null;

  function fmtCompact(n) {
    return new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n);
  }

  async function loadPerVersionDownloads() {
    const url = `https://api.npmjs.org/versions/${cfg.npmPackage}/last-week`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`api.npmjs.org merespons ${res.status}`);
      const data = await res.json();
      window.XAYZ_VERSION_DOWNLOADS = data.downloads || {};
      window.dispatchEvent(new CustomEvent("xayz:version-downloads-ready"));
    } catch (err) {
      console.error("Gagal memuat unduhan per-versi:", err);
      window.XAYZ_VERSION_DOWNLOADS = {};
    }
  }
  loadPerVersionDownloads();

  async function loadDownloads() {
    const pkgPath = cfg.npmPackage; // "/" pada scope didukung langsung oleh API ini
    const url = `${cfg.npmDownloadsApiBase}/range/last-month/${pkgPath}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`api.npmjs.org merespons ${res.status}`);
      const data = await res.json();
      const days = data.downloads || [];
      renderChart(days);
      const total = days.reduce((sum, d) => sum + (d.downloads || 0), 0);
      if (totalEl) totalEl.textContent = fmtCompact(total);
    } catch (err) {
      console.error(err);
      if (totalEl) totalEl.textContent = "—";
      if (chartNote) {
        chartNote.textContent =
          "Statistik unduhan belum bisa diambil saat ini (mungkin paket belum ada trafik, atau api.npmjs.org tidak terjangkau).";
      }
    }
  }

  function renderChart(days) {
    if (!chartEl || !days.length) return;
    const last30 = days.slice(-30);
    const max = Math.max(...last30.map((d) => d.downloads), 1);

    const barsHtml = last30
      .map((d) => {
        const h = Math.max(2, Math.round((d.downloads / max) * 100));
        const date = new Date(d.day).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
        return `<div class="bar-chart__bar" style="height:${h}%" title="${date}: ${d.downloads.toLocaleString(
          "id-ID"
        )} unduhan"></div>`;
      })
      .join("");

    chartEl.innerHTML = barsHtml;
  }

  loadDownloads();
})();
