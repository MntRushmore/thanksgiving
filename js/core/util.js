/* The Long Table — utilities. Everything hangs off window.LT. */
(function () {
  'use strict';
  const LT = (window.LT = window.LT || {});
  const U = (LT.util = {});

  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.invlerp = (a, b, v) => (v - a) / (b - a);
  U.map = (v, a, b, c, d, clamp) => {
    let t = (v - a) / (b - a);
    if (clamp) t = U.clamp(t, 0, 1);
    return c + (d - c) * t;
  };
  U.rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
  U.randi = (a, b) => Math.floor(U.rand(a, b + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  // Seeded PRNG (mulberry32) for deterministic generative art.
  U.seeded = (seed) => {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Smooth 1D value noise in [-1, 1]; good for flicker.
  const perm = new Float32Array(512);
  { const r = U.seeded(1621); for (let i = 0; i < 512; i++) perm[i] = r() * 2 - 1; }
  U.noise = (x) => {
    const i = Math.floor(x), f = x - i;
    const a = perm[i & 511], b = perm[(i + 1) & 511];
    const s = f * f * (3 - 2 * f);
    return a + (b - a) * s;
  };

  U.ease = {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
    outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    outBounce: (t) => {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
  };

  U.reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  U.isTouch = !!(window.matchMedia && window.matchMedia('(hover: none)').matches);

  U.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function applyAttrs(node, attrs, isSvg) {
    if (!attrs) return;
    for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') node.setAttribute('class', v);
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'on') for (const e in v) node.addEventListener(e, v[e]);
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (!isSvg && k in node && typeof v !== 'string') node[k] = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
  }
  function appendKids(node, kids) {
    for (const c of kids.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      node.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
  }
  /** el('div', {class:'x', on:{click}}, 'text', childNode) */
  U.el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    applyAttrs(n, attrs, false);
    appendKids(n, kids);
    return n;
  };
  U.SVGNS = 'http://www.w3.org/2000/svg';
  U.svg = (tag, attrs, ...kids) => {
    const n = document.createElementNS(U.SVGNS, tag);
    applyAttrs(n, attrs, true);
    appendKids(n, kids);
    return n;
  };
  U.html = (str) => {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.childElementCount === 1 ? t.content.firstElementChild : t.content;
  };

  U.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  U.nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

  /* ---------- Global animation loop ---------- */
  const loopFns = new Set();
  let last = performance.now();
  let running = false;
  function tick(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;
    const t = now / 1000;
    for (const fn of Array.from(loopFns)) {
      try { fn(dt, t); } catch (e) { console.error(e); loopFns.delete(fn); }
    }
    requestAnimationFrame(tick);
  }
  LT.loop = {
    add(fn) {
      loopFns.add(fn);
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
      return () => loopFns.delete(fn);
    },
    remove(fn) { loopFns.delete(fn); },
  };

  /** tween({from, to, dur (s), ease, onUpdate(v), onDone}) -> {cancel, done:Promise} */
  U.tween = (o) => {
    const from = o.from ?? 0, to = o.to ?? 1, dur = Math.max(0.0001, o.dur ?? 0.6);
    const ease = typeof o.ease === 'function' ? o.ease : U.ease[o.ease || 'outCubic'];
    let t = -(o.delay || 0), cancelled = false, resolve;
    const done = new Promise((r) => (resolve = r));
    const isArr = Array.isArray(from);
    const off = LT.loop.add((dt) => {
      if (cancelled) return;
      t += dt;
      if (t < 0) return;
      const k = U.clamp(t / dur, 0, 1), e = ease(k);
      const v = isArr ? from.map((f, i) => f + (to[i] - f) * e) : from + (to - from) * e;
      o.onUpdate && o.onUpdate(v, k);
      if (k >= 1) { off(); o.onDone && o.onDone(); resolve(true); }
    });
    return { cancel() { cancelled = true; off(); resolve(false); }, done };
  };

  /** Typewriter into el. Returns Promise. */
  U.type = (el, text, cps = 40, onChar) =>
    new Promise((res) => {
      el.textContent = '';
      let i = 0;
      const step = () => {
        if (!el.isConnected && i > 0) return res();
        el.textContent = text.slice(0, ++i);
        onChar && onChar(text[i - 1], i);
        if (i >= text.length) return res();
        const ch = text[i - 1];
        const pause = /[.!?]/.test(ch) ? 7 : /[,;:—]/.test(ch) ? 3.5 : 1;
        setTimeout(step, (1000 / cps) * pause * (U.reducedMotion ? 0.2 : 1));
      };
      step();
    });

  /** Wrap each word (and optionally each letter) in spans for staggered reveals. */
  U.splitWords = (el, cls = 'w') => {
    const words = el.textContent.split(/(\s+)/);
    el.textContent = '';
    const spans = [];
    words.forEach((w) => {
      if (/^\s+$/.test(w)) el.appendChild(document.createTextNode(w));
      else if (w) { const s = U.el('span', { class: cls }, w); el.appendChild(s); spans.push(s); }
    });
    return spans;
  };

  U.copy = async (text, fallbackEl) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      if (fallbackEl) {
        try {
          const r = document.createRange(); r.selectNodeContents(fallbackEl);
          const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        } catch (_) {}
      }
      return false;
    }
  };

  /* ---------- Storage (never trusted, never required) ---------- */
  const KEY = 'longtable.v1';
  U.store = {
    read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } },
    write(obj) { try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {} },
  };

  /* ---------- Tiny event bus ---------- */
  const handlers = {};
  LT.bus = {
    on(ev, fn) { (handlers[ev] = handlers[ev] || new Set()).add(fn); return () => LT.bus.off(ev, fn); },
    off(ev, fn) { handlers[ev] && handlers[ev].delete(fn); },
    emit(ev, data) { handlers[ev] && Array.from(handlers[ev]).forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } }); },
  };

  /* ---------- Pointer tracking (shared) ---------- */
  LT.pointer = { x: innerWidth / 2, y: innerHeight * 0.45, vx: 0, vy: 0, speed: 0, down: false, active: false };
  let px = LT.pointer.x, py = LT.pointer.y, pt = performance.now();
  function onMove(e) {
    const now = performance.now();
    const x = e.clientX, y = e.clientY;
    const dtm = Math.max(1, now - pt);
    LT.pointer.vx = ((x - px) / dtm) * 16;
    LT.pointer.vy = ((y - py) / dtm) * 16;
    LT.pointer.x = x; LT.pointer.y = y; LT.pointer.active = true;
    px = x; py = y; pt = now;
  }
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', (e) => { onMove(e); LT.pointer.down = true; }, { passive: true });
  addEventListener('pointerup', () => (LT.pointer.down = false), { passive: true });
  addEventListener('pointercancel', () => (LT.pointer.down = false), { passive: true });
  LT.loop.add((dt) => {
    // decay velocity so a still pointer reads as still
    LT.pointer.vx *= 0.85; LT.pointer.vy *= 0.85;
    LT.pointer.speed = Math.hypot(LT.pointer.vx, LT.pointer.vy);
  });

  /* ---------- Date helpers ---------- */
  U.thanksgivingOf = (year) => {
    const d = new Date(year, 10, 1);
    const offset = (4 - d.getDay() + 7) % 7; // first Thursday
    return new Date(year, 10, 1 + offset + 21);
  };
  U.today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  U.daysUntilThanksgiving = () => {
    const t = U.today();
    let tg = U.thanksgivingOf(t.getFullYear());
    if (tg < t) tg = U.thanksgivingOf(t.getFullYear() + 1);
    return { days: Math.round((tg - t) / 86400000), date: tg };
  };
  U.ordinal = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  U.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  U.DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
})();
