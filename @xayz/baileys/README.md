# Folder rilis terekstrak

Folder ini akan otomatis terisi subfolder per versi (mis. `1.0.0/`,
`6.1.0/`, dst.) berisi isi paket `@xayz/baileys` yang sudah diekstrak dari
tarball resmi npm, begitu Anda:

- menjalankan `bash scripts/download-all.sh` secara manual, atau
- membiarkan workflow `.github/workflows/extract-release.yml` berjalan
  (otomatis setelah workflow `track-release.yml` menemukan versi baru).

Panel **"Jelajahi sumber" → "Rilis terekstrak"** di `index.html` membaca
folder ini langsung lewat GitHub Contents API — jadi begitu subfolder versi
ada di sini dan ter-push ke GitHub, panel itu (dan tombol GH/npm di tiap
kartu versi) langsung berfungsi menunjuk ke isi yang sebenarnya.
