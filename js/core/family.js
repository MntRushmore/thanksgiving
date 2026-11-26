/* The Long Table — the family. Drawn in SVG, animated by hand. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, S = U.svg;
  const INK = '#1c130c';

  /*
   * The cast. Relationships:
   *   Grandma Ruth (84) was married 51 years to Grandpa Joe (died three years ago; she still sets his place).
   *   Her kids: Mom (Denise, the host) and Uncle Dale.
   *   Mom + Dad (Raj) -> Maya (16) and Benji (4). Dale + Aunt Linda -> Cousin Tyler (29).
   *   Tyler brought Skye (they/them) for the first time. Biscuit is the dog. You are family too.
   */
  const cast = [
    { id: 'grandma', name: 'Grandma Ruth', short: 'Grandma', blurb: '84. Head of the table. Hears what she wants to hear.', skin: '#ecc7a6', hair: '#dcd8cf', hairStyle: 'bun', shirt: '#6a3456', inner: '#efe6d2', acc: ['cardigan', 'glasses', 'pearls', 'hearingaid'], scale: 0.9, voice: 1.25 },
    { id: 'dale', name: 'Uncle Dale', short: 'Dale', blurb: 'Owns a turkey fryer. Owns several opinions.', skin: '#e3a985', hair: '#6b5444', hairStyle: 'cap', cap: '#2e4a37', shirt: 'url(#lt-plaid)', acc: ['mustache'], scale: 1.06, voice: 0.8 },
    { id: 'linda', name: 'Aunt Linda', short: 'Linda', blurb: 'Loves you. Needs to know if you are seeing anyone.', skin: '#f1cba9', hair: '#9a4321', hairStyle: 'curly', shirt: '#2c7a74', acc: ['brooch', 'earrings', 'lipstick'], scale: 0.98, voice: 1.15 },
    { id: 'mom', name: 'Mom', short: 'Mom', blurb: 'The host. Has not sat down since 6 a.m.', skin: '#cf9670', hair: '#3a2418', hairStyle: 'clip', shirt: '#b9552a', acc: ['apron'], scale: 1, voice: 1.1 },
    { id: 'dad', name: 'Dad', short: 'Dad', blurb: 'Carves the turkey. Narrates the carving.', skin: '#a8714d', hair: '#1d1612', hairStyle: 'short', shirt: '#3d5878', acc: ['collar', 'squareglasses', 'stubble'], scale: 1.02, voice: 0.9 },
    { id: 'tyler', name: 'Cousin Tyler', short: 'Tyler', blurb: '29. Has a startup. Has a cold plunge.', skin: '#efc29e', hair: '#c9a36a', hairStyle: 'beanie', beanie: '#d9a441', shirt: '#cbc2ae', acc: ['vest'], scale: 1.04, voice: 1 },
    { id: 'skye', name: 'Skye', short: 'Skye', blurb: "Tyler's partner. First Thanksgiving with this family. Brought a tofurkey.", skin: '#7b5038', hair: '#1a1210', hairStyle: 'coils', shirt: '#7e8a5c', acc: ['turtleneck', 'hoops'], scale: 0.97, voice: 1.05 },
    { id: 'maya', name: 'Maya', short: 'Maya', blurb: '16. On her phone. Notices everything.', skin: '#bb8562', hair: '#26170f', hairStyle: 'long', shirt: '#5b4870', acc: ['hoodie', 'airpods'], scale: 0.95, voice: 1.2 },
    { id: 'benji', name: 'Benji', short: 'Benji', blurb: '4. Dinosaur expert. Pea thrower.', skin: '#c79270', hair: '#2a1a12', hairStyle: 'tuft', shirt: '#4c8748', acc: ['dino'], scale: 0.62, voice: 1.6 },
  ];
  const byId = Object.fromEntries(cast.map((c) => [c.id, c]));
  const dog = { id: 'biscuit', name: 'Biscuit', short: 'Biscuit', blurb: 'Good boy. Opportunist. Under the table.' };
  const joe = { id: 'joe', name: 'Grandpa Joe', short: 'Joe', blurb: 'Not here this year. His place is set anyway.' };

  /* ---------- shared defs (patterns) ---------- */
  function ensureDefs() {
    if (document.getElementById('lt-family-defs')) return;
    const svg = S('svg', { id: 'lt-family-defs', width: 0, height: 0, 'aria-hidden': 'true', style: 'position:absolute;width:0;height:0;overflow:hidden' });
    const defs = S('defs');
    const plaid = S('pattern', { id: 'lt-plaid', width: 28, height: 28, patternUnits: 'userSpaceOnUse' },
      S('rect', { width: 28, height: 28, fill: '#a3302a' }),
      S('rect', { y: 9, width: 28, height: 9, fill: 'rgba(20,10,8,.38)' }),
      S('rect', { x: 9, width: 9, height: 28, fill: 'rgba(20,10,8,.38)' }),
      S('rect', { y: 22, width: 28, height: 2, fill: 'rgba(240,220,190,.28)' }),
      S('rect', { x: 22, width: 2, height: 28, fill: 'rgba(240,220,190,.28)' }));
    const quilt = S('pattern', { id: 'lt-quilt', width: 20, height: 16, patternUnits: 'userSpaceOnUse' },
      S('rect', { width: 20, height: 16, fill: '#d0662a' }),
      S('path', { d: 'M0 15.5 H20', stroke: 'rgba(60,20,5,.35)', 'stroke-width': 2 }),
      S('path', { d: 'M0 4 Q10 9 20 4', stroke: 'rgba(255,220,180,.22)', 'stroke-width': 3, fill: 'none' }));
    const knit = S('pattern', { id: 'lt-knit', width: 10, height: 8, patternUnits: 'userSpaceOnUse' },
      S('rect', { width: 10, height: 8, fill: '#7e8a5c' }),
      S('path', { d: 'M0 0 L5 6 L10 0', stroke: 'rgba(30,35,15,.25)', 'stroke-width': 1.4, fill: 'none' }));
    defs.append(plaid, quilt, knit);
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  const shade = (c, amt) => {
    // darken (amt<0) or lighten (amt>0) a #rrggbb color
    if (!/^#/.test(c)) return c;
    const n = parseInt(c.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = (v) => U.clamp(Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt), 0, 255);
    r = f(r); g = f(g); b = f(b);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };
  const stroke = { stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };

  /* ---------- hair (head-local coords; head centre at 0,0; rx 36 ry 41) ---------- */
  function hairBack(c) {
    const h = c.hair;
    switch (c.hairStyle) {
      case 'curly': {
        const g = S('g');
        const pts = [[-44, -18], [-48, 6], [-42, 28], [-30, -38], [-10, -50], [14, -50], [34, -38], [46, -16], [48, 8], [42, 30], [-46, 46], [44, 46]];
        pts.forEach(([x, y], i) => g.appendChild(S('circle', { cx: x, cy: y, r: 17 + (i % 3) * 2, fill: h, ...stroke })));
        pts.forEach(([x, y], i) => g.appendChild(S('circle', { cx: x, cy: y, r: 15 + (i % 3) * 2, fill: h })));
        return g;
      }
      case 'long':
        return S('path', { d: 'M-40 -14 C-46 30 -50 80 -44 112 L44 112 C50 80 46 30 40 -14 C30 -50 -30 -50 -40 -14Z', fill: h, ...stroke });
      case 'coils': {
        const g = S('g');
        for (let i = 0; i < 16; i++) {
          const a = Math.PI + (i / 15) * Math.PI, x = Math.cos(a) * 46, y = Math.sin(a) * 50 - 2;
          g.appendChild(S('circle', { cx: x, cy: y, r: 15, fill: h, ...stroke }));
        }
        g.appendChild(S('ellipse', { cx: 0, cy: -14, rx: 48, ry: 44, fill: h }));
        return g;
      }
      case 'bun':
        return S('g', null,
          S('circle', { cx: 0, cy: -46, r: 17, fill: h, ...stroke }),
          S('path', { d: 'M-8 -56 Q0 -40 10 -54', stroke: shade(h, -0.25), 'stroke-width': 2, fill: 'none' }));
      case 'clip':
        return S('g', null,
          S('path', { d: 'M-14 -40 C-30 -70 30 -72 16 -40Z', fill: h, ...stroke }),
          S('rect', { x: -15, y: -60, width: 30, height: 11, rx: 4, fill: '#f2c14e', ...stroke, 'stroke-width': 2 }));
      default:
        return null;
    }
  }
  function hairFront(c) {
    const h = c.hair, d = shade(h, -0.25);
    switch (c.hairStyle) {
      case 'bun':
        return S('g', null,
          S('path', { d: 'M-37 -4 C-40 -40 -10 -46 0 -44 C12 -46 40 -40 37 -4 C30 -26 16 -34 0 -30 C-16 -34 -30 -26 -37 -4Z', fill: h, ...stroke }),
          S('path', { d: 'M-24 -30 Q-12 -38 0 -31 M24 -30 Q12 -38 2 -31', stroke: d, 'stroke-width': 1.6, fill: 'none' }));
      case 'cap':
        return S('g', null,
          S('path', { d: 'M-37 -2 L-39 12 L-33 10Z M37 -2 L39 12 L33 10Z', fill: h, ...stroke, 'stroke-width': 2 }),
          S('path', { d: 'M-39 -10 C-40 -50 40 -50 39 -10Z', fill: c.cap, ...stroke }),
          S('path', { d: 'M-42 -12 C-30 -2 30 -2 42 -12 C44 -6 40 0 30 2 C10 6 -10 6 -30 2 C-40 0 -44 -6 -42 -12Z', fill: shade(c.cap, -0.2), ...stroke }),
          S('rect', { x: -11, y: -34, width: 22, height: 13, rx: 2, fill: '#efe6d2', stroke: INK, 'stroke-width': 1.5 }),
          S('path', { d: 'M-7 -28 h14', stroke: '#a3302a', 'stroke-width': 3 }));
      case 'curly': {
        const g = S('g');
        [[-26, -34, 15], [-6, -42, 16], [16, -40, 15], [32, -26, 13], [-36, -18, 12]].forEach(([x, y, r]) => {
          g.appendChild(S('circle', { cx: x, cy: y, r, fill: h, ...stroke }));
        });
        [[-26, -34, 13], [-6, -42, 14], [16, -40, 13], [32, -26, 11], [-36, -18, 10]].forEach(([x, y, r]) => g.appendChild(S('circle', { cx: x, cy: y, r, fill: h })));
        return g;
      }
      case 'clip':
        return S('g', null,
          S('path', { d: 'M-37 0 C-40 -42 40 -44 37 0 C28 -22 12 -30 -6 -26 C-20 -30 -32 -18 -37 0Z', fill: h, ...stroke }),
          S('path', { d: 'M-34 2 C-40 18 -38 30 -32 40', stroke: h, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
          S('path', { d: 'M33 0 C40 16 40 24 36 34', stroke: h, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }));
      case 'short':
        return S('g', null,
          S('path', { d: 'M-37 -2 C-42 -46 42 -48 37 -2 C34 -18 26 -28 6 -28 C-14 -26 -32 -22 -37 -2Z', fill: h, ...stroke }),
          S('path', { d: 'M-36 -6 C-35 -14 -32 -18 -30 -18 L-31 -2Z M36 -6 C35 -14 32 -18 30 -18 L31 -2Z', fill: '#8a8580' }));
      case 'beanie':
        return S('g', null,
          S('path', { d: 'M-38 2 C-40 12 -36 20 -32 22 M38 2 C40 12 36 20 32 22', stroke: c.hair, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
          S('path', { d: 'M-40 -6 C-44 -62 44 -62 40 -6Z', fill: c.beanie, ...stroke }),
          S('rect', { x: -42, y: -16, width: 84, height: 16, rx: 6, fill: shade(c.beanie, -0.15), ...stroke }),
          S('path', { d: 'M-30 -14v12M-18 -14v12M-6 -14v12M6 -14v12M18 -14v12M30 -14v12', stroke: shade(c.beanie, -0.35), 'stroke-width': 1.5 }));
      case 'coils': {
        const g = S('g');
        [[-30, -32], [-12, -42], [8, -44], [26, -36], [38, -20], [-40, -16]].forEach(([x, y]) => {
          g.appendChild(S('circle', { cx: x, cy: y, r: 14, fill: h, ...stroke }));
        });
        [[-30, -32], [-12, -42], [8, -44], [26, -36], [38, -20], [-40, -16]].forEach(([x, y]) => g.appendChild(S('circle', { cx: x, cy: y, r: 12, fill: h })));
        return g;
      }
      case 'long':
        return S('path', { d: 'M-38 10 C-42 -40 42 -44 38 10 C32 -14 16 -26 2 -30 C-2 -22 -24 -10 -38 10Z', fill: h, ...stroke });
      case 'tuft':
        return S('g', null,
          S('path', { d: 'M-36 -6 C-40 -40 40 -44 36 -6 C26 -22 -26 -22 -36 -6Z', fill: h, ...stroke }),
          S('path', { d: 'M-2 -40 C-6 -56 8 -62 6 -50 C14 -60 18 -48 8 -42', fill: h, ...stroke, 'stroke-width': 2.5 }));
    }
    return null;
  }

  /* ---------- a figure ---------- */
  function figure(id, opts = {}) {
    ensureDefs();
    const c = byId[id];
    if (!c) throw new Error('no such family member: ' + id);
    const scale = (opts.scale || 1) * c.scale;
    const root = S('g', { class: 'fam fam--' + id, 'data-id': id });
    const body = S('g', { class: 'fam-body' });
    root.appendChild(S('g', { transform: `scale(${scale})` }, body));

    // arms (behind torso)
    const arm = (side) => {
      const g = S('g', { class: 'fam-arm' });
      const sleeve = c.acc.includes('vest') ? c.shirt : c.shirt;
      g.appendChild(S('path', { d: `M0 0 C${side * 8} 30 ${side * 6} 60 ${side * 2} 88`, stroke: INK, 'stroke-width': 25, 'stroke-linecap': 'round', fill: 'none' }));
      g.appendChild(S('path', { d: `M0 0 C${side * 8} 30 ${side * 6} 60 ${side * 2} 88`, stroke: sleeve, 'stroke-width': 19, 'stroke-linecap': 'round', fill: 'none' }));
      g.appendChild(S('circle', { cx: side * 2, cy: 96, r: 10.5, fill: c.skin, ...stroke, 'stroke-width': 2.5 }));
      return g;
    };
    const armL = arm(-1), armR = arm(1);
    const armLWrap = S('g', { transform: 'translate(-44,-104)' }, armL);
    const armRWrap = S('g', { transform: 'translate(44,-104)' }, armR);
    body.append(armLWrap, armRWrap);

    // hair behind head
    const head = S('g', { class: 'fam-head' });
    const headWrap = S('g', { transform: 'translate(0,-166)' }, head);
    const back = hairBack(c);
    if (c.acc.includes('hoodie')) body.appendChild(S('path', { d: 'M-52 -100 C-50 -140 50 -140 52 -100 Z', fill: shade(c.shirt, -0.2), ...stroke }));

    // torso
    const torsoD = 'M-58 6 C-60 -40 -60 -80 -52 -100 C-44 -114 -24 -118 -12 -120 L12 -120 C24 -118 44 -114 52 -100 C60 -80 60 -40 58 6 Z';
    let shirtFill = c.shirt;
    if (c.acc.includes('turtleneck')) shirtFill = 'url(#lt-knit)';
    body.appendChild(S('path', { d: torsoD, fill: shirtFill, ...stroke }));
    body.appendChild(S('path', { d: 'M20 -116 C44 -110 56 -96 58 -60 L58 6 L34 6 C40 -40 36 -90 20 -116Z', fill: 'rgba(0,0,0,.16)' }));
    // neck
    body.appendChild(S('path', { d: 'M-12 -142 L-12 -114 C-6 -108 6 -108 12 -114 L12 -142Z', fill: shade(c.skin, -0.12), ...stroke, 'stroke-width': 2.5 }));

    // torso accessories
    if (c.acc.includes('cardigan')) {
      body.appendChild(S('path', { d: 'M-16 -118 L0 -70 L16 -118 Z', fill: c.inner, ...stroke, 'stroke-width': 2.5 }));
      body.appendChild(S('path', { d: 'M0 -70 L0 6', stroke: INK, 'stroke-width': 2.5 }));
      [-50, -30, -10].forEach((y) => body.appendChild(S('circle', { cx: 6, cy: y, r: 3, fill: '#d8cbb0', stroke: INK, 'stroke-width': 1.2 })));
    }
    if (c.acc.includes('pearls')) {
      for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + (i / 8) * 0.7); body.appendChild(S('circle', { cx: Math.cos(a) * 15, cy: -116 + Math.sin(a) * 9, r: 2.6, fill: '#f6f1e4', stroke: 'rgba(0,0,0,.35)', 'stroke-width': 0.8 })); }
    }
    if (c.acc.includes('apron')) {
      body.appendChild(S('path', { d: 'M-30 -96 L30 -96 L40 6 L-40 6 Z', fill: '#efe6d2', ...stroke, 'stroke-width': 2.5 }));
      body.appendChild(S('path', { d: 'M-24 -96 C-22 -110 -14 -116 -10 -118 M24 -96 C22 -110 14 -116 10 -118', stroke: '#efe6d2', 'stroke-width': 5, fill: 'none' }));
      body.appendChild(S('path', { d: 'M-20 -40 h40 v22 h-40z', fill: 'none', stroke: 'rgba(28,19,12,.4)', 'stroke-width': 1.5 }));
      body.appendChild(S('path', { d: 'M-12 -78 q6 -8 12 0 q6 -8 12 0 l-12 12z', fill: '#b8243d' }));
    }
    if (c.acc.includes('collar')) {
      body.appendChild(S('path', { d: 'M-14 -118 L-2 -100 L-20 -104 Z M14 -118 L2 -100 L20 -104 Z', fill: '#eef0f2', ...stroke, 'stroke-width': 2 }));
    }
    if (c.acc.includes('vest')) {
      body.appendChild(S('path', { d: 'M-58 6 C-60 -40 -60 -80 -50 -100 C-42 -112 -30 -116 -20 -118 L-8 -60 L-8 6Z', fill: 'url(#lt-quilt)', ...stroke }));
      body.appendChild(S('path', { d: 'M58 6 C60 -40 60 -80 50 -100 C42 -112 30 -116 20 -118 L8 -60 L8 6Z', fill: 'url(#lt-quilt)', ...stroke }));
      body.appendChild(S('path', { d: 'M-6 -110 v16 M0 -112 v10', stroke: INK, 'stroke-width': 1.5 }));
    }
    if (c.acc.includes('turtleneck')) {
      body.appendChild(S('path', { d: 'M-20 -112 C-22 -134 22 -134 20 -112 C10 -106 -10 -106 -20 -112Z', fill: '#7e8a5c', ...stroke, 'stroke-width': 2.5 }));
    }
    if (c.acc.includes('hoodie')) {
      body.appendChild(S('path', { d: 'M-20 -116 C-10 -100 10 -100 20 -116', stroke: shade(c.shirt, -0.35), 'stroke-width': 3, fill: 'none' }));
      body.appendChild(S('path', { d: 'M-8 -104 l-2 34 M8 -104 l2 30', stroke: '#e9e2d3', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      body.appendChild(S('path', { d: 'M-34 -30 h68 v26 h-68z', fill: 'none', stroke: shade(c.shirt, -0.35), 'stroke-width': 2 }));
    }
    if (c.acc.includes('brooch')) {
      const b = S('g', { transform: 'translate(-28,-80)' });
      [-50, -20, 10, 40, 70].forEach((a, i) => b.appendChild(S('ellipse', { cx: 0, cy: -6, rx: 3.5, ry: 8, fill: ['#b8243d', '#e0662f', '#f2c14e', '#e0662f', '#b8243d'][i], transform: `rotate(${a - 10})` })));
      b.appendChild(S('circle', { r: 5, fill: '#7a4a24', stroke: INK, 'stroke-width': 1 }));
      body.appendChild(b);
    }
    if (c.acc.includes('dino')) {
      body.appendChild(S('path', { d: 'M-26 -40 C-24 -56 -6 -62 6 -56 L10 -66 C14 -72 24 -70 24 -62 C24 -56 18 -54 14 -54 L16 -40 L10 -40 L8 -46 L-6 -46 L-8 -40 L-14 -40 L-14 -46 C-22 -44 -30 -36 -36 -38 Z', fill: '#2f5f2c' }));
      body.appendChild(S('circle', { cx: 18, cy: -63, r: 1.6, fill: '#efe6d2' }));
    }

    // head
    if (back) head.appendChild(back);
    head.appendChild(S('ellipse', { cx: -36, cy: 2, rx: 7, ry: 9, fill: c.skin, ...stroke, 'stroke-width': 2.5 }));
    head.appendChild(S('ellipse', { cx: 36, cy: 2, rx: 7, ry: 9, fill: c.skin, ...stroke, 'stroke-width': 2.5 }));
    head.appendChild(S('ellipse', { cx: 0, cy: 0, rx: 36, ry: 41, fill: c.skin, ...stroke }));
    head.appendChild(S('path', { d: 'M18 -34 C34 -24 40 0 30 28 C24 36 14 40 6 41 C26 22 30 -10 18 -34Z', fill: 'rgba(0,0,0,.08)' }));
    if (c.acc.includes('stubble')) head.appendChild(S('path', { d: 'M-28 14 C-24 38 24 38 28 14 C20 30 -20 30 -28 14Z', fill: 'rgba(29,22,18,.35)' }));
    // cheeks
    head.appendChild(S('circle', { cx: -21, cy: 14, r: 7, fill: '#e0705a', opacity: 0.28 }));
    head.appendChild(S('circle', { cx: 21, cy: 14, r: 7, fill: '#e0705a', opacity: 0.28 }));
    // face
    const face = S('g', { class: 'fam-face' });
    const eyes = S('g', { class: 'fam-eyes' });
    const eyeL = S('ellipse', { cx: -13, cy: -2, rx: 3.6, ry: 4.4, fill: INK });
    const eyeR = S('ellipse', { cx: 13, cy: -2, rx: 3.6, ry: 4.4, fill: INK });
    eyes.append(eyeL, eyeR);
    const browL = S('path', { d: 'M-20 -14 Q-13 -18 -6 -14', stroke: shade(c.hair === '#dcd8cf' ? '#8e877c' : c.hair, -0.1), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
    const browR = S('path', { d: 'M6 -14 Q13 -18 20 -14', stroke: shade(c.hair === '#dcd8cf' ? '#8e877c' : c.hair, -0.1), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
    const nose = S('path', { d: 'M-1 2 Q-5 12 1 13', stroke: shade(c.skin, -0.35), 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
    const mouth = S('path', { d: '', fill: '#5a1f1a', stroke: INK, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    face.append(eyes, browL, browR, nose, mouth);
    head.appendChild(face);
    if (c.acc.includes('mustache')) head.appendChild(S('path', { d: 'M-18 20 C-12 12 -4 14 0 17 C4 14 12 12 18 20 C14 24 6 22 0 20 C-6 22 -14 24 -18 20Z', fill: c.hair, ...stroke, 'stroke-width': 2 }));
    const front = hairFront(c);
    if (front) head.appendChild(front);
    if (c.acc.includes('glasses')) {
      head.appendChild(S('g', { fill: 'rgba(255,255,255,.12)', stroke: '#8a6d3b', 'stroke-width': 2.2 },
        S('circle', { cx: -13, cy: -2, r: 10 }), S('circle', { cx: 13, cy: -2, r: 10 }), S('path', { d: 'M-3 -3 Q0 -6 3 -3', fill: 'none' })));
    }
    if (c.acc.includes('squareglasses')) {
      head.appendChild(S('g', { fill: 'rgba(255,255,255,.1)', stroke: INK, 'stroke-width': 2.6 },
        S('rect', { x: -25, y: -11, width: 20, height: 15, rx: 4 }), S('rect', { x: 5, y: -11, width: 20, height: 15, rx: 4 }), S('path', { d: 'M-5 -5 H5', fill: 'none' })));
    }
    if (c.acc.includes('hearingaid')) head.appendChild(S('path', { d: 'M-40 -6 C-46 -2 -46 8 -41 10', stroke: '#d8b48e', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }));
    if (c.acc.includes('earrings')) { head.appendChild(S('circle', { cx: -37, cy: 14, r: 4, fill: '#f2c14e', stroke: INK, 'stroke-width': 1.2 })); head.appendChild(S('circle', { cx: 37, cy: 14, r: 4, fill: '#f2c14e', stroke: INK, 'stroke-width': 1.2 })); }
    if (c.acc.includes('hoops')) { head.appendChild(S('circle', { cx: -38, cy: 16, r: 6, fill: 'none', stroke: '#f2c14e', 'stroke-width': 2 })); head.appendChild(S('circle', { cx: 38, cy: 16, r: 6, fill: 'none', stroke: '#f2c14e', 'stroke-width': 2 })); }
    if (c.acc.includes('airpods')) { head.appendChild(S('rect', { x: -41, y: 0, width: 5, height: 11, rx: 2.5, fill: '#fafafa', stroke: INK, 'stroke-width': 1 })); head.appendChild(S('rect', { x: 36, y: 0, width: 5, height: 11, rx: 2.5, fill: '#fafafa', stroke: INK, 'stroke-width': 1 })); }
    body.appendChild(headWrap);

    /* ---------- expressions ---------- */
    const MOODS = {
      neutral: { brow: [0, 0], mouth: 'M-9 22 Q0 25 9 22', eyes: 1 },
      happy: { brow: [-2, -2], mouth: 'M-12 19 Q0 32 12 19 Q0 24 -12 19Z', eyes: 1 },
      grin: { brow: [-3, -3], mouth: 'M-14 18 Q0 36 14 18 Z', eyes: 0.5 },
      mad: { brow: [5, 5], tilt: 1, mouth: 'M-10 26 Q0 19 10 26', eyes: 0.8 },
      shock: { brow: [-6, -6], mouth: 'M-6 20 Q0 34 6 20 Q0 14 -6 20Z', eyes: 1.3 },
      sad: { brow: [-3, -3], tilt: -1, mouth: 'M-9 27 Q0 20 9 27', eyes: 0.9 },
      sleep: { brow: [2, 2], mouth: 'M-5 24 Q0 28 5 24', eyes: 0.08 },
      smug: { brow: [-1, 3], mouth: 'M-10 22 Q4 27 12 18', eyes: 0.6 },
      tender: { brow: [-3, -3], tilt: -1, mouth: 'M-10 21 Q0 28 10 21', eyes: 0.55 },
      worried: { brow: [-2, -2], tilt: -1.5, mouth: 'M-10 24 Q-4 21 0 24 Q4 27 10 23', eyes: 1 },
    };
    const st = { mood: opts.mood || 'neutral', talking: false, talkT: 0, blinkT: U.rand(1, 4), blinking: 0, look: 0, lookT: 0, t: U.rand(10), bob: opts.bob ?? 1, armL: 12, armR: -12, armLT: 12, armRT: -12, tilt: 0, alive: true };
    function applyMood() {
      const m = MOODS[st.mood] || MOODS.neutral;
      const tl = (m.tilt || 0) * 3;
      browL.setAttribute('d', `M-20 ${-14 + m.brow[0] - tl} Q-13 ${-18 + m.brow[0]} -6 ${-14 + m.brow[0] + tl}`);
      browR.setAttribute('d', `M6 ${-14 + m.brow[1] + tl} Q13 ${-18 + m.brow[1]} 20 ${-14 + m.brow[1] - tl}`);
      st.eyeScale = m.eyes;
      if (!st.talking) mouth.setAttribute('d', m.mouth);
      mouth.setAttribute('fill', /Z$/.test(m.mouth) ? '#5a1f1a' : 'none');
    }
    applyMood();

    const off = LT.loop.add((dt) => {
      if (!st.alive) return;
      st.t += dt;
      // blink
      st.blinkT -= dt;
      if (st.blinkT <= 0) { st.blinking = 0.13; st.blinkT = U.rand(2, 5.5); }
      if (st.blinking > 0) st.blinking -= dt;
      const ey = (st.blinking > 0 ? 0.1 : 1) * (st.eyeScale ?? 1);
      eyeL.setAttribute('ry', (4.4 * ey).toFixed(2));
      eyeR.setAttribute('ry', (4.4 * ey).toFixed(2));
      // look
      st.look += (st.lookT - st.look) * Math.min(1, dt * 6);
      eyes.setAttribute('transform', `translate(${(st.look * 4).toFixed(2)},0)`);
      // talking
      if (st.talking) {
        st.talkT += dt * 11 * (c.voice || 1);
        const o = Math.abs(Math.sin(st.talkT)) * 0.8 + Math.abs(Math.sin(st.talkT * 1.7)) * 0.4;
        const h = 3 + o * 9;
        mouth.setAttribute('d', `M-9 20 Q0 ${20 + h * 1.4} 9 20 Q0 ${20 - h * 0.2} -9 20Z`);
        mouth.setAttribute('fill', '#5a1f1a');
      }
      // arms
      st.armL += (st.armLT - st.armL) * Math.min(1, dt * 8);
      st.armR += (st.armRT - st.armR) * Math.min(1, dt * 8);
      armL.setAttribute('transform', `rotate(${st.armL.toFixed(2)})`);
      armR.setAttribute('transform', `rotate(${st.armR.toFixed(2)})`);
      // breathe / bob / head tilt
      const b = Math.sin(st.t * 1.6) * 1.6 * st.bob + (st.talking ? Math.sin(st.talkT * 0.5) * 1.5 : 0);
      body.setAttribute('transform', `translate(0,${b.toFixed(2)})`);
      const tilt = st.tilt + (st.talking ? Math.sin(st.talkT * 0.31) * 3 : Math.sin(st.t * 0.7) * 1.2) + st.look * 3;
      head.setAttribute('transform', `rotate(${tilt.toFixed(2)})`);
    });

    const api = {
      el: root, id, def: c,
      talk(on = true) { st.talking = on; if (!on) applyMood(); return api; },
      mood(m) { st.mood = m; applyMood(); return api; },
      blink() { st.blinking = 0.13; return api; },
      lookAt(dx) { st.lookT = U.clamp(dx, -1, 1); return api; },
      tilt(deg) { st.tilt = deg; return api; },
      arms(l, r) { if (l != null) st.armLT = l; if (r != null) st.armRT = r; return api; },
      raise(side = 'r') { if (side === 'r') st.armRT = -150; else st.armLT = 150; return api; },
      rest() { st.armLT = 12; st.armRT = -12; return api; },
      bob(v) { st.bob = v; return api; },
      destroy() { st.alive = false; off(); root.remove(); },
    };
    api.arms(opts.armL ?? 12, opts.armR ?? -12);
    return api;
  }

  /* ---------- Biscuit ---------- */
  function dogFigure(opts = {}) {
    const gold = '#d39a4c', light = '#f0cf98', dark = '#9a6a2c';
    const root = S('g', { class: 'fam fam--biscuit' });
    const body = S('g');
    root.appendChild(S('g', { transform: `scale(${opts.scale || 1})` }, body));
    const tail = S('path', { d: 'M30 -20 C60 -30 70 -60 62 -78', stroke: INK, 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round' });
    const tail2 = S('path', { d: 'M30 -20 C60 -30 70 -60 62 -78', stroke: gold, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' });
    const tailG = S('g', { transform: 'translate(30,-20)' }, S('g', { transform: 'translate(-30,20)' }, tail, tail2));
    body.appendChild(tailG);
    body.appendChild(S('ellipse', { cx: 0, cy: -40, rx: 44, ry: 44, fill: gold, ...stroke }));
    body.appendChild(S('ellipse', { cx: 0, cy: -34, rx: 22, ry: 32, fill: light }));
    body.appendChild(S('ellipse', { cx: -20, cy: -2, rx: 14, ry: 9, fill: gold, ...stroke, 'stroke-width': 2.5 }));
    body.appendChild(S('ellipse', { cx: 20, cy: -2, rx: 14, ry: 9, fill: gold, ...stroke, 'stroke-width': 2.5 }));
    const head = S('g');
    const headWrap = S('g', { transform: 'translate(0,-98)' }, head);
    head.appendChild(S('path', { d: 'M-30 -18 C-52 -14 -56 22 -44 34 C-36 40 -30 24 -28 8Z', fill: dark, ...stroke, 'stroke-width': 2.5 }));
    head.appendChild(S('path', { d: 'M30 -18 C52 -14 56 22 44 34 C36 40 30 24 28 8Z', fill: dark, ...stroke, 'stroke-width': 2.5 }));
    head.appendChild(S('ellipse', { cx: 0, cy: 0, rx: 34, ry: 32, fill: gold, ...stroke }));
    head.appendChild(S('ellipse', { cx: 0, cy: 18, rx: 19, ry: 14, fill: light, ...stroke, 'stroke-width': 2.5 }));
    const mouth = S('path', { d: 'M-8 24 Q0 30 8 24', stroke: INK, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
    const tongue = S('path', { d: 'M-5 26 Q0 42 5 26Z', fill: '#e06a7a', stroke: INK, 'stroke-width': 1.6, opacity: 0 });
    head.append(mouth, tongue);
    head.appendChild(S('ellipse', { cx: 0, cy: 10, rx: 7, ry: 5, fill: INK }));
    head.appendChild(S('ellipse', { cx: -2, cy: 8.5, rx: 2, ry: 1.2, fill: 'rgba(255,255,255,.5)' }));
    const eyeL = S('ellipse', { cx: -12, cy: -6, rx: 4.5, ry: 5, fill: INK });
    const eyeR = S('ellipse', { cx: 12, cy: -6, rx: 4.5, ry: 5, fill: INK });
    head.append(eyeL, eyeR);
    head.appendChild(S('circle', { cx: -10.5, cy: -8, r: 1.5, fill: '#fff' }));
    head.appendChild(S('circle', { cx: 13.5, cy: -8, r: 1.5, fill: '#fff' }));
    const browL = S('path', { d: 'M-18 -16 Q-12 -19 -7 -16', stroke: dark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
    const browR = S('path', { d: 'M7 -16 Q12 -19 18 -16', stroke: dark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
    head.append(browL, browR);
    body.appendChild(headWrap);
    const st = { t: U.rand(10), wag: 1, mood: 'beg', tilt: 0, alive: true, bark: 0 };
    const off = LT.loop.add((dt) => {
      if (!st.alive) return;
      st.t += dt;
      const w = Math.sin(st.t * (st.wag > 1 ? 22 : 12)) * 18 * st.wag;
      tailG.setAttribute('transform', `translate(30,-20) rotate(${w.toFixed(1)})`);
      const tilt = st.mood === 'beg' ? 14 + Math.sin(st.t * 0.8) * 4 : st.mood === 'guilty' ? -8 : Math.sin(st.t * 1.2) * 3;
      head.setAttribute('transform', `rotate(${tilt.toFixed(1)}) translate(0,${st.mood === 'guilty' ? 8 : 0})`);
      st.bark = Math.max(0, st.bark - dt * 4);
      mouth.setAttribute('d', st.bark > 0 ? 'M-9 22 Q0 40 9 22 Q0 26 -9 22Z' : 'M-8 24 Q0 30 8 24');
      mouth.setAttribute('fill', st.bark > 0 ? '#5a1f1a' : 'none');
      tongue.setAttribute('opacity', st.mood === 'happy' && st.bark <= 0 ? 1 : 0);
    });
    const api = {
      el: root, id: 'biscuit', def: dog,
      mood(m) {
        st.mood = m;
        const up = m === 'beg' || m === 'guilty';
        browL.setAttribute('d', up ? 'M-18 -14 Q-12 -21 -7 -19' : 'M-18 -16 Q-12 -19 -7 -16');
        browR.setAttribute('d', up ? 'M7 -19 Q12 -21 18 -14' : 'M7 -16 Q12 -19 18 -16');
        st.wag = m === 'happy' ? 1.6 : m === 'guilty' ? 0.2 : 1;
        return api;
      },
      wag(v) { st.wag = v; return api; },
      bark() { st.bark = 1; LT.audio && LT.audio.sfx('bark', { n: 1 }); return api; },
      destroy() { st.alive = false; off(); root.remove(); },
    };
    api.mood(opts.mood || 'beg');
    return api;
  }

  LT.family = {
    cast, dog, joe, ensureDefs, shade,
    get: (id) => byId[id] || (id === 'biscuit' ? dog : id === 'joe' ? joe : null),
    figure,
    dogFigure,
  };
})();
