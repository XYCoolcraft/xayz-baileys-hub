#!/usr/bin/env bash
#
# download-all.sh
#
# Mengunduh SEMUA versi paket (lama & baru) langsung dari
# registry.npmjs.com, lalu mengekstraknya ke folder lokal:
#   @xayz/baileys/<versi>/
#
# Pemakaian:
#   bash scripts/download-all.sh
#   NPM_PACKAGE="@xayz/baileys" bash scripts/download-all.sh
#
# Skrip ini hanya memanggil `npm pack` / mengunduh tarball resmi dari
# npm registry dan mengekstraknya dengan `tar`. Tidak ada skrip pihak
# ketiga lain yang diambil atau dijalankan oleh berkas ini.

set -euo pipefail

PACKAGE_NAME="${NPM_PACKAGE:-@xayz/baileys}"
REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org}"
OUT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/${PACKAGE_NAME}"

command -v curl >/dev/null 2>&1 || { echo "Perlu 'curl' terpasang."; exit 1; }
command -v tar  >/dev/null 2>&1 || { echo "Perlu 'tar' terpasang.";  exit 1; }
command -v node >/dev/null 2>&1 || { echo "Perlu 'node' terpasang (untuk mem-parsing JSON registry)."; exit 1; }

ENCODED_NAME="$(node -e "console.log(encodeURIComponent(process.argv[1]).replace('%40','@'))" "$PACKAGE_NAME")"
META_URL="${REGISTRY}/${ENCODED_NAME}"

echo "==> Mengambil daftar versi dari: ${META_URL}"
META_JSON="$(curl -fsSL "$META_URL")"

# Ekstrak daftar "versi|tarball" memakai Node (tanpa dependensi jq).
VERSION_LINES="$(node -e '
  const data = JSON.parse(process.argv[1]);
  const versions = data.versions || {};
  for (const v of Object.keys(versions)) {
    const tarball = versions[v]?.dist?.tarball;
    if (tarball) console.log(`${v}|${tarball}`);
  }
' "$META_JSON")"

if [ -z "$VERSION_LINES" ]; then
  echo "Tidak ada versi ditemukan untuk ${PACKAGE_NAME}. Pastikan nama paket benar dan sudah dipublikasikan."
  exit 1
fi

mkdir -p "$OUT_ROOT"
echo "==> Menyimpan semua versi ke: ${OUT_ROOT}"

TOTAL=0
while IFS='|' read -r VERSION TARBALL; do
  [ -z "$VERSION" ] && continue
  DEST="${OUT_ROOT}/${VERSION}"
  if [ -d "$DEST" ]; then
    echo "  - v${VERSION} sudah ada, dilewati."
    continue
  fi
  echo "  - Mengunduh v${VERSION} ..."
  mkdir -p "$DEST"
  TMP_TARBALL="$(mktemp)"
  curl -fsSL "$TARBALL" -o "$TMP_TARBALL"
  tar -xzf "$TMP_TARBALL" -C "$DEST" --strip-components=1
  rm -f "$TMP_TARBALL"
  TOTAL=$((TOTAL + 1))
done <<< "$VERSION_LINES"

echo "==> Selesai. ${TOTAL} versi baru diunduh & diekstrak ke ${OUT_ROOT}"
