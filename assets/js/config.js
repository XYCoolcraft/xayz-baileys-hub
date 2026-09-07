/**
 * config.js
 * Ubah nilai di sini untuk menyesuaikan situs ke repo/package Anda sendiri.
 * Tidak ada nilai di sini yang memicu eksekusi kode jarak jauh —
 * semuanya hanya dipakai untuk membangun URL (npm registry, GitHub, dsb).
 */
window.XAYZ_CONFIG = {
  // Nama paket lengkap di npm, termasuk scope.
  npmPackage: "@xayz/baileys",

  // Endpoint registry publik npm (tidak butuh API key).
  npmRegistryBase: "https://registry.npmjs.org",

  // owner/repo GitHub yang menaungi source code paket ini.
  githubRepo: "XYCoolcraft/baileys",

  // Cabang default untuk tautan "Open in GitHub" / github.dev.
  githubBranch: "main",

  // Nama file skrip publikasi yang DITAMPILKAN sebagai pratinjau saja.
  // Situs ini TIDAK PERNAH mengunduh & menjalankan skrip ini secara otomatis.
  publishScriptUrl:
    "https://raw.githubusercontent.com/XYCoolcraft/baileys/main/publish-to-npm.sh",

  // Berapa lama (ms) mencoba membuka VS Code lokal sebelum jatuh ke fallback berikutnya.
  vscodeUriTimeoutMs: 1600,

  // Path folder di dalam repo GitHub yang berisi hasil ekstraksi tiap versi
  // (diisi otomatis oleh .github/workflows/extract-release.yml + scripts/download-all.sh).
  releasesFolderPath: "@xayz/baileys",

  // Endpoint publik npm untuk statistik unduhan (tanpa API key).
  npmDownloadsApiBase: "https://api.npmjs.org/downloads",

  // Tautan sosial media & profil. Isi urlWhatsapp sendiri saat sudah siap.
  social: {
    telegramContact: "https://t.me/XYCoolcrafts",
    telegramChannel: "https://t.me/XayTeam",
    youtube: "https://youtube.com/@XYCoolcraft",
    whatsappChannel: "https://whatsapp.com/channel/0029Vb8bNEvIiRp1J71Flc06", // TODO: isi URL channel WhatsApp Anda di sini
    github: "https://github.com/XYCoolcraft",
    npm: "https://www.npmjs.com/~xycoolcraft",
  },
};
