/* The Long Table — visual effects: particles, the candle-light cursor, shakes, splats. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util;
  const FX = (LT.fx = {});
  const RM = U.reducedMotion;
  const PALETTE = ['#f2c14e', '#e0662f', '#b8243d', '#8b9467', '#c98a3a', '#7d1a2c', '#efe6d2'];
  FX.palette = PALETTE;

  let cv, cx, W = 0, H = 0, DPR = 1;
  const parts = [];
  const emitters = new Set();

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  FX.mount = function (canvas, glass) {
    cv = canvas; cx = cv.getContext('2d');
    FX.glass = glass;
    resize();
    addEventListener('resize', resize);
    LT.loop.add(update);
  };

  // A maple-ish leaf, drawn around (0,0), radius ~1.
  const leafPath = (() => {
    if (typeof Path2D === 'undefined') return null;
    const p = new Path2D();
    const pts = [[0, -1], [0.18, -0.55], [0.55, -0.72], [0.45, -0.3], [0.95, -0.25], [0.6, 0.05], [0.75, 0.35], [0.3, 0.25], [0.08, 0.55], [0.06, 0.95], [-0.06, 0.95], [-0.08, 0.55], [-0.3, 0.25], [-0.75, 0.35], [-0.6, 0.05], [-0.95, -0.25], [-0.45, -0.3], [-0.55, -0.72], [-0.18, -0.55]];
    pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
    p.closePath();
    return p;
  })();
  const featherPath = (() => {
    if (typeof Path2D === 'undefined') return null;
    const p = new Path2D();
    p.moveTo(0, -1); p.bezierCurveTo(0.45, -0.6, 0.35, 0.4, 0.05, 1); p.lineTo(-0.05, 1); p.bezierCurveTo(-0.35, 0.4, -0.45, -0.6, 0, -1); p.closePath();
    return p;
  })();

  function add(p) {
    if (parts.length > (RM ? 250 : 1400)) parts.shift();
    p.life = 0;
    p.max = p.max || 1.5;
    p.rot = p.rot ?? U.rand(Math.PI * 2);
    p.vr = p.vr ?? 0;
    p.drag = p.drag ?? 0.985;
    p.ay = p.ay ?? 0;
    p.ax = p.ax ?? 0;
    p.alpha = p.alpha ?? 1;
    p.size2 = p.size2 ?? p.size;
    parts.push(p);
    return p;
  }

  let wasEmpty = true;
  function update(dt) {
    if (!cx) return;
    emitters.forEach((e) => e(dt));
    if (!parts.length) { if (!wasEmpty) { cx.clearRect(0, 0, W, H); wasEmpty = true; } return; }
    wasEmpty = false;
    cx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1 || p.y > H + 120 || p.y < -400) { parts.splice(i, 1); continue; }
      p.vx += p.ax * dt; p.vy += p.ay * dt;
      const d = Math.pow(p.drag, dt * 60);
      p.vx *= d; p.vy *= d;
      if (p.flutter) { p.vx += Math.sin(p.life * p.flutter + p.seed) * 40 * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const fade = p.fadeIn ? Math.min(1, p.life / p.fadeIn) : 1;
      const a = p.alpha * fade * (p.keep ? (k < 0.8 ? 1 : (1 - k) / 0.2) : 1 - k);
      const s = U.lerp(p.size, p.size2, k);
      if (a <= 0.003 || s <= 0) continue;
      cx.globalAlpha = a;
      cx.globalCompositeOperation = p.blend || 'source-over';
      draw(p, s, k);
    }
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'source-over';
  }

  function draw(p, s, k) {
    const c = cx;
    switch (p.shape) {
      case 'leaf':
      case 'feather': {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        c.scale(s * Math.cos(p.life * (p.spin || 3) + p.seed), s);
        c.fillStyle = p.color; c.fill(p.shape === 'leaf' ? leafPath : featherPath);
        if (p.shape === 'leaf') { c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 0.06; c.beginPath(); c.moveTo(0, -0.8); c.lineTo(0, 0.95); c.stroke(); }
        c.restore();
        break;
      }
      case 'rect': {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        c.scale(1, Math.cos(p.life * (p.spin || 8) + p.seed));
        c.fillStyle = p.color; c.fillRect(-s / 2, -s / 4, s, s / 2);
        c.restore();
        break;
      }
      case 'spark': {
        const len = Math.min(30, Math.hypot(p.vx, p.vy) * 0.04 + 2);
        const ang = Math.atan2(p.vy, p.vx);
        c.strokeStyle = p.color; c.lineWidth = s; c.lineCap = 'round';
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - Math.cos(ang) * len, p.y - Math.sin(ang) * len); c.stroke();
        break;
      }
      case 'smoke': {
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
        g.addColorStop(0, p.color); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, s, 0, Math.PI * 2); c.fill();
        break;
      }
      case 'glow': {
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
        g.addColorStop(0, p.color); g.addColorStop(0.35, p.color2 || 'rgba(255,170,60,.35)'); g.addColorStop(1, 'rgba(255,140,40,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, s, 0, Math.PI * 2); c.fill();
        break;
      }
      case 'text': {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot || 0);
        c.font = p.font || `700 ${s}px ${getComputedStyle(document.documentElement).getPropertyValue('--f-hand')}`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        if (p.stroke) { c.lineWidth = 5; c.strokeStyle = p.stroke; c.lineJoin = 'round'; c.strokeText(p.text, 0, 0); }
        c.fillStyle = p.color; c.fillText(p.text, 0, 0);
        c.restore();
        break;
      }
      case 'drop': {
        c.fillStyle = p.color; c.beginPath(); c.ellipse(p.x, p.y, s * 0.7, s, Math.atan2(p.vy, p.vx) + Math.PI / 2, 0, Math.PI * 2); c.fill();
        break;
      }
      case 'star': {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        c.fillStyle = p.color; c.beginPath();
        for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.35 : s; const a = (i / 8) * Math.PI * 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        c.closePath(); c.fill(); c.restore();
        break;
      }
      default: {
        c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, s, 0, Math.PI * 2); c.fill();
      }
    }
  }

  /* ---------- public emitters ---------- */
  FX.burst = (x, y, o = {}) => {
    const n = Math.round((o.count ?? 30) * (RM ? 0.3 : 1));
    for (let i = 0; i < n; i++) {
      const a = (o.angle ?? -Math.PI / 2) + U.rand(-1, 1) * (o.spread ?? Math.PI);
      const sp = U.rand(o.speed?.[0] ?? 80, o.speed?.[1] ?? 420);
      add({
        x: x + U.rand(-(o.jitter || 0), o.jitter || 0), y: y + U.rand(-(o.jitter || 0), o.jitter || 0),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        ay: o.gravity ?? 600, drag: o.drag ?? 0.98,
        size: U.rand(o.size?.[0] ?? 2, o.size?.[1] ?? 5), size2: o.shrink === false ? undefined : 0,
        color: Array.isArray(o.colors) ? U.pick(o.colors) : o.color || U.pick(PALETTE),
        shape: o.shape || 'circle', max: U.rand(o.life?.[0] ?? 0.6, o.life?.[1] ?? 1.4),
        vr: U.rand(-8, 8), seed: U.rand(10), blend: o.blend, keep: o.keep, spin: o.spin,
      });
    }
  };
  FX.sparks = (x, y, n = 24, o = {}) => FX.burst(x, y, Object.assign({ count: n, shape: 'spark', colors: ['#ffd27a', '#ffb347', '#fff1c2', '#ff8a3c'], speed: [120, 520], gravity: 500, size: [1, 2.2], life: [0.25, 0.8], blend: 'lighter' }, o));
  FX.confetti = (x, y, o = {}) => {
    const n = Math.round((o.count ?? 110) * (RM ? 0.3 : 1));
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + U.rand(-1, 1) * (o.spread ?? 1.1), sp = U.rand(300, 900);
      const shape = o.shapes ? U.pick(o.shapes) : Math.random() < 0.55 ? 'leaf' : 'rect';
      add({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 520, drag: 0.955,
        size: shape === 'leaf' ? U.rand(6, 12) : U.rand(6, 11), color: U.pick(o.colors || PALETTE),
        shape, max: U.rand(2.4, 4.2), keep: true, vr: U.rand(-3, 3), seed: U.rand(10), spin: U.rand(2, 7), flutter: U.rand(2, 5),
      });
    }
  };
  let leafRate = 0, emberRate = 0, leafAcc = 0, emberAcc = 0;
  emitters.add((dt) => {
    leafAcc += dt * leafRate * (RM ? 0.3 : 1);
    while (leafAcc > 1) {
      leafAcc--;
      add({ x: U.rand(-40, W + 40), y: -30, vx: U.rand(-20, 40), vy: U.rand(40, 90), drag: 1, size: U.rand(7, 15), shape: 'leaf',
        color: U.pick(['#b8571f', '#c98a3a', '#8a2a1c', '#d9a441', '#6d3b1a', '#9b4a1d']), max: 16, keep: true, vr: U.rand(-1.4, 1.4), seed: U.rand(10), spin: U.rand(1, 3), flutter: U.rand(1, 2.5), alpha: U.rand(0.55, 0.95) });
    }
    emberAcc += dt * emberRate * (RM ? 0.3 : 1);
    while (emberAcc > 1) {
      emberAcc--;
      add({ x: U.rand(0, W), y: H + 10, vx: U.rand(-15, 15), vy: U.rand(-70, -30), drag: 1, size: U.rand(1, 2.6), shape: 'circle', color: U.pick(['#ffb347', '#ffd27a', '#ff8a3c']), max: U.rand(6, 12), flutter: U.rand(1, 3), seed: U.rand(10), blend: 'lighter', alpha: U.rand(0.4, 0.9) });
    }
  });
  FX.leaves = (rate = 3) => { leafRate = rate; };
  FX.embers = (rate = 4) => { emberRate = rate; };
  FX.smoke = (x, y, o = {}) => {
    const n = o.count ?? 10;
    for (let i = 0; i < n; i++) add({ x: x + U.rand(-6, 6), y: y + U.rand(-4, 4), vx: U.rand(-14, 14) + (o.wind || 0), vy: U.rand(-60, -25), drag: 0.99, size: U.rand(6, 12), size2: U.rand(40, 80) * (o.scale || 1), shape: 'smoke', color: o.color || 'rgba(190,180,165,.22)', max: U.rand(1.6, 3.2), flutter: 2, seed: U.rand(10), fadeIn: 0.2 });
  };
  FX.steam = (x, y, o = {}) => FX.smoke(x, y, Object.assign({ color: 'rgba(240,232,215,.12)', count: 3, scale: 0.6 }, o));
  FX.float = (x, y, text, o = {}) => add({ x, y, vx: U.rand(-10, 10), vy: o.vy ?? -70, drag: 0.98, size: o.size || 30, shape: 'text', text, color: o.color || '#f2c14e', stroke: o.stroke ?? 'rgba(20,14,8,.85)', max: o.life || 1.6, keep: true, rot: o.rot ?? U.rand(-0.12, 0.12), vr: 0, font: o.font });
  FX.glow = (x, y, o = {}) => add({ x, y, vx: 0, vy: 0, size: o.size || 60, size2: o.size2 ?? (o.size || 60) * 2, shape: 'glow', color: o.color || 'rgba(255,220,150,.9)', max: o.life || 0.8, blend: 'lighter' });
  FX.add = add;
  FX.clear = () => { parts.length = 0; leafRate = 0; emberRate = 0; };

  /* ---------- screen shake & flash ---------- */
  let shakeT = 0, shakeAmt = 0, shakeDur = 0;
  FX.shake = (amount = 12, seconds = 0.5) => {
    if (RM) return;
    shakeAmt = Math.max(shakeAmt * (1 - shakeT / Math.max(shakeDur, 0.001)), amount); shakeDur = seconds; shakeT = 0;
  };
  LT.loop.add((dt) => {
    const st = document.getElementById('stage');
    if (!st) return;
    if (shakeT < shakeDur) {
      shakeT += dt;
      const k = 1 - shakeT / shakeDur, a = shakeAmt * k * k;
      st.style.transform = `translate(${U.rand(-a, a).toFixed(1)}px, ${U.rand(-a, a).toFixed(1)}px) rotate(${U.rand(-a, a) * 0.04}deg)`;
      if (shakeT >= shakeDur) st.style.transform = '';
    }
  });
  FX.flash = (color = '#fff6e0', seconds = 0.35) => {
    const f = U.el('div', { class: 'fx-flash', style: { background: color } });
    document.body.appendChild(f);
    f.animate([{ opacity: RM ? 0.3 : 0.9 }, { opacity: 0 }], { duration: seconds * 1000, easing: 'ease-out' }).onfinish = () => f.remove();
  };

  /* ---------- splats on the glass ---------- */
  FX.splat = (x, y, o = {}) => {
    if (!FX.glass) return;
    const size = o.size || U.rand(70, 140), color = o.color || '#6b3f1d';
    const rnd = U.seeded(Math.floor(Math.random() * 1e9));
    const pts = [], n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, r = 0.55 + rnd() * 0.45 + (rnd() < 0.25 ? rnd() * 0.5 : 0);
      pts.push([Math.cos(a) * r * 50 + 60, Math.sin(a) * r * 50 + 60]);
    }
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n; i++) {
      const p1 = pts[(i + 1) % n], p0 = pts[i];
      d += ` Q${p0[0]},${p0[1]} ${(p0[0] + p1[0]) / 2},${(p0[1] + p1[1]) / 2}`;
    }
    const svg = U.svg('svg', { viewBox: '0 0 120 200', class: 'fx-splat', style: `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size * 1.666}px` });
    svg.appendChild(U.svg('path', { d: d + 'Z', fill: color }));
    for (let i = 0; i < 6; i++) {
      const a = rnd() * Math.PI * 2, r = 55 + rnd() * 20;
      svg.appendChild(U.svg('circle', { cx: 60 + Math.cos(a) * r, cy: 60 + Math.sin(a) * r, r: 2 + rnd() * 5, fill: color }));
    }
    for (let i = 0; i < 3; i++) {
      const dx = 35 + rnd() * 50, len = 30 + rnd() * 80, w = 3 + rnd() * 5;
      const drip = U.svg('rect', { x: dx - w / 2, y: 70, width: w, height: len, rx: w / 2, fill: color, class: 'fx-drip', style: `animation-delay:${rnd() * 0.6}s;animation-duration:${2 + rnd() * 3}s` });
      svg.appendChild(drip);
    }
    svg.appendChild(U.svg('ellipse', { cx: 44, cy: 44, rx: 12, ry: 6, fill: 'rgba(255,255,255,.22)', transform: 'rotate(-30 44 44)' }));
    FX.glass.appendChild(svg);
    const life = o.life ?? 4.5;
    setTimeout(() => svg.classList.add('fx-splat--gone'), life * 1000);
    setTimeout(() => svg.remove(), life * 1000 + 1200);
  };
  FX.clearGlass = () => { if (FX.glass) FX.glass.innerHTML = ''; };

  /* ---------- the candle you carry ---------- */
  const Lt = (LT.light = {});
  let darkEl, glowEl;
  const L = { x: innerWidth / 2, y: innerHeight * 0.45, tx: innerWidth / 2, ty: innerHeight * 0.45, d: 0.92, r: 260, w: 1, follow: true, pulse: 0 };
  const target = { d: 0.92, r: 260, w: 1 };
  Lt.mount = (dark, glow) => {
    darkEl = dark; glowEl = glow;
    LT.loop.add((dt, t) => {
      if (L.follow && LT.pointer.active) { L.tx = LT.pointer.x; L.ty = LT.pointer.y; }
      const k = 1 - Math.pow(0.0005, dt);
      L.x += (L.tx - L.x) * Math.min(1, k * 1.6);
      L.y += (L.ty - L.y) * Math.min(1, k * 1.6);
      const kk = 1 - Math.pow(0.08, dt);
      L.d += (target.d - L.d) * kk; L.r += (target.r - L.r) * kk; L.w += (target.w - L.w) * kk;
      L.pulse *= Math.pow(0.1, dt);
      const fl = RM ? 0 : U.noise(t * 7.3) * 0.045 + U.noise(t * 17.1 + 9) * 0.02;
      const r = L.r * (1 + fl + L.pulse * 0.4);
      const s = darkEl.style;
      s.setProperty('--lx', L.x.toFixed(1) + 'px');
      s.setProperty('--ly', L.y.toFixed(1) + 'px');
      s.setProperty('--lr', r.toFixed(1) + 'px');
      s.setProperty('--ld', U.clamp(L.d, 0, 1).toFixed(3));
      darkEl.style.opacity = L.d < 0.01 ? '0' : '1';
      if (glowEl) {
        glowEl.style.setProperty('--lx', L.x.toFixed(1) + 'px');
        glowEl.style.setProperty('--ly', L.y.toFixed(1) + 'px');
        glowEl.style.setProperty('--lr', (r * 1.1).toFixed(1) + 'px');
        glowEl.style.opacity = (U.clamp(L.w * L.d * 1.3, 0, 1) * (0.85 + fl * 3)).toFixed(3);
      }
    });
  };
  Lt.set = (o = {}) => {
    if (o.darkness != null) target.d = o.darkness * (U.isTouch && o.darkness > 0.3 ? 0.82 : 1);
    if (o.radius != null) target.r = o.radius * (U.isTouch ? 1.25 : 1);
    if (o.warmth != null) target.w = o.warmth;
    if (o.instant) { L.d = target.d; L.r = target.r; L.w = target.w; }
  };
  Lt.follow = (on) => { L.follow = on; };
  Lt.moveTo = (x, y, instant) => { L.tx = x; L.ty = y; if (instant) { L.x = x; L.y = y; } };
  Lt.pulse = () => { L.pulse = 1; };
  Lt.get = () => ({ x: L.x, y: L.y, r: L.r, d: L.d });
})();
