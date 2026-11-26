/* Prelude — it's dark. Strike a match. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;

  const MATCHBOX = `
<svg viewBox="0 0 200 96" aria-hidden="true">
  <defs>
    <pattern id="mb-grit" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#4a2e1c"/><circle cx="1" cy="2" r=".8" fill="#2a170c"/><circle cx="4" cy="4.5" r=".7" fill="#6b4630"/><circle cx="4.5" cy="1" r=".5" fill="#2a170c"/>
    </pattern>
    <linearGradient id="mb-sheen" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
  </defs>
  <g class="mb-drawer">
    <rect x="22" y="22" width="166" height="62" rx="3" fill="#d6c39b" stroke="#1c130c" stroke-width="2"/>
    <g fill="#9e2a22" stroke="#1c130c" stroke-width="1">
      <ellipse cx="178" cy="34" rx="5" ry="4"/><ellipse cx="178" cy="44" rx="5" ry="4"/><ellipse cx="178" cy="54" rx="5" ry="4"/><ellipse cx="178" cy="64" rx="5" ry="4"/><ellipse cx="178" cy="74" rx="5" ry="4"/>
    </g>
  </g>
  <rect x="8" y="14" width="168" height="76" rx="4" fill="#6f1526" stroke="#1c130c" stroke-width="2.5"/>
  <rect x="8" y="14" width="168" height="76" rx="4" fill="url(#mb-sheen)"/>
  <rect x="8" y="8" width="168" height="12" rx="3" fill="url(#mb-grit)" stroke="#1c130c" stroke-width="2"/>
  <rect x="24" y="28" width="136" height="50" fill="#e8dcc1" stroke="#1c130c" stroke-width="1.5"/>
  <rect x="28" y="32" width="128" height="42" fill="none" stroke="#6f1526" stroke-width="1"/>
  <text x="92" y="50" text-anchor="middle" font-family="IM Fell English SC, Georgia, serif" font-size="13" fill="#24170e" letter-spacing="2">LONG TABLE</text>
  <text x="92" y="66" text-anchor="middle" font-family="IM Fell Double Pica, Georgia, serif" font-style="italic" font-size="11" fill="#6f1526">strike on box</text>
</svg>`;

  const MATCH = `<svg viewBox="0 0 74 12" width="74" height="12" style="overflow:visible"><rect x="9" y="4" width="64" height="4.4" rx="1.4" fill="#d9b77e" stroke="#5b4026" stroke-width=".8"/><ellipse class="mh" cx="6.5" cy="6.2" rx="6.3" ry="5" fill="#9e2a22" stroke="#3a0d08" stroke-width=".9"/></svg>`;

  function dateLine() {
    const t = U.today();
    const tg = U.daysUntilThanksgiving();
    const fmt = (d) => `${U.DAYS[d.getDay()]}, ${U.MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    if (tg.days === 0) {
      const extra = t.getMonth() === 10 && t.getDate() === 26
        ? ` Washington declared the first national day of thanksgiving for this same date, ${t.getFullYear() - 1789} years ago.`
        : '';
      return { main: `${fmt(t)} · Today is Thanksgiving`, extra };
    }
    if (tg.days === 1) return { main: `${fmt(t)} · Thanksgiving is tomorrow`, extra: '' };
    return { main: `${fmt(t)} · Thanksgiving is in ${tg.days} days`, extra: '' };
  }

  LT.chapter({
    id: 'prelude', index: 0, title: 'Prelude', music: null, transition: 'cut',
    light: { darkness: 0.97, radius: 120 },
    mount(root, api) {
      root.classList.add('prelude');
      const title = el('div', { class: 'title' });
      const h1 = el('h1', { 'aria-label': 'The Long Table' });
      h1.appendChild(el('span', { class: 'the l' }, 'The'));
      const letters = [];
      'Long Table'.split('').forEach((ch) => {
        const s = el('span', { class: 'l', 'aria-hidden': 'true' }, ch === ' ' ? ' ' : ch);
        letters.push(s); h1.appendChild(s);
      });
      const dl = dateLine();
      title.append(h1, el('div', { class: 'sub' }, 'Thanksgiving, in five courses'), el('div', { class: 'date' }, dl.main));
      const canvas = el('canvas', { class: 'candle', 'aria-hidden': 'true' });
      const hint = el('div', { class: 'hint' }, 'It’s dark. Strike a match.', el('small', null, 'This has sound'));
      const box = el('button', { class: 'matchbox', type: 'button', 'aria-label': 'Strike a match' });
      box.innerHTML = MATCHBOX;
      const enter = el('button', { class: 'lt-btn enter', type: 'button' }, 'Come, sit down', el('span', { 'aria-hidden': 'true' }, '→'));
      const extra = el('p', { class: 'lt-prose', style: { textAlign: 'center', fontStyle: 'italic', margin: '0', maxWidth: '44ch', fontSize: 'var(--step--1)', color: 'var(--linen-2)', opacity: 0, transition: 'opacity 1.6s 1s' } }, dl.extra);
      const below = el('div', { class: 'below' }, hint, box);
      const skip = el('button', { class: 'skip', type: 'button' }, 'Skip intro');
      const stage = el('div', { class: 'stage' }, canvas, below);
      root.append(stage, title, skip);

      const candle = LT.candle(canvas, { lit: false });
      api.cleanup(() => candle.destroy());

      // Light the matchbox a little so it can be found.
      api.timeout(() => {
        const r = box.getBoundingClientRect();
        if (!LT.pointer.active) LT.light.moveTo(r.left + r.width / 2, r.top + r.height / 2, true);
      }, 60);

      let struck = false;
      async function strike(fast) {
        if (struck) return;
        struck = true;
        LT.audio.init();
        skip.remove();
        const r = box.getBoundingClientRect();
        const m = el('div', { class: 'match', html: MATCH });
        document.body.appendChild(m);
        api.cleanup(() => m.remove());
        const sx = r.left + r.width * 0.12, sy = r.top + r.height * 0.1;
        const place = (x, y, rot = -8) => { m.style.left = x - 6 + 'px'; m.style.top = y - 6 + 'px'; m.style.transform = `rotate(${rot}deg)`; };
        place(sx, sy);
        LT.light.follow(false);
        if (!fast) {
          await U.tween({ from: 0, to: 1, dur: 0.2, ease: 'inQuad', onUpdate: (k) => { place(sx + k * r.width * 0.75, sy + Math.sin(k * 3) * 2); } }).done;
        }
        if (!api.alive) return;
        LT.audio.sfx('match');
        const hx = sx + (fast ? 0 : r.width * 0.75), hy = sy;
        LT.fx.sparks(hx, hy, 34);
        LT.fx.glow(hx, hy, { size: 50, life: 0.5 });
        const head = m.querySelector('.mh');
        head && head.setAttribute('fill', '#3a1a10');
        const flame = el('div', { style: { position: 'absolute', left: '-9px', top: '-26px', width: '24px', height: '34px', borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%', background: 'radial-gradient(ellipse at 50% 75%, #fff4cc 0%, #ffcf6b 30%, #ff8a2a 60%, rgba(255,120,40,0) 75%)', filter: 'blur(.6px)', mixBlendMode: 'screen', animation: 'match-flicker .12s infinite alternate' } });
        m.appendChild(flame);
        LT.light.set({ darkness: 0.93, radius: 190 });
        LT.light.moveTo(hx, hy, true);
        hint.style.opacity = 0; box.style.transition = 'opacity .8s'; box.style.opacity = 0;
        await api.wait(fast ? 100 : 650);
        const fp = candle.flamePos();
        const tx = fp.x - 2, ty = fp.y + 22 * fp.s;
        await U.tween({ from: [hx, hy, -8], to: [tx, ty, -58], dur: fast ? 0.3 : 1.15, ease: 'inOutCubic', onUpdate: ([x, y, rot]) => { place(x, y, rot); LT.light.moveTo(x, y + 4, true); } }).done;
        if (!api.alive) return;
        await api.wait(fast ? 50 : 380);
        candle.light();
        LT.audio.sfx('whoomp');
        LT.fx.sparks(tx, ty - 10, 18, { speed: [60, 240] });
        LT.light.pulse();
        LT.light.set({ darkness: 0.9, radius: 330 });
        LT.light.moveTo(tx, ty - 30);
        LT.music.play('prelude', 4);
        // shake the match out
        await api.wait(500);
        flame.remove();
        LT.audio.sfx('snuff');
        LT.fx.smoke(tx + 30, ty, { count: 8 });
        m.animate([{ transform: 'rotate(-58deg)', opacity: 1 }, { transform: 'translate(40px, 160px) rotate(40deg)', opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.5,0,.8,.6)', fill: 'forwards' });
        // the title
        await api.wait(300);
        LT.light.set({ darkness: 0.74, radius: 560 });
        h1.querySelector('.the').classList.add('on');
        for (let i = 0; i < letters.length; i++) { await api.wait(85); letters[i].classList.add('on'); }
        title.classList.add('on');
        await api.wait(1400);
        LT.light.follow(true);
        below.innerHTML = '';
        below.append(enter, extra);
        requestAnimationFrame(() => { enter.classList.add('on'); extra.style.opacity = 1; });
        enter.focus({ preventScroll: true });
        LT.fx.embers(1.5);
      }
      api.on(box, 'click', () => strike(false));
      api.on(skip, 'click', () => { LT.audio.init(); candle.light(); LT.music.play('prelude', 1); LT.app.afterPrelude(); });
      api.on(enter, 'click', () => { LT.audio.sfx('clink'); LT.app.afterPrelude(); });
      // Any key strikes too (once you've found the box, the dark is optional).
      api.on(window, 'keydown', (e) => { if (!struck && (e.key === 'Enter' || e.key === ' ') && document.activeElement !== box) { e.preventDefault(); strike(false); } });
    },
  });
})();
