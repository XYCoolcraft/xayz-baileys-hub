# xayz-web

Etalase rilis statis untuk **`@xayz/baileys`** — hero dengan bola partikel 3D
berputar + latar bergelombang menyala di seluruh halaman, daftar versi live
dari npm, statistik unduhan nyata, penjelajah kode dua-mode (Source /
Rilis terekstrak) bergaya editor dengan ikon per jenis berkas, dan panel
konsol pratinjau skrip publikasi npm.

## Struktur folder

```
xayz-web/
├── index.html
├── assets/
│   ├── css/style.css
│   ├── vendor/highlightjs/          # highlight.js di-bundle sendiri (tanpa CDN)
│   └── js/
│       ├── config.js                 # repo, paket npm, & tautan sosial di sini
│       ├── file-icons.js             # ikon SVG ala VS Code per jenis berkas
│       ├── particles.js              # medan partikel + bokeh di SELURUH halaman
│       ├── particle-sphere.js        # bola partikel 3D berputar di hero
│       ├── download-stats.js         # statistik unduhan nyata dari api.npmjs.org
│       ├── app.js                    # rilis + file browser dua-mode + console preview
│       └── editor-redirect.js        # fallback "Edit & Publish"
├── data/versions.json                # cache versi (diisi Actions)
├── scripts/
│   ├── fetch-versions.js             # Node v24 CJS — tarik metadata npm registry
│   └── download-all.sh               # unduh & ekstrak SEMUA versi ke @xayz/baileys/<versi>/
├── .github/workflows/
│   ├── track-release.yml             # cek versi baru tiap 5 menit
│   ├── extract-release.yml           # auto-ekstrak versi baru ke @xayz/baileys/ & commit
│   └── deploy-pages.yml              # auto-deploy ke GitHub Pages
├── server.js                         # server statis Node v24 CJS (untuk VPS)
├── vercel.json                       # konfigurasi Vercel (free tier)
└── package.json
```

## Menjalankan lokal

```bash
node server.js
# buka http://localhost:3000
```

## Konfigurasi (`assets/js/config.js`)

```js
window.XAYZ_CONFIG = {
  npmPackage: "@xayz/baileys",
  githubRepo: "XYCoolcraft/baileys",
  githubBranch: "main",
  releasesFolderPath: "@xayz/baileys",   // folder hasil ekstraksi di repo
  social: {
    telegramContact: "https://t.me/XYCoolcrafts",
    telegramChannel: "https://t.me/XayTeam",
    youtube: "https://youtube.com/@XYCoolcraft",
    whatsappChannel: "",                  // isi URL channel WhatsApp Anda
    github: "https://github.com/XYCoolcraft",
    npm: "https://www.npmjs.com/~xycoolcraft",
  },
};
```

## Folder rilis terekstrak (`@xayz/baileys/<versi>/`)

`scripts/download-all.sh` mengunduh tarball resmi tiap versi dari
`registry.npmjs.com` dan mengekstraknya ke `@xayz/baileys/<versi>/` di repo
ini. Workflow `extract-release.yml` menjalankannya otomatis setiap kali
`track-release.yml` menemukan versi baru, lalu meng-commit folder yang baru
diekstrak. Karena folder ini sungguhan ada di repo, panel **"Jelajahi
sumber" → "Rilis terekstrak"** di halaman utama bisa membacanya langsung
lewat GitHub Contents API, dan tombol **GH** / **npm** di tiap folder versi
langsung menunjuk ke lokasi yang benar.

> ⚠️ **Soal ukuran repo**: mengekstrak & meng-commit setiap versi
> memperbesar repo dari waktu ke waktu. Untuk paket dengan banyak rilis,
> pertimbangkan Git LFS, atau batasi `download-all.sh` agar hanya menyimpan
> beberapa versi terbaru.

## Statistik unduhan

- **Total 30 hari (grafik batang)** — dari `api.npmjs.org/downloads/range/last-month/...`.
- **Unduhan per versi (badge `↓ N /7 hari`)** — dari endpoint publik
  `api.npmjs.org/versions/<package>/last-week`. Endpoint ini nyata dan
  dipakai npmjs.com sendiri untuk menampilkan breakdown per versi di
  halaman paket, tapi **tidak resmi didokumentasikan** dan **hanya
  menyimpan 7 hari terakhir** — karena itu tiap kartu juga menautkan ke
  [npm-stat.com](https://npm-stat.com) untuk riwayat per-versi yang lebih
  panjang. Jika endpoint ini suatu saat berhenti berfungsi, badge otomatis
  menampilkan "…" alih-alih angka yang salah.

## Kode berwarna (syntax highlighting)

`highlight.js` di-bundle sendiri ke `assets/vendor/highlightjs/` (lihat
`LICENSE` di folder itu) alih-alih dimuat dari CDN publik — jadi pewarnaan
kode tetap berfungsi walau CDN pihak ketiga diblokir di jaringan/hosting
Anda.

## Deploy

| Target | Cara |
|---|---|
| **GitHub Pages** (gratis) | Push ke `main` — `deploy-pages.yml` otomatis publish. |
| **Vercel** (free tier) | Import repo, `vercel.json` sudah disiapkan. |
| **VPS** | `node server.js` (Node.js v24, tanpa dependensi lain). |
| **Serverless generik** | Situs 100% statis — unggah folder ini ke origin statis apa pun. |

## Tombol "Edit & Publish" — rantai fallback

1. **Desktop**: coba buka VS Code lokal via `vscode://vscode.git/clone?...`
   → jika tak terdeteksi, jatuh ke **github.dev**.
2. **Android**: langsung ke **GitHub Codespaces**, dengan referensi ke
   panduan VPS sebagai cadangan.
3. **iOS**: langsung ke **github.dev**.
4. **Offline / non-GitHub**: panel "Jelajahi sumber" menampilkan seluruh
   struktur repo & folder rilis apa adanya, tanpa perlu mengunduh arsip zip.

## Batasan keamanan yang sengaja diterapkan

Situs ini **tidak** menyertakan terminal shell publik yang mengeksekusi
perintah sungguhan, editor publik yang auto-menulis+publish ke npm, atau
tombol yang menjalankan `curl | bash` secara otomatis. Panel "Console
publikasi" hanya menampilkan **pratinjau teks** skrip publikasi — Anda
tetap yang menjalankannya secara manual setelah meninjaunya. Ini mencegah
situs statis publik menjadi vektor supply-chain attack.
