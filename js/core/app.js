/* The Long Table — the host: chapters, transitions, chrome, menu, secrets, state. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;

  /* ---------- persisted state ---------- */
  const saved = U.store.read();
  LT.state = Object.assign({ visited: [], eggs: {}, stats: {}, thanks: '', chair: '', letterTo: '', tableOutcome: '', bingo: [] }, saved.state || {});
  LT.save = () => { const s = U.store.read(); s.state = LT.state; U.store.write(s); };
  LT.stats = {
    inc(k, n = 1) { LT.state.stats[k] = (LT.state.stats[k] || 0) + n; clearTimeout(LT.stats._t); LT.stats._t = setTimeout(LT.save, 400); return LT.state.stats[k]; },
    get(k) { return LT.state.stats[k] || 0; },
    set(k, v) { LT.state.stats[k] = v; LT.save(); },
  };

  /* ---------- chapters ---------- */
  const chapters = {};
  LT.chapters = chapters;
  LT.chapter = (def) => { chapters[def.id] = def; };
  LT.courses = () => Object.values(chapters).filter((c) => c.index >= 1).sort((a, b) => a.index - b.index);

  let current = null; // {def, root, api}
  let busy = false;
  const app = (LT.app = {});

  function makeApi(def, root) {
    const cleanups = [];
    const api = {
      root, def, alive: true,
      on(t, type, fn, o) { t.addEventListener(type, fn, o); cleanups.push(() => t.removeEventListener(type, fn, o)); return fn; },
      timeout(fn, ms) { const id = setTimeout(() => api.alive && fn(), ms); cleanups.push(() => clearTimeout(id)); return id; },
      interval(fn, ms) { const id = setInterval(() => api.alive && fn(), ms); cleanups.push(() => clearInterval(id)); return id; },
      frame(fn) { const off = LT.loop.add(fn); cleanups.push(off); return off; },
      sound(h) { if (h && h.stop) cleanups.push(() => h.stop(0.5)); return h; },
      cleanup(fn) { cleanups.push(fn); },
      wait(ms) { return new Promise((res) => api.timeout(res, ms)); },
      next() { LT.next(); },
      go(id, o) { LT.go(id, o); },
      nextButton(label) {
        const nx = nextCourse(def);
        if (!nx) {
          const b = el('button', { class: 'lt-next', type: 'button', on: { click: () => LT.go('menu') } },
            el('span', { class: 'k' }, 'That was everything'), el('span', { class: 't' }, label || 'Back to the bill of fare'), el('span', { class: 'a', 'aria-hidden': 'true' }, '→'));
          return b;
        }
        const t = el('span', { class: 't' }); t.append(el('i', null, nx.numeral + '.'), ' ', nx.title);
        return el('button', { class: 'lt-next', type: 'button', on: { click: () => { LT.audio.sfx('clink'); LT.go(nx.id); } } },
          el('span', { class: 'k' }, label || nx.course), t, el('span', { class: 'a', 'aria-hidden': 'true' }, '→'));
      },
    };
    api._destroy = () => { api.alive = false; cleanups.reverse().forEach((f) => { try { f(); } catch (e) { console.warn(e); } }); };
    return api;
  }

  function nextCourse(def) {
    if (def.id === 'prelude') return chapters.menu;
    const list = LT.courses();
    if (def.id === 'menu') return list[0];
    const i = list.findIndex((c) => c.id === def.id);
    return i >= 0 ? list[i + 1] || null : null;
  }
  LT.next = () => { const n = current && nextCourse(current.def); LT.go(n ? n.id : 'menu'); };

  function setHash(id) {
    try {
      if (id === 'prelude') return; // keep any requested course so a reload still lands there
      if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    } catch (e) { /* sandboxed frames may refuse; it's only a convenience */ }
  }

  function mount(def, opts = {}) {
    const root = el('section', { class: `chapter chapter--${def.id}`, 'aria-label': def.title || def.id });
    if (opts.fadeIn) root.style.opacity = '0';
    document.getElementById('stage').appendChild(root);
    const api = makeApi(def, root);
    current = { def, root, api };
    const wd = def.world;
    const onWorld = !!(LT.world.ok && wd && wd.visible !== false);
    LT.light.set(Object.assign({ darkness: 0.55, radius: 420, warmth: 1 }, def.light || {}, onWorld && wd.light ? wd.light : {}));
    if (LT.world.ok) {
      if (LT.state.chair) LT.world.setChair(LT.state.chair);
      if (onWorld) {
        root.classList.add('on-world');
        LT.world.show(true);
        LT.world.mood(Object.assign({ dim: 1, soft: 0, cursor: 0, moon: 0 }, wd.mood || {}));
        if (wd.shot && LT.world.shotName !== wd.shot) LT.world.shot(wd.shot, { dur: wd.dur ?? 1.8 });
      } else if (!opts.fadeIn) LT.world.show(false);
    }
    if (def.music) LT.music.play(def.music);
    let extra;
    try { extra = def.mount(root, api); } catch (e) { console.error('mount failed', def.id, e); root.appendChild(el('div', { class: 'lt-center' }, el('p', { class: 'lt-prose' }, 'Something spilled in this course. Try the next one.'), api.nextButton())); }
    if (typeof extra === 'function') api.cleanup(extra);
    if (def.index >= 1 && !LT.state.visited.includes(def.id)) { LT.state.visited.push(def.id); LT.save(); }
    updateChrome(def);
    setHash(def.id);
    LT.bus.emit('chapter', def.id);
  }
  function unmount() {
    if (!current) return;
    current.api._destroy();
    current.root.remove();
    current = null;
    LT.fx.clear();
    LT.fx.clearGlass();
    LT.light.follow(true);
    document.getElementById('stage').style.transform = '';
  }

  LT.go = async function (id, opts = {}) {
    const def = chapters[id];
    if (!def || busy) return;
    busy = true;
    closeMenu(true);
    let kind = opts.transition || def.transition || 'candle';
    if (LT.world.ok && kind !== 'cut' && !opts.transition && current && current.def.id !== 'prelude') kind = 'glide';
    try {
      await veilClose(kind, def);
      unmount();
      mount(def, { fadeIn: kind === 'glide' });
      await U.wait(kind === 'cut' ? 0 : 80);
      await veilOpen(kind, def);
    } catch (e) { console.error(e); }
    busy = false;
  };
  LT.current = () => current && current.def.id;

  /* ---------- the veil ---------- */
  let veil;
  function courseCard(def, dark) {
    if (!def || !(def.index >= 1)) return null;
    const t = el('div', { class: 't' }); t.append(el('i', null, def.numeral + '.'), ' ', def.title);
    return el('div', { class: 'veil-card' }, el('div', { class: 'k' }, def.course), t, def.blurb ? el('div', { class: 'b' }, def.blurb) : null);
  }
  async function veilClose(kind, def) {
    veil.innerHTML = '';
    veil.className = 'on';
    if (kind === 'cut') return;
    const card = courseCard(def);
    if (kind === 'glide') {
      veil.className = 'on glide';
      if (current) current.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, easing: 'ease-in', fill: 'forwards' });
      LT.world.show(true, { dur: 0.7 });
      LT.light.set({ darkness: 0.12, radius: 1100 });
      LT.world.mood({ dim: 1, soft: 0, cursor: 0.35 });
      const wd = def.world || {};
      const shot = wd.glideShot || wd.shot || (def.index >= 1 && LT.world.SHOTS['course' + def.index] ? 'course' + def.index : 'menu');
      LT.audio.sfx('whoosh', { dur: 2.4, low: 90, high: 520, g: 0.14 });
      const moving = LT.world.shot(shot, { dur: U.reducedMotion ? 0.3 : 2.9 });
      await U.wait(550);
      if (card) {
        veil.appendChild(card);
        LT.audio.sfx('paper', { dur: 0.4, g: 0.6 });
        await card.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }).finished;
      }
      await moving;
      if (card) {
        await U.wait(U.reducedMotion ? 200 : 650);
        await card.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 450, easing: 'ease-in', fill: 'forwards' }).finished;
      }
      return;
    }
    if (kind === 'cloth') {
      const cloth = el('div', { class: 'veil-cloth' });
      veil.appendChild(cloth);
      if (card) veil.appendChild(card);
      LT.audio.sfx('whoosh', { dur: 0.6, low: 200, high: 1600 });
      await cloth.animate([{ transform: 'translateX(-112%) skewX(-6deg)' }, { transform: 'translateX(0) skewX(0deg)' }], { duration: U.reducedMotion ? 200 : 720, easing: 'cubic-bezier(.7,0,.25,1)', fill: 'forwards' }).finished;
    } else if (kind === 'smoke') {
      const sm = el('div', { class: 'veil-smoke' });
      veil.appendChild(sm);
      if (card) veil.appendChild(card);
      await sm.animate([{ opacity: 0, filter: 'blur(30px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: U.reducedMotion ? 200 : 900, easing: 'ease-in', fill: 'forwards' }).finished;
    } else {
      const c = el('div', { class: 'veil-candle' });
      const x = LT.pointer.active ? LT.pointer.x : innerWidth / 2, y = LT.pointer.active ? LT.pointer.y : innerHeight / 2;
      c.style.setProperty('--vx', x + 'px'); c.style.setProperty('--vy', y + 'px');
      veil.appendChild(c);
      if (card) veil.appendChild(card);
      const max = Math.hypot(innerWidth, innerHeight) * 1.25;
      await U.tween({ from: max, to: 0, dur: U.reducedMotion ? 0.2 : 0.85, ease: 'inOutCubic', onUpdate: (v) => c.style.setProperty('--vr', v + 'px') }).done;
    }
    if (card) {
      LT.audio.sfx('paper', { dur: 0.4, g: 0.6 });
      await card.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }).finished;
      await U.wait(U.reducedMotion ? 400 : 1250);
      await card.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 450, easing: 'ease-in', fill: 'forwards' }).finished;
    }
  }
  async function veilOpen(kind) {
    if (kind === 'cut') { veil.className = ''; veil.innerHTML = ''; return; }
    if (kind === 'glide') {
      veil.className = ''; veil.innerHTML = '';
      const root = current && current.root;
      if (root) await root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: U.reducedMotion ? 150 : 900, easing: 'ease-out', fill: 'forwards' }).finished;
      if (root) { root.style.opacity = ''; root.getAnimations().forEach((a) => a.cancel()); }
      const wd = current && current.def.world;
      if (!(wd && wd.visible !== false)) LT.world.show(false, { dur: 0.3 });
      return;
    }
    if (kind === 'cloth') {
      const cloth = veil.querySelector('.veil-cloth');
      LT.audio.sfx('whoosh', { dur: 0.5, low: 400, high: 2600 });
      await cloth.animate([{ transform: 'translateX(0) skewX(0deg)' }, { transform: 'translateX(115%) skewX(8deg) rotate(2deg)' }], { duration: U.reducedMotion ? 200 : 620, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' }).finished;
    } else if (kind === 'smoke') {
      const sm = veil.querySelector('.veil-smoke');
      await sm.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(40px)' }], { duration: U.reducedMotion ? 200 : 1100, easing: 'ease-out', fill: 'forwards' }).finished;
    } else {
      const c = veil.querySelector('.veil-candle');
      if (c) {
        c.style.setProperty('--vx', '50%'); c.style.setProperty('--vy', '50%');
        const max = Math.hypot(innerWidth, innerHeight) * 1.25;
        await U.tween({ from: 0, to: max, dur: U.reducedMotion ? 0.2 : 1.1, ease: 'inOutCubic', onUpdate: (v) => c.style.setProperty('--vr', v + 'px') }).done;
      }
    }
    veil.className = '';
    veil.innerHTML = '';
  }

  /* ---------- chrome ---------- */
  let chrome, courseLabel, soundBtn;
  const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  function buildChrome() {
    chrome = el('header', { id: 'chrome', 'data-hidden': '' });
    const mark = el('button', { class: 'chrome-mark', type: 'button', on: { click: () => openMenu() }, title: 'Open the bill of fare' }, 'The Long Table');
    courseLabel = el('div', { class: 'chrome-course', 'aria-live': 'polite' });
    soundBtn = el('button', { class: 'chrome-btn', type: 'button', on: { click: () => { LT.audio.init(); LT.audio.toggle(); } } });
    const menuBtn = el('button', { class: 'chrome-btn', type: 'button', on: { click: () => openMenu() } },
      U.html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h9"/></svg>'), el('span', { class: 'lbl' }, 'Menu'));
    chrome.append(mark, courseLabel, el('div', { class: 'chrome-right' }, soundBtn, menuBtn));
    renderSound();
    LT.bus.on('audio:muted', renderSound);
    return chrome;
  }
  function renderSound() {
    if (!soundBtn) return;
    soundBtn.innerHTML = (LT.audio.muted ? ICON_OFF : ICON_ON) + `<span class="lbl">${LT.audio.muted ? 'Sound off' : 'Sound on'}</span>`;
    soundBtn.setAttribute('aria-label', LT.audio.muted ? 'Turn sound on' : 'Turn sound off');
    soundBtn.setAttribute('aria-pressed', String(!LT.audio.muted));
  }
  function updateChrome(def) {
    if (def.id === 'prelude') chrome.setAttribute('data-hidden', ''); else chrome.removeAttribute('data-hidden');
    courseLabel.innerHTML = def.index >= 1 ? `${U.esc(def.course)} · <b>${U.esc(def.title)}</b>` : def.id === 'menu' ? 'Bill of Fare' : '';
  }

  /* ---------- the bill of fare (also used by the menu chapter) ---------- */
  LT.renderBill = function (opts = {}) {
    const today = U.today();
    const when = `${U.DAYS[today.getDay()]}, the ${U.ordinal(today.getDate())} of ${U.MONTHS[today.getMonth()]}, ${today.getFullYear()}`;
    const ol = el('ol');
    LT.courses().forEach((c) => {
      const t = el('span', { class: 't' }); t.append(el('i', null, c.numeral + '.'), c.title);
      const eaten = LT.state.visited.includes(c.id);
      const b = el('button', { class: 'course-btn', type: 'button', on: { click: () => { LT.audio.sfx('clink'); LT.go(c.id); }, mouseenter: () => LT.audio.sfx('tick', { g: 0.03 }) } },
        el('span', { class: 'k' }, c.course), t, el('span', { class: 'b' }, c.blurb),
        eaten ? el('span', { class: 'eaten', 'aria-label': 'visited' }, 'had some') : null);
      ol.appendChild(el('li', null, b));
    });
    const nEggs = Object.keys(LT.state.eggs).length;
    const first = LT.courses()[0];
    const card = el('article', { class: 'bill lt-card' },
      el('div', { class: 'fleuron', 'aria-hidden': 'true' }, '❦'),
      el('div', { class: 'house' }, 'THE LONG TABLE'),
      U.html('<h2>Bill of <i>Fare</i></h2>'),
      el('div', { class: 'when' }, when),
      el('div', { class: 'rule', 'aria-hidden': 'true' }, '✣'),
      ol,
      el('div', { class: 'rule', 'aria-hidden': 'true' }, '✣'),
      el('p', { class: 'foot' }, 'Served by candlelight. Seconds encouraged. Guests: you, and everyone who made this meal possible.'),
      opts.begin && first ? el('div', { class: 'begin' }, el('button', { class: 'lt-btn lt-btn--ink', type: 'button', on: { click: () => { LT.audio.sfx('clink'); LT.go(first.id); } } }, LT.state.visited.length ? 'Pick up where you left off' : 'Begin with the first course')) : null,
      nEggs ? el('div', { class: 'secrets' }, `Secrets found: ${nEggs}`) : null);
    return card;
  };
  let menuEl = null;
  function openMenu() {
    if (menuEl || busy || !current || current.def.id === 'prelude') return;
    if (current.def.id === 'menu') return;
    LT.audio.sfx('paper');
    const close = el('button', { class: 'chrome-btn close', type: 'button', on: { click: () => closeMenu() } }, U.html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'), el('span', { class: 'lbl' }, 'Close'));
    menuEl = el('div', { class: 'menu-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Bill of fare' }, close, el('div', { class: 'menu-page' }, LT.renderBill({ begin: false })));
    menuEl.addEventListener('click', (e) => { if (e.target === menuEl || e.target.classList.contains('menu-page')) closeMenu(); });
    document.getElementById('app').appendChild(menuEl);
    setTimeout(() => { const b = menuEl && menuEl.querySelector('.course-btn'); b && b.focus({ preventScroll: true }); }, 50);
  }
  function closeMenu(silent) {
    if (!menuEl) return;
    if (!silent) LT.audio.sfx('paper', { dur: 0.3 });
    menuEl.remove(); menuEl = null;
  }
  LT.openMenu = openMenu;

  /* ---------- toasts ---------- */
  LT.toast = function (text, o = {}) {
    const box = document.getElementById('toasts');
    const t = el('div', { class: 'lt-toast', role: 'status' },
      o.seal ? el('div', { class: 'seal', 'aria-hidden': 'true' }, o.seal) : null,
      el('div', null, o.title ? el('b', null, o.title) : null, text));
    box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 420); }, o.ms || 4200);
    return t;
  };

  /* ---------- secrets ---------- */
  LT.eggCatalog = LT.eggCatalog || [];
  LT.defineEgg = (id, title, hint) => { if (!LT.eggCatalog.find((e) => e.id === id)) LT.eggCatalog.push({ id, title, hint }); };
  LT.egg = function (id, title, note) {
    LT.defineEgg(id, title, '');
    if (LT.state.eggs[id]) return false;
    LT.state.eggs[id] = { title, note: note || '', at: Date.now() };
    LT.save();
    LT.audio.sfx('secret');
    const n = Object.keys(LT.state.eggs).length;
    LT.toast(note ? `${title}. ${note}` : title, { title: `Secret found · ${n}`, seal: '✦', ms: 5200 });
    LT.bus.emit('egg', { id, title });
    return true;
  };

  /* ---------- words typed anywhere ---------- */
  const words = [];
  let buf = '';
  LT.onWord = (word, fn) => { words.push({ word: word.toLowerCase(), fn }); };
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kon = 0;
  function onKey(e) {
    const tag = (e.target && e.target.tagName) || '';
    const typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
    if (e.key === 'Escape' && menuEl) { closeMenu(); return; }
    if (typing) return;
    kon = e.key === KONAMI[kon] || e.key.toLowerCase() === KONAMI[kon] ? kon + 1 : e.key === KONAMI[0] ? 1 : 0;
    if (kon === KONAMI.length) { kon = 0; LT.bus.emit('konami'); }
    if (e.key.length === 1 && /[a-z]/i.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      buf = (buf + e.key.toLowerCase()).slice(-24);
      words.forEach((w) => { if (buf.endsWith(w.word)) { buf = ''; w.fn(); } });
    }
  }

  /* ---------- boot ---------- */
  app.start = function () {
    const root = document.getElementById('app') || document.body.appendChild(el('div', { id: 'app' }));
    root.innerHTML = '';
    LT.world = LT.world || { ok: false };
    const worldCv = el('canvas', { id: 'world', 'aria-hidden': 'true' });
    root.appendChild(worldCv);
    if (LT.world && LT.world.mount) LT.world.mount(worldCv);
    if (!LT.world.ok) worldCv.remove();
    const stage = el('main', { id: 'stage' });
    const vignette = el('div', { id: 'vignette', 'aria-hidden': 'true' });
    const dark = el('div', { id: 'dark', 'aria-hidden': 'true' });
    const glow = el('div', { id: 'glow', 'aria-hidden': 'true' });
    const fx = el('canvas', { id: 'fx', 'aria-hidden': 'true' });
    const glass = el('div', { id: 'glass', 'aria-hidden': 'true' });
    veil = el('div', { id: 'veil', 'aria-hidden': 'true' });
    const grain = el('div', { id: 'grain', 'aria-hidden': 'true' });
    root.append(stage, vignette, dark, glow, fx, glass, buildChrome(), el('div', { id: 'toasts', 'aria-live': 'polite' }), veil, grain);
    LT.fx.mount(fx, glass);
    LT.light.mount(dark, glow);
    LT.light.set({ darkness: 0.97, radius: 110, instant: true });
    addEventListener('keydown', onKey);
    addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      if (!chapters[id] || !current) return;
      if (current.def.id === 'prelude') LT.requested = id;
      else if (current.def.id !== id) LT.go(id);
    });
    // Unlock audio on the very first gesture anywhere.
    const unlock = () => { LT.audio.init(); removeEventListener('pointerdown', unlock); removeEventListener('keydown', unlock); };
    addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
    LT.requested = location.hash.slice(1);
    mount(chapters.prelude);
    // Let a hot update or a tab return keep things tidy.
    document.addEventListener('visibilitychange', () => { if (document.hidden) LT.fx.clear(); });
  };
  /** Where to go after the prelude: a requested chapter, or the bill of fare. */
  app.afterPrelude = () => {
    const r = LT.requested;
    LT.requested = '';
    LT.go(r && chapters[r] && r !== 'prelude' ? r : 'menu');
  };
})();
