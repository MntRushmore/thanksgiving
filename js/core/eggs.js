/* Secrets that work anywhere. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el, S = U.svg;

  LT.defineEgg('stampede', 'Turkey stampede', 'An old cheat code works here.');
  LT.defineEgg('gravyflood', 'Gravy flood', 'Type what there is never enough of.');
  LT.defineEgg('pardon', 'Presidential pardon', 'Type the word a president says to a turkey.');
  LT.defineEgg('welcome', 'You’re welcome', 'Type the word this whole thing is about.');
  LT.defineEgg('nap', 'The nap', 'Step away from the table for a while.');

  const inPrelude = () => LT.current() === 'prelude';

  /* A cartoon turkey, side view, walking right. */
  function turkey(scale = 1, stamp) {
    const svg = S('svg', { viewBox: '-70 -110 150 130', width: 150 * scale, height: 130 * scale, class: 'egg-turkey', style: 'overflow:visible' });
    const tail = S('g', { class: 'tail' });
    ['#6f1526', '#b9552a', '#d9a441', '#646a3a', '#b9552a', '#6f1526', '#d9a441'].forEach((c, i) => {
      const a = -150 + i * 22;
      tail.appendChild(S('ellipse', { cx: 0, cy: -46, rx: 12, ry: 40, fill: c, stroke: '#1c130c', 'stroke-width': 2.5, transform: `rotate(${a + 90} -18 -30)` }));
    });
    svg.appendChild(tail);
    const legs = S('g', { class: 'legs', stroke: '#d9a441', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' },
      S('path', { class: 'leg l1', d: 'M-6 -6 L-10 16 M-10 16 l-7 3 M-10 16 l5 3' }),
      S('path', { class: 'leg l2', d: 'M10 -6 L12 16 M12 16 l-6 3 M12 16 l7 3' }));
    svg.appendChild(legs);
    svg.appendChild(S('ellipse', { cx: 2, cy: -30, rx: 34, ry: 28, fill: '#7a4a24', stroke: '#1c130c', 'stroke-width': 3 }));
    svg.appendChild(S('path', { d: 'M-14 -36 C-4 -24 8 -24 18 -34', stroke: '#5b3418', 'stroke-width': 3, fill: 'none' }));
    const head = S('g', { class: 'head' },
      S('path', { d: 'M24 -44 C30 -60 34 -74 40 -80', stroke: '#1c130c', 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round' }),
      S('path', { d: 'M24 -44 C30 -60 34 -74 40 -80', stroke: '#c99a6a', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }),
      S('circle', { cx: 42, cy: -84, r: 10, fill: '#c99a6a', stroke: '#1c130c', 'stroke-width': 2.5 }),
      S('path', { d: 'M50 -86 L60 -82 L50 -79 Z', fill: '#d9a441', stroke: '#1c130c', 'stroke-width': 1.5 }),
      S('path', { d: 'M50 -80 C54 -70 48 -64 46 -72', fill: '#b8243d', stroke: '#1c130c', 'stroke-width': 1.5 }),
      S('circle', { cx: 44, cy: -87, r: 2, fill: '#1c130c' }));
    svg.appendChild(head);
    if (stamp) {
      svg.appendChild(S('g', { transform: 'rotate(-14 0 -30)' },
        S('rect', { x: -48, y: -46, width: 96, height: 30, rx: 3, fill: 'none', stroke: '#b8243d', 'stroke-width': 4 }),
        S('text', { x: 0, y: -24, 'text-anchor': 'middle', 'font-family': 'IM Fell English SC, Georgia, serif', 'font-size': 19, fill: '#b8243d', 'letter-spacing': 2 }, 'PARDONED')));
    }
    return svg;
  }

  function layer() {
    const l = el('div', { class: 'egg-layer', 'aria-hidden': 'true' });
    document.getElementById('app').appendChild(l);
    return l;
  }

  /* Konami: the stampede */
  LT.bus.on('konami', () => {
    if (inPrelude()) return;
    const l = layer();
    const n = U.reducedMotion ? 3 : 14;
    for (let i = 0; i < n; i++) {
      const t = turkey(U.rand(0.55, 1.1));
      const wrap = el('div', { class: 'egg-runner', style: { top: `${U.rand(18, 82)}%`, animationDuration: `${U.rand(2.2, 4.2)}s`, animationDelay: `${U.rand(0, 1.8)}s` } }, t);
      l.appendChild(wrap);
      setTimeout(() => LT.audio.sfx('gobble', { pan: U.rand(-0.8, 0.8), f: U.rand(520, 820) }), U.rand(0, 2600));
    }
    LT.fx.shake(6, 2.4);
    setTimeout(() => l.remove(), 7200);
    LT.egg('stampede', 'Turkey stampede', 'Up, up, down, down, left, right, left, right, gobble, gobble.');
  });

  /* "gravy": a flood */
  let flooding = false;
  LT.onWord('gravy', () => {
    if (flooding || inPrelude()) return;
    flooding = true;
    const l = layer();
    const svg = S('svg', { class: 'egg-gravy', viewBox: '0 0 1200 800', preserveAspectRatio: 'none' });
    const wave = S('path', { fill: '#6b3f1d' });
    const wave2 = S('path', { fill: 'rgba(140,90,45,.6)' });
    svg.append(wave2, wave);
    l.appendChild(svg);
    LT.audio.sfx('pour', { n: 14 });
    setTimeout(() => LT.audio.sfx('pour', { n: 10 }), 1300);
    let t = 0, level = 0;
    const off = LT.loop.add((dt) => {
      t += dt;
      level = t < 2.6 ? U.ease.outCubic(t / 2.6) * 0.62 : t < 4.2 ? 0.62 : Math.max(0, 0.62 - U.ease.inCubic((t - 4.2) / 1.8) * 0.7);
      const y = 800 - level * 800;
      const mk = (amp, ph, sp) => {
        let d = `M0 ${y}`;
        for (let x = 0; x <= 1200; x += 40) d += ` L${x} ${y + Math.sin(x / 120 + t * sp + ph) * amp}`;
        return d + ' L1200 800 L0 800 Z';
      };
      wave.setAttribute('d', mk(16, 0, 2.4));
      wave2.setAttribute('d', mk(22, 1.8, 1.7));
      if (t > 6.2) { off(); l.remove(); flooding = false; }
    });
    LT.egg('gravyflood', 'Gravy flood', 'There is never enough gravy. Until there is.');
  });

  /* "pardon": one lucky bird */
  LT.onWord('pardon', () => {
    if (inPrelude()) return;
    const l = layer();
    const wrap = el('div', { class: 'egg-runner egg-strut', style: { bottom: '6%', animationDuration: '6s' } }, turkey(1.1, true));
    l.appendChild(wrap);
    LT.audio.sfx('tada');
    setTimeout(() => LT.audio.sfx('gobble'), 900);
    setTimeout(() => l.remove(), 6400);
    LT.egg('pardon', 'Presidential pardon', 'Since 1989, one lucky bird a year walks free. Today it was this one.');
  });

  /* "thanks": you're welcome */
  const welcome = () => {
    if (inPrelude()) return;
    LT.fx.confetti(innerWidth / 2, innerHeight * 0.7, { count: 90 });
    LT.audio.sfx('chime');
    LT.egg('welcome', 'You’re welcome', 'Thank you for saying it.');
  };
  LT.onWord('thanks', welcome);
  LT.onWord('thankyou', welcome);

  /* Wander off and someone falls asleep. */
  let lastInput = performance.now(), napping = null;
  const wake = () => {
    lastInput = performance.now();
    if (napping) {
      const n = napping; napping = null;
      n.classList.add('waking');
      setTimeout(() => n.remove(), 900);
      LT.egg('nap', 'The nap', 'Someone always falls asleep on the couch. Tonight it was you. (It’s not the tryptophan. It’s the second plate.)');
    }
  };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((e) => addEventListener(e, wake, { passive: true }));
  addEventListener('pointermove', () => { if (!napping) lastInput = performance.now(); else if (LT.pointer.speed > 6) wake(); }, { passive: true });
  setInterval(() => {
    if (napping || document.hidden || inPrelude() || !LT.current()) return;
    if (performance.now() - lastInput > 90000) {
      napping = el('div', { class: 'egg-nap', 'aria-hidden': 'true' }, el('span', { class: 'z z1' }, 'z'), el('span', { class: 'z z2' }, 'z'), el('span', { class: 'z z3' }, 'Z'));
      document.getElementById('app').appendChild(napping);
    }
  }, 3000);

  /* styles for the above, kept beside the code */
  const css = `
.egg-layer{position:fixed;inset:0;z-index:45;pointer-events:none;overflow:hidden}
.egg-runner{position:absolute;left:-200px;animation:egg-run linear both}
.egg-strut{animation-name:egg-run}
.egg-runner .legs .l1{animation:egg-leg .28s ease-in-out infinite alternate;transform-origin:-6px -6px}
.egg-runner .legs .l2{animation:egg-leg .28s ease-in-out infinite alternate-reverse;transform-origin:10px -6px}
.egg-runner .head{animation:egg-head .28s ease-in-out infinite alternate;transform-origin:24px -44px}
.egg-runner svg{filter:drop-shadow(0 10px 8px rgba(0,0,0,.45))}
@keyframes egg-run{from{transform:translateX(0)}to{transform:translateX(calc(100vw + 400px))}}
@keyframes egg-leg{from{transform:rotate(-22deg)}to{transform:rotate(22deg)}}
@keyframes egg-head{from{transform:rotate(-6deg)}to{transform:rotate(8deg) translateX(3px)}}
.egg-gravy{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 -6px 10px rgba(0,0,0,.4))}
.egg-nap{position:fixed;inset:0;z-index:44;pointer-events:none;background:rgba(5,4,2,.55);animation:egg-nap-in 6s ease-in both}
.egg-nap.waking{animation:egg-nap-out .8s ease-out both}
.egg-nap .z{position:absolute;left:50%;top:55%;font-family:var(--f-hand);font-weight:700;color:var(--linen-2);font-size:42px;animation:egg-z 3.6s ease-out infinite}
.egg-nap .z2{animation-delay:1.2s;font-size:56px}.egg-nap .z3{animation-delay:2.4s;font-size:72px}
@keyframes egg-z{0%{opacity:0;transform:translate(0,0) rotate(-10deg)}20%{opacity:.9}100%{opacity:0;transform:translate(80px,-180px) rotate(12deg)}}
@keyframes egg-nap-in{from{opacity:0}to{opacity:1}}
@keyframes egg-nap-out{to{opacity:0}}
`;
  document.head.appendChild(el('style', null, css));
})();
