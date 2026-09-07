/**
 * particles.js — medan partikel bergelombang yang menyala, mengisi
 * SELURUH latar belakang halaman (bukan cuma hero), mirip nebula/AI-wave:
 * - node-node kecil terhubung oleh garis tipis yang bergoyang (gelombang sinus)
 * - lapisan "bokeh" tambahan: bola-bola cahaya lembut yang melayang naik
 *   perlahan, seperti kunang-kunang keemasan
 * Dibuat manual dengan canvas 2D, tanpa dependensi/CDN eksternal.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("wave-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width, height, dpr;
  let nodes = [];
  let bokeh = [];
  let mouse = { x: null, y: null, active: false };
  let t = 0;

  const ACCENT_A = [124, 108, 255]; // violet
  const ACCENT_B = [34, 211, 238]; // cyan
  const BOKEH_WARM = [245, 200, 110]; // lembut keemasan, seperti gambar referensi
  const LINK_DIST = 130;

  function docHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = docHeight();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    const density = width < 640 ? 26000 : width < 1100 ? 19000 : 15000;
    const count = Math.floor((width * height) / density);
    nodes = new Array(count).fill(0).map(() => ({
      baseX: Math.random() * width,
      baseY: Math.random() * height,
      x: 0,
      y: 0,
      r: Math.random() * 1.5 + 0.6,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.35 + 0.15,
      amp: Math.random() * 20 + 8,
      colorMix: Math.random(),
    }));

    const bokehCount = Math.floor((width * height) / 90000);
    bokeh = new Array(Math.max(bokehCount, 10)).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1.5,
      driftSpeed: Math.random() * 0.15 + 0.04,
      phase: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.3 + 0.1,
      swayAmp: Math.random() * 14 + 6,
      glow: Math.random() * 0.5 + 0.35,
    }));
  }

  function lerpColor(a, b, m) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * m),
      Math.round(a[1] + (b[1] - a[1]) * m),
      Math.round(a[2] + (b[2] - a[2]) * m),
    ];
  }

  function drawBokeh() {
    for (const p of bokeh) {
      p.y -= p.driftSpeed;
      if (p.y < -20) p.y = height + 20;
      const sway = Math.sin(t * p.swaySpeed + p.phase) * p.swayAmp;
      const x = p.x + sway;
      const glowNow = p.glow + Math.sin(t * 0.6 + p.phase) * 0.15;

      const grad = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r * 6);
      grad.addColorStop(0, `rgba(${BOKEH_WARM[0]},${BOKEH_WARM[1]},${BOKEH_WARM[2]},${glowNow * 0.55})`);
      grad.addColorStop(1, `rgba(${BOKEH_WARM[0]},${BOKEH_WARM[1]},${BOKEH_WARM[2]},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,240,210,${Math.min(glowNow + 0.25, 1)})`;
      ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    drawBokeh();

    for (const p of nodes) {
      const wave = Math.sin(t * p.speed + p.phase + p.baseX * 0.004) * p.amp;
      p.x = p.baseX;
      p.y = p.baseY + wave;

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const push = (140 - dist) / 140;
          p.x += (dx / (dist || 1)) * push * 14;
          p.y += (dy / (dist || 1)) * push * 14;
        }
      }
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const d = Math.sqrt(d2);
          const alpha = (1 - d / LINK_DIST) * 0.14;
          const c = lerpColor(ACCENT_A, ACCENT_B, (a.colorMix + b.colorMix) / 2);
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of nodes) {
      const c = lerpColor(ACCENT_A, ACCENT_B, p.colorMix);
      const glow = 0.5 + Math.sin(t * p.speed + p.phase) * 0.25;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${glow})`;
      ctx.arc(p.x, p.y, p.r * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    t += 0.014;
    if (!prefersReducedMotion) requestAnimationFrame(step);
  }

  let resizeTimer = null;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    },
    { passive: true }
  );

  // Re-measure after content/fonts settle (page height can grow late).
  window.addEventListener("load", () => setTimeout(resize, 300));

  window.addEventListener(
    "pointermove",
    (e) => {
      mouse.x = e.clientX + window.scrollY * 0 + (window.scrollX || 0) * 0;
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
      mouse.active = true;
    },
    { passive: true }
  );
  window.addEventListener("pointerleave", () => (mouse.active = false));

  resize();
  if (prefersReducedMotion) {
    step();
  } else {
    requestAnimationFrame(step);
  }
})();
