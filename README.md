# xayz-web

Etalase rilis statis untuk **`@xayz/baileys`** — hero dengan animasi partikel
bergelombang, daftar versi yang diambil langsung dari `registry.npmjs.com`,
penjelajah kode (read-only) dengan pewarnaan sintaksis, dan panel konsol
pratinjau skrip publikasi npm.

## Struktur folder

```
xayz-web/
├── index.html                     # Halaman utama
├── assets/
│   ├── css/style.css              # Tema gelap premium + IDE + hero
│   └── js/
│       ├── config.js              # Ubah repo/paket di sini
│       ├── particles.js           # Animasi bola partikel bergelombang
│       ├── app.js                 # Fetch npm registry + file browser + console preview
│       └── editor-redirect.js     # Fallback "Edit & Publish" (lihat bawah)
├── data/versions.json             # Cache versi (diisi otomatis oleh Actions)
├── scripts/
│   ├── fetch-versions.js          # Node v24 CJS — tarik metadata dari npm registry
│   └── download-all.sh            # Unduh & ekstrak SEMUA versi (lama & baru)
├── .github/workflows/
│   ├── track-release.yml          # Auto-cek versi baru tiap 6 jam
│   └── deploy-pages.yml           # Auto-deploy ke GitHub Pages
├── server.js                      # Server statis Node v24 CJS (untuk VPS)
├── vercel.json                    # Konfigurasi Vercel (free tier)
└── package.json
```

## Menjalankan lokal

```bash
node server.js
# buka http://localhost:3000
```

Ubah paket/repo target di `assets/js/config.js`:

```js
window.XAYZ_CONFIG = {
  npmPackage: "@xayz/baileys",
  githubRepo: "XYCoolcraft/baileys",
  githubBranch: "main",
  publishScriptUrl: "https://raw.githubusercontent.com/XYCoolcraft/baileys/main/publish-to-npm.sh",
};
```

## Mengunduh semua versi (lama & baru) ke lokal

```bash
bash scripts/download-all.sh
# hasil: ./@xayz/baileys/<versi>/...
```

## Deploy

| Target | Cara |
|---|---|
| **GitHub Pages** (gratis) | Push ke `main` — workflow `deploy-pages.yml` otomatis publish. |
| **Vercel** (free tier) | Import repo di Vercel, `vercel.json` sudah disiapkan. |
| **VPS** | `node server.js` (butuh Node.js v24, tanpa dependensi lain). |
| **Serverless generik** | Situs 100% statis — unggah folder ini sebagai origin statis apa pun (S3+CloudFront, Netlify, Cloudflare Pages, dll). |

## Tombol "Edit & Publish" — rantai fallback

1. **Desktop** (Windows/macOS/Linux): mencoba membuka aplikasi **VS Code lokal**
   lewat skema resmi `vscode://vscode.git/clone?...`. Browser akan menampilkan
   dialog konfirmasi bawaan sebelum membuka aplikasi apa pun — ini perilaku
   standar OS, bukan aksi tersembunyi.
2. Jika VS Code lokal tidak terdeteksi dalam ~1.6 detik → otomatis membuka
   **github.dev** (VS Code untuk web, resmi dari GitHub) di tab baru.
3. **Android**: langsung diarahkan ke **GitHub Codespaces** (editor cloud),
   dengan referensi ke panduan VPS di bagian "Jalankan di mana saja" sebagai
   cadangan.
4. **iOS**: langsung ke **github.dev** (tidak ada aplikasi desktop yang bisa dicoba).
5. **Selain GitHub / offline**: gunakan panel "Jelajahi sumber" di halaman
   ini — panel tersebut sudah menampilkan seluruh struktur repo dalam bentuk
   "terekstrak" (per-berkas, bisa dibaca langsung) tanpa perlu mengunduh arsip
   zip terlebih dahulu.

## Batasan keamanan yang sengaja diterapkan

Situs ini **tidak** menyertakan:

- Terminal shell publik yang mengeksekusi perintah sungguhan di server.
- Editor kode publik yang bisa langsung menulis balik ke repo/publish otomatis.
- Tombol yang menjalankan `curl | bash` atau skrip eksternal apa pun secara otomatis.

Panel "Console publikasi" hanya **menampilkan pratinjau teks** dari skrip
publikasi (`publish-to-npm.sh`) agar Anda bisa meninjaunya — Anda tetap yang
menjalankannya secara manual, di terminal Anda sendiri, setelah membacanya.
Ini untuk mencegah situs statis publik menjadi vektor supply-chain attack
(mengeksekusi kode dari internet secara otomatis, atau mengizinkan siapa pun
menulis & mem-publish kode ke npm tanpa peninjauan manusia).
