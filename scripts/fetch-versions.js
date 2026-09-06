/**
 * fetch-versions.js — Node.js v24, CommonJS.
 *
 * Mengambil metadata versi dari registry.npmjs.com untuk paket yang
 * dikonfigurasi, lalu menuliskannya ke data/versions.json. Dipakai oleh
 * workflow GitHub Actions (.github/workflows/track-release.yml) supaya
 * repo punya jejak versi ter-cache meski registry sedang tidak bisa
 * diakses langsung dari browser pengguna.
 *
 * Jalankan manual:
 *   node scripts/fetch-versions.js
 *
 * Skrip ini HANYA membaca metadata publik lewat HTTPS GET.
 * Tidak ada file dieksekusi, tidak ada perintah shell dijalankan.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");

const PACKAGE_NAME = process.env.NPM_PACKAGE || "@xayz/baileys";
const REGISTRY = "https://registry.npmjs.org";
const OUT_FILE = path.join(__dirname, "..", "data", "versions.json");

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "xayz-web-tracker" } }, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} untuk ${url}`));
          return;
        }
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const url = `${REGISTRY}/${encodeURIComponent(PACKAGE_NAME).replace("%40", "@")}`;
  console.log(`Mengambil metadata dari ${url} ...`);

  let data;
  try {
    data = await httpGetJson(url);
  } catch (err) {
    console.error(`Gagal mengambil metadata: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const versions = Object.keys(data.versions || {}).map((v) => {
    const meta = data.versions[v];
    return {
      version: v,
      date: data.time ? data.time[v] : null,
      tarball: meta?.dist?.tarball || null,
      shasum: meta?.dist?.shasum || null,
    };
  });

  versions.sort((a, b) => (a.date < b.date ? 1 : -1));

  const output = {
    package: PACKAGE_NAME,
    latest: (data["dist-tags"] || {}).latest || null,
    fetchedAt: new Date().toISOString(),
    versions,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`Ditulis ${versions.length} versi ke ${OUT_FILE}`);
}

main();
