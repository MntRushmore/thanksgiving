/* The Long Table — the journey. One walk down one table, beat by beat.
   Acts register beats; this file runs them: captions, the camera, next/back, labels pinned to the world. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  const J = (LT.journey = { acts: [], beats: [], i: -1, resumeAt: null, built: false });

  /** LT.journey.act({id, order, numeral, title, music, build(group, W), enter(W), exit(W), beats:[...]}) */
  J.act = (def) => { J.acts.push(def); };
  function flatten() {
    J.acts.sort((a, b) => a.order - b.order);
    J.beats = [];
    J.acts.forEach((a) => a.beats.forEach((b, k) => { b.act = a; b.k = k; J.beats.push(b); }));
  }
  J.indexOf = (id) => J.beats.findIndex((b) => b.id === id);
  J.actStart = (actId) => J.beats.findIndex((b) => b.act.id === actId);

  let ui = null, api = null, W = null, curAct = null, beatCtx = null, locked = false, busy = false, labelsOff = null;

  /* ---------- the per-beat context ---------- */
  function makeCtx(beat, dir) {
    const cleanups = [];
    const ctx = {
      W, T: W.T, beat, act: beat.act, group: beat.act.group, dir, alive: true, api,
      later(fn, ms) { const id = setTimeout(() => ctx.alive && fn(), ms); cleanups.push(() => clearTimeout(id)); return id; },
      wait(ms) { return new Promise((r) => ctx.later(r, ms)); },
      frame(fn) { const off = W.onFrame((dt, t, raw) => ctx.alive && fn(dt, t, raw)); cleanups.push(off); return off; },
      on(t, type, fn, o) { t.addEventListener(type, fn, o); cleanups.push(() => t.removeEventListener(type, fn, o)); return fn; },
      sound(h) { if (h && h.stop) cleanups.push(() => h.stop(0.6)); return h; },
      cleanup(fn) { cleanups.push(fn); },
      lock(hint) { locked = true; ui.next.classList.add('locked'); if (hint) ctx.hint(hint); },
      unlock() { locked = false; ctx.hint(''); ui.next.classList.remove('locked'); ui.next.classList.add('ready'); setTimeout(() => ui.next.classList.remove('ready'), 1600); },
      next() { if (ctx.alive) J.next(true); },
      caption(text) { setCaption(text); },
      note(text) { setNote(text); },
      hint(text) { ui.hint.textContent = text || ''; ui.hint.classList.toggle('on', !!text); },
      /** a button in the caption area */
      button(label, fn, o = {}) {
        const b = el('button', { class: `lt-btn ${o.ghost ? 'lt-btn--ghost' : ''} jr-act-btn`, type: 'button' }, label);
        b.addEventListener('click', (e) => { e.stopPropagation(); fn(b, e); });
        ui.actions.appendChild(b);
        cleanups.push(() => b.remove());
        return b;
      },
      /** a text field in the caption area; onSubmit(value) */
      input(o = {}) {
        const id = 'jr-in-' + (o.id || beat.id);
        const f = el('form', { class: 'jr-form', autocomplete: 'off' });
        const lab = el('label', { for: id, class: 'sr-only' }, o.label || 'Your answer');
        const inp = el('input', { id, type: 'text', maxLength: o.max || 80, placeholder: o.placeholder || '', value: o.value || '', autocomplete: 'off' });
        const go = el('button', { class: 'lt-btn', type: 'submit' }, o.submit || 'Done');
        f.append(lab, inp, go);
        f.addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value.trim(); if (!v && o.required !== false) { inp.focus(); return; } o.onSubmit && o.onSubmit(v); });
        f.addEventListener('click', (e) => e.stopPropagation());
        ui.actions.appendChild(f);
        cleanups.push(() => f.remove());
        setTimeout(() => ctx.alive && !U.isTouch && inp.focus({ preventScroll: true }), 400);
        return { form: f, input: inp };
      },
      /** a full-bleed DOM layer for this beat (removed on exit) */
      overlay(cls) {
        const o = el('div', { class: 'jr-layer ' + (cls || '') });
        ui.layers.appendChild(o);
        cleanups.push(() => o.remove());
        return o;
      },
      /** a label pinned to a point in the world. pos: Vector3, [x,y,z], or () => Vector3 */
      label(pos, text, o = {}) {
        const n = el('div', { class: 'jr-label ' + (o.cls || '') }, text);
        if (o.html) n.innerHTML = o.html;
        ui.labels.appendChild(n);
        const L = { n, pos, dx: o.dx || 0, dy: o.dy || 0, alive: true, set(t) { n.textContent = t; } };
        labels.add(L);
        cleanups.push(() => { labels.delete(L); n.classList.add('out'); setTimeout(() => n.remove(), 400); });
        requestAnimationFrame(() => n.classList.add('on'));
        return L;
      },
      /** leave the journey for a full course, and come back here after */
      sideDoor(label, chapterId) {
        const b = ctx.button(label, () => { J.resumeAt = J.i; LT.audio.sfx('clink'); LT.go(chapterId); }, { ghost: true });
        b.classList.add('jr-door');
        b.appendChild(el('span', { 'aria-hidden': 'true' }, ' ↗'));
        return b;
      },
      shot(s, o) { return W.shot(s, o); },
    };
    ctx._destroy = () => { ctx.alive = false; cleanups.reverse().forEach((f) => { try { f(); } catch (e) { console.warn(e); } }); };
    return ctx;
  }

  /* ---------- labels follow the world ---------- */
  const labels = new Set();
  function placeLabels() {
    labels.forEach((L) => {
      const p = typeof L.pos === 'function' ? L.pos() : L.pos;
      if (!p) return;
      const s = W.project(p);
      L.n.style.transform = `translate(${(s.x + L.dx).toFixed(1)}px, ${(s.y + L.dy).toFixed(1)}px) translate(-50%, -100%)`;
      L.n.style.visibility = s.on ? 'visible' : 'hidden';
    });
  }

  /* ---------- captions ---------- */
  function setCaption(text) {
    const c = ui.caption;
    c.innerHTML = '';
    if (!text) { c.hidden = true; return; }
    c.hidden = false;
    let wi = 0;
    String(text).split('\n').forEach((line, li) => {
      if (li) c.appendChild(el('br'));
      line.split(/(\*[^*]+\*)/).forEach((chunk) => {
        if (!chunk) return;
        const em = /^\*([^*]+)\*$/.test(chunk);
        chunk.replace(/^\*|\*$/g, '').split(/(\s+)/).forEach((w) => {
          if (/^\s+$/.test(w)) { c.appendChild(document.createTextNode(' ')); return; }
          if (!w) return;
          const s = el('span', { class: 'w', style: { animationDelay: `${0.08 + wi++ * 0.055}s` } });
          if (em) s.appendChild(el('i', null, w)); else s.textContent = w;
          c.appendChild(s);
        });
      });
    });
  }
  function setNote(text) {
    ui.note.textContent = text || '';
    ui.note.hidden = !text;
    ui.note.classList.remove('in'); void ui.note.offsetWidth; ui.note.classList.add('in');
  }

  /* ---------- an act announces itself ---------- */
  function actCard(act) {
    const t = el('div', { class: 't' }); t.append(el('i', null, (act.numeral || '') + '.'), ' ', act.title);
    const card = el('div', { class: 'jr-actcard', 'aria-hidden': 'true' }, el('div', { class: 'k' }, act.course || ''), t, act.blurb ? el('div', { class: 'b' }, act.blurb) : null);
    ui.layers.appendChild(card);
    ui.cap.classList.add('held');
    setTimeout(() => ui && ui.cap.classList.remove('held'), U.reducedMotion ? 300 : 2300);
    setTimeout(() => card.remove(), U.reducedMotion ? 600 : 3200);
  }

  /* ---------- moving between beats ---------- */
  async function go(i, dir = 1) {
    if (busy || i < 0 || i >= J.beats.length) return;
    busy = true;
    const beat = J.beats[i];
    if (beatCtx) {
      const prev = J.beats[J.i];
      try { prev && prev.exit && prev.exit(beatCtx, dir); } catch (e) { console.warn(e); }
      beatCtx._destroy();
      beatCtx = null;
    }
    ui.actions.innerHTML = '';
    ui.hint.classList.remove('on');
    locked = false; ui.next.classList.remove('locked');
    // act changes
    if (beat.act !== curAct) {
      const old = curAct;
      if (old) { try { old.exit && old.exit(W, beat.act); } catch (e) { console.warn(e); } }
      curAct = beat.act;
      J.acts.forEach((a) => { if (a.group) a.group.visible = a === curAct || !!(a.keepVisible && a.keepVisible(curAct)); });
      if (curAct.music) LT.music.play(curAct.music, 2.5);
      try { curAct.enter && curAct.enter(W, old); } catch (e) { console.warn(e); }
      ui.act.innerHTML = '';
      ui.act.append(el('i', null, curAct.numeral ? curAct.numeral + '.' : ''), ' ', curAct.title || '');
      if (old && dir > 0 && curAct.title) actCard(curAct);
      ui.act.classList.remove('in'); void ui.act.offsetWidth; ui.act.classList.add('in');
      LT.audio.sfx('paper', { dur: 0.35, g: 0.5 });
      const ch = document.querySelector('.chrome-course');
      if (ch) ch.innerHTML = `${U.esc(curAct.course || '')}${curAct.course ? ' · ' : ''}<b>${U.esc(curAct.title || '')}</b>`;
    }
    J.i = i;
    renderProgress();
    ui.prev.disabled = i === 0;
    ui.root.dataset.beat = beat.id;
    ui.root.dataset.act = beat.act.id;
    ui.root.dataset.layout = beat.layout || curAct.layout || '';
    ui.cap.className = 'jr-cap ' + (beat.layout || curAct.layout || '');
    setCaption(beat.caption || '');
    setNote(beat.note || '');
    ui.cite.textContent = beat.cite || '';
    ui.cite.hidden = !beat.cite;
    if (beat.mood) W.mood(beat.mood);
    const shot = typeof beat.shot === 'function' ? beat.shot(W, dir) : beat.shot;
    if (shot) W.shot(shot, { dur: beat.dur ?? 2.6, ease: beat.ease, lift: beat.lift });
    beatCtx = makeCtx(beat, dir);
    if (beat.lock) beatCtx.lock(beat.lock === true ? '' : beat.lock);
    try { const r = beat.enter && beat.enter(beatCtx, dir); if (r && r.catch) r.catch((e) => console.warn('beat', beat.id, e)); } catch (e) { console.warn('beat', beat.id, e); }
    if (beat.auto) beatCtx.later(() => J.next(true), beat.auto);
    setTimeout(() => { busy = false; }, 350);
  }
  J.go = (i, dir) => go(i, dir ?? (i >= J.i ? 1 : -1));
  J.goId = (id) => { const i = J.indexOf(id); if (i >= 0) go(i, 1); };
  J.next = (force) => {
    if (busy) return;
    if (locked && !force) { ui.next.classList.remove('nudge'); void ui.next.offsetWidth; ui.next.classList.add('nudge'); LT.audio.sfx('tick', { g: 0.05 }); return; }
    if (J.i < J.beats.length - 1) { LT.audio.sfx('tick', { f: 1800, g: 0.04 }); go(J.i + 1, 1); }
  };
  J.prev = () => { if (!busy && J.i > 0) go(J.i - 1, -1); };

  function renderProgress() {
    const bar = ui.progress;
    if (!bar.childElementCount) {
      J.acts.forEach((a) => {
        const seg = el('button', { class: 'jr-seg', type: 'button', title: a.title, 'aria-label': `Go to ${a.title}` });
        a.beats.forEach(() => seg.appendChild(el('span', { class: 'jr-tick' })));
        seg.addEventListener('click', () => go(J.actStart(a.id), 1));
        bar.appendChild(seg);
      });
    }
    let n = 0;
    [...bar.children].forEach((seg, ai) => {
      const a = J.acts[ai];
      seg.classList.toggle('cur', a === curAct);
      [...seg.children].forEach((t) => { t.classList.toggle('done', n < J.i); t.classList.toggle('now', n === J.i); n++; });
    });
  }

  /* ---------- the chapter ---------- */
  LT.chapter({
    id: 'journey', index: 0.7, title: 'The Long Table', music: null, transition: 'cut',
    light: { darkness: 0.08, radius: 1400 },
    world: { mood: { dim: 1, soft: 0, cursor: 0.45, moon: 0 } },
    mount(root, a) {
      api = a; W = LT.world;
      root.classList.add('jr-root');
      if (!W.ok) {
        root.appendChild(el('div', { class: 'lt-center' },
          el('p', { class: 'lt-prose' }, 'The walk down the long table needs a browser that can draw 3D. Every course is still here, one at a time.'),
          el('button', { class: 'lt-btn', type: 'button', on: { click: () => LT.go('menu') } }, 'Open the bill of fare')));
        return;
      }
      if (!J.built) {
        flatten();
        J.acts.forEach((act) => {
          act.group = new W.T.Group(); act.group.visible = false; W.scene.add(act.group);
          try { act.build && act.build(act.group, W); } catch (e) { console.error('act build', act.id, e); }
        });
        J.built = true;
      }
      const cap = el('div', { class: 'jr-cap' });
      const actLbl = el('div', { class: 'jr-actlbl' });
      const caption = el('h2', { class: 'jr-caption', 'aria-live': 'polite' });
      const note = el('p', { class: 'jr-note' });
      const cite = el('p', { class: 'jr-cite lt-cite' });
      const actions = el('div', { class: 'jr-actions' });
      const hint = el('p', { class: 'jr-hint' });
      cap.append(actLbl, caption, note, cite, actions, hint);
      const prev = el('button', { class: 'jr-btn jr-prev', type: 'button', 'aria-label': 'Back' }, '←');
      const next = el('button', { class: 'jr-btn jr-next', type: 'button', 'aria-label': 'Next' }, el('span', { class: 'lbl' }, 'Next'), el('span', { 'aria-hidden': 'true' }, '→'));
      const progress = el('div', { class: 'jr-progress' });
      const nav = el('nav', { class: 'jr-nav', 'aria-label': 'Journey' }, prev, progress, next);
      const layers = el('div', { class: 'jr-layers' });
      const lbls = el('div', { class: 'jr-labels', 'aria-hidden': 'true' });
      root.append(layers, lbls, cap, nav);
      ui = { root, cap, act: actLbl, caption, note, cite, actions, hint, prev, next, progress, layers, labels: lbls };
      a.on(prev, 'click', (e) => { e.stopPropagation(); J.prev(); });
      a.on(next, 'click', (e) => { e.stopPropagation(); J.next(); });
      a.on(window, 'keydown', (e) => {
        if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) return;
        if (document.querySelector('.menu-overlay')) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && e.target === document.body)) { e.preventDefault(); J.next(); }
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); J.prev(); }
      });
      // swipe
      let sx = null, sy = 0, st = 0;
      a.on(window, 'pointerdown', (e) => { if (e.pointerType !== 'mouse' && !e.target.closest('button, input, form, .jr-interactive')) { sx = e.clientX; sy = e.clientY; st = performance.now(); } });
      a.on(window, 'pointerup', (e) => {
        if (sx == null) return;
        const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && performance.now() - st < 700) (dx < 0 ? J.next() : J.prev());
      });
      a.frame(placeLabels);
      const start = J.resumeAt != null ? J.resumeAt : 0;
      J.resumeAt = null;
      J.i = -1; curAct = null;
      go(start, 1);
      return () => {
        if (beatCtx) { const b = J.beats[J.i]; try { b && b.exit && b.exit(beatCtx, 0); } catch (e) {} beatCtx._destroy(); beatCtx = null; }
        if (curAct) { try { curAct.exit && curAct.exit(W, null); } catch (e) {} }
        J.acts.forEach((x) => { if (x.group) x.group.visible = false; });
        curAct = null; busy = false; labels.clear();
      };
    },
  });
})();
