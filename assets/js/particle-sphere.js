/**
 * particle-sphere.js — bola yang tersusun dari titik-titik cahaya,
 * berputar perlahan, gradasi violet → cyan dengan glow lembut.
 * Proyeksi 3D → 2D dibuat manual (rotasi + perspektif sederhana),
 * tanpa WebGL/Three.js, supaya ringan dan tanpa dependensi eksternal.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("hero-sphere");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let size, dpr, radius;
  let points = [];
  let angleY = 0;
  let angleX = 0.28;
  let dragging = false;
  let lastPointer = null;
  let autoSpin = true;

  const COLOR_TOP = [255, 90, 190]; // magenta
  const COLOR_BOTTOM = [70, 140, 255]; // biru

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    size = Math.min(rect.width, 420);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = size * 0.36;
  }

  // Titik-titik disusun sebagai grid lintang/bujur (seperti globe),
  // supaya terlihat rapi berbaris — bukan acak.
  function buildPoints() {
    points = [];
    const latSteps = 22;
    const lonSteps = 34;
    for (let i = 0; i <= latSteps; i++) {
      const lat = (Math.PI * i) / latSteps - Math.PI / 2; // -90..90
      const y = Math.sin(lat);
      const ringR = Math.cos(lat);
      const stepsHere = Math.max(6, Math.round(lonSteps * ringR));
      for (let j = 0; j < stepsHere; j++) {
        const lon = (2 * Math.PI * j) / stepsHere;
        points.push({
          x0: ringR * Math.cos(lon),
          y0: y,
          z0: ringR * Math.sin(lon),
          tw: Math.random() * Math.PI * 2, // fase kedip
        });
      }
    }
  }

  function lerp(a, b, m) {
    return a + (b - a) * m;
  }
  function lerpColor(a, b, m) {
    return [lerp(a[0], b[0], m), lerp(a[1], b[1], m), lerp(a[2], b[2], m)];
  }

  function project(p) {
    // rotasi Y
    let x = p.x0 * Math.cos(angleY) - p.z0 * Math.sin(angleY);
    let z = p.x0 * Math.sin(angleY) + p.z0 * Math.cos(angleY);
    let y = p.y0;
    // rotasi X (kemiringan)
    let y2 = y * Math.cos(angleX) - z * Math.sin(angleX);
    let z2 = y * Math.sin(angleX) + z * Math.cos(angleX);

    const perspective = 2.6;
    const scale = perspective / (perspective - z2 * 0.9);
    return {
      x: x * radius * scale,
      y: y2 * radius * scale,
      z: z2,
      scale,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    const projected = points.map((p) => ({ p, proj: project(p) }));
    projected.sort((a, b) => a.proj.z - b.proj.z); // belakang dulu

    for (const { p, proj } of projected) {
      const depth = (proj.z + 1) / 2; // 0 belakang .. 1 depan
      if (depth < 0.02) continue;

      const heightMix = (p.y0 + 1) / 2; // untuk gradasi warna atas/bawah
      const c = lerpColor(COLOR_TOP, COLOR_BOTTOM, heightMix);
      const twinkle = 0.65 + Math.sin(angleY * 40 + p.tw) * 0.2;
      const alpha = Math.max(0, depth * twinkle);
      const r = Math.max(0.5, 1.7 * proj.scale * depth);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
      ctx.arc(cx + proj.x, cy + proj.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // glow lembut di belakang bola
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.5);
    grad.addColorStop(0, "rgba(124,108,255,0.10)");
    grad.addColorStop(1, "rgba(124,108,255,0)");
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  function loop() {
    if (autoSpin) angleY += 0.0035;
    draw();
    if (!prefersReducedMotion) requestAnimationFrame(loop);
  }

  // interaksi ringan: drag untuk memutar manual
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    autoSpin = false;
    lastPointer = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging || !lastPointer) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    angleY += dx * 0.006;
    angleX = Math.max(-1.3, Math.min(1.3, angleX + dy * 0.006));
    lastPointer = { x: e.clientX, y: e.clientY };
    if (prefersReducedMotion) draw();
  });
  window.addEventListener("pointerup", () => {
    dragging = false;
    setTimeout(() => (autoSpin = true), 2200);
  });

  window.addEventListener("resize", () => {
    resize();
    draw();
  }, { passive: true });

  resize();
  buildPoints();
  if (prefersReducedMotion) {
    draw();
  } else {
    requestAnimationFrame(loop);
  }
})();
