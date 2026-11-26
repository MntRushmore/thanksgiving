/* Course IV — Grace. What gratitude actually is. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el, S = U.svg;
  const RM = U.reducedMotion;

  LT.defineEgg('grace-biscuit', 'Under the table', 'Pet the dog when it is his turn.');
  LT.defineEgg('grace-thorn', 'Ye olde thorn', 'Look closely at an Old English word.');
  LT.defineEgg('grace-stardust', 'Stardust', 'Follow the hands far enough back.');

  /* ------------------------------------------------------------------ */
  /* The round. Order follows the seats clockwise from Grandma's left.   */
  /* ------------------------------------------------------------------ */
  const ROUND = [
    { id: 'benji', mood: 'grin', beats: ['Dinosaurs. Pie. Biscuit.', '(He thinks about it for a long time.)', 'And Maya. She lets me watch the volcano videos on her phone.'] },
    { id: 'maya', mood: 'neutral', beats: ['(She takes out one AirPod. This is a big deal.)', 'Okay. Um. Grandma’s hands hurt now, and she still made the rolls.', 'I came down at six for water and she was just standing there, kneading. She didn’t know anyone was up. So. That.'], end: 'tender' },
    { id: 'tyler', mood: 'smug', beats: ['Honestly? I’m thankful the startup failed.', '(Silence. Uncle Dale puts down his fork.)', 'I moved home for four months. Dad and I rebuilt the back porch. I didn’t know he could build anything. I didn’t know I liked him that much.'], end: 'tender' },
    { id: 'skye', mood: 'worried', beats: ['Um. Hi. Thank you for the chair.', 'That sounds small. My family doesn’t really do this.', 'Linda texted me twice this week to ask what I can eat. Nobody’s ever asked me that.'], end: 'tender' },
    { id: 'dad', mood: 'grin', beats: ['I’m thankful for this turkey, which gave its life so I could make the same joke I make every year.', '(Groans all around. He beams. That was the point.)', 'And for Denise, who has been on her feet since six this morning. Sit down. Sit. We’ve got the dishes.'], end: 'tender' },
    { id: 'mom', mood: 'shock', stand: true, beats: [{ t: '(She sits down. First time since six.)', act: 'sit', mood: 'happy' }, 'Oh. Okay. I’m sitting.', 'I’m thankful for the mess. I clean this house all year so that one night it can look exactly like this.'], end: 'happy' },
    { id: 'linda', mood: 'happy', beats: ['I’m thankful for Skye, who laughed at one of Dale’s jokes. Nobody has done that since 1994.', { t: '(Then, quieter.)', mood: 'tender' }, 'And for a clean scan in June. I didn’t tell most of you. I’m telling you now. That’s all. Eat your vegetables.'], end: 'tender' },
    { id: 'dale', mood: 'neutral', beats: ['I’m thankful the fire department has not had to come out this year.', '(A beat.)', 'Yet.', { t: '(He puts his hand over Linda’s and leaves it there.)', mood: 'tender' }, 'And her. That’s the speech.'], end: 'tender' },
    { id: 'biscuit', dog: true, beats: ['(Biscuit thumps his tail against the table leg, twice. Everyone agrees this counts.)'] },
    { id: 'grandma', mood: 'tender', beats: ['Fifty-one Thanksgivings with Joe.', 'He carved like a surgeon and burned the rolls every single year. I let him. You let people do things.', { t: '(She looks down the table at the empty chair.)', act: 'look' }, 'I still set his place. It’s not sad.', { t: '(A long pause.)', mood: 'sad' }, 'Well. It’s a little sad.', { t: 'Pass the rolls.', mood: 'grin', act: 'unlook' }], end: 'happy' },
  ];

  // Seats on a long table seen from above (viewBox 0 0 400 160).
  const SEATS = {
    grandma: [30, 80], benji: [105, 22], maya: [168, 22], tyler: [232, 22], skye: [295, 22], joe: [370, 80],
    you: [320, 138], dad: [262, 138], mom: [204, 138], linda: [146, 138], dale: [88, 138], biscuit: [200, 80],
  };
  const INITIAL = { grandma: 'R', benji: 'B', maya: 'M', tyler: 'T', skye: 'S', joe: 'J', you: 'You', dad: 'D', mom: 'M', linda: 'L', dale: 'D', biscuit: '' };

  /* ------------------------------------------------------------------ */
  /* Thanks a Thousand: the hands behind one thing on your plate.        */
  /* ------------------------------------------------------------------ */
  const N = (l, t, k, n) => ({ l, t, k, n });
  const ITEMS = {
    cranberry: N('One cranberry', 'n', [
      N('A grower in Wisconsin', 'p', [N('her father, who dug the first bog', 'p'), N('the crew that floods the bog in October', 'p', null, 'Cranberries float. At harvest the bog is flooded and the berries rise to the top.'), N('the bank that waited out a bad year', 'p'), N('her kids, who work the harvest boom', 'p')], 'Wisconsin grows more than half of America’s cranberries.'),
      N('Honeybees, rented by the hive', 'n', [N('the beekeeper who trucks them in', 'p'), N('the queen', 'n'), N('wildflowers by the ditch', 'n')], 'Cranberry growers rent honeybee hives every summer to pollinate the flowers.'),
      N('A glacier', 'n', [N('the last ice age', 'n'), N('a block of ice that melted into a kettle hole', 'n'), N('ten thousand years of peat', 'n')], 'Many cranberry bogs began as kettle holes left behind by retreating glaciers.'),
      N('The Wampanoag', 'p', [N('Aquinnah families who still hold Cranberry Day', 'p'), N('grandmothers who knew which bogs to pick', 'p'), N('the word sasumuneash', 't')], 'They ate sasumuneash, fresh and dried, for thousands of years before 1621.'),
      N('A truck driver on I-94', 'p', [N('the mechanic who did her brakes', 'p'), N('the diner that fed her at 3 a.m.', 'p'), N('her kid, who she called from the road', 'p')]),
      N('Whoever stocked the shelf', 'p', [N('the night manager', 'p'), N('the forklift driver', 'p'), N('the person who mopped aisle 7', 'p')]),
      N('Rain', 'n', [N('the Great Lakes', 'n'), N('the sun, which lifted it into the clouds', 'n')]),
    ]),
    potato: N('One potato', 'n', [
      N('Farmers in the Andes', 'p', [N('the farmers who bred thousands of kinds', 'p'), N('night frost, which taught them to freeze-dry it', 'n', null, 'Andean farmers made chuño: potatoes freeze-dried by night frost and day sun, good for years.'), N('Lake Titicaca', 'n')], 'People in the Andes domesticated the potato roughly 7,000 years ago.'),
      N('A grower in Idaho', 'p', [N('last year’s seed potatoes', 't'), N('the irrigation crew', 'p'), N('whoever fixed the harvester at midnight', 'p')]),
      N('The soil', 'n', [N('earthworms', 'n'), N('fungi you will never see', 'n'), N('a thousand years of fallen leaves', 'n')]),
      N('Whoever peeled it', 'p', [N('the cousin who did it badly, but did it', 'p'), N('the person who invented the peeler', 'p')]),
      N('Butter', 't', [N('a cow', 'n'), N('a dairy farmer, up at 4 a.m.', 'p'), N('grass', 'n')]),
      N('Salt', 't', [N('an ocean that dried up long ago', 'n'), N('a salt miner', 'p')]),
      N('The stove', 't', [N('the gas line worker', 'p'), N('whoever paid the bill', 'p')]),
    ]),
    pie: N('One slice of pie', 'n', [
      N('Grandma’s hands', 'p', [N('her mother, who taught her the crust', 'p'), N('the cold-butter trick from a church cookbook', 't'), N('forty years of practice', 'p')]),
      N('Wheat', 'n', [N('a farmer in Kansas', 'p'), N('the miller', 'p'), N('ten thousand years of wheat farmers', 'p', null, 'Wheat was first farmed in the Fertile Crescent about 10,000 years ago.')]),
      N('Pumpkin (mostly squash)', 'n', [N('a farm near Morton, Illinois', 'p'), N('the cannery shift', 'p'), N('a seed saver', 'p')], 'Most canned pumpkin is a variety of squash called Dickinson.'),
      N('Sugar', 't', [N('the people who cut the cane', 'p', null, 'For centuries, much of the world’s sugar was grown by enslaved people. Remembering that is part of the thanks.'), N('a beet farmer in Minnesota', 'p'), N('the sun', 'n')]),
      N('Cinnamon and nutmeg', 'n', [N('a farmer in Sri Lanka', 'p'), N('a nutmeg grove in the Banda Islands', 'n'), N('a ship’s crew', 'p')]),
      N('The oven', 't', [N('the electrician', 'p'), N('an engineer nobody remembers', 'p')]),
      N('Whoever brought the whipped cream', 'p', [N('a cow', 'n'), N('the friend who reminded them', 'p')]),
    ]),
    coffee: N('One cup of coffee', 'n', [
      N('A farmer in Colombia', 'p', [N('the pickers at harvest', 'p'), N('neighbors who share the drying patio', 'p'), N('the cooperative', 'p')]),
      N('Coffee trees', 'n', [N('Ethiopian forests, where coffee grew wild', 'n'), N('shade trees', 'n'), N('rain on a mountainside', 'n')]),
      N('The roaster', 'p', [N('the person who taught them to roast', 'p'), N('the safety inspector', 'p')]),
      N('A ship’s crew', 'p', [N('the crane operator at the port', 'p'), N('the shipping container', 't', null, 'Malcom McLean’s standard container, first sailed in 1956, made it cheap to move a sack of beans across an ocean.')]),
      N('Melitta Bentz', 'p', [N('her son’s school notebook', 't'), N('Dresden, 1908', 'n')], 'In 1908 she made the first paper coffee filter from a sheet of blotting paper out of her son’s notebook.'),
      N('Water', 'n', [N('the treatment plant operator', 'p'), N('a plumber', 'p'), N('rain', 'n')]),
      N('Whoever made the pot', 'p', [N('whoever taught them', 'p'), N('the person who designed the lid', 'p')]),
    ]),
  };
  const POOL = {
    p: ['their mother', 'their father', 'a teacher who stayed late', 'whoever fed them breakfast', 'the bus driver who got them to work', 'a night-shift nurse', 'a friend who talked them out of quitting', 'their grandmother', 'the doctor who delivered them', 'a coach who believed in them', 'a neighbor with jumper cables', 'a stranger who gave directions', 'whoever trained them', 'a coworker who covered a shift', 'the cook at their lunch spot', 'their kid, waving from the window', 'a librarian', 'the mechanic', 'a crossing guard', 'a sister who calls on Sundays', 'the farmer who grew their lunch', 'their first boss', 'someone who forgave them', 'the person who invented eyeglasses'],
    n: ['the sun', 'rain', 'the soil', 'a river', 'bees', 'fungi under the ground', 'worms', 'a forest', 'the tides', 'the last ice age', 'photosynthesis', 'a cold snap', 'the wind', 'an old oak', 'moss', 'plankton, for the oxygen', 'the moon', 'a star that died before the sun was born'],
    t: ['the engineer who designed it', 'a miner, for the iron', 'the factory night shift', 'a welder', 'an inventor nobody remembers', 'the person who wrote the manual', 'the electrician', 'the road crew', 'the people who laid the rails', 'whoever invented the wheelbarrow'],
  };
  const NOTE = { 'a star that died before the sun was born': 'The iron in your blood was forged in stars that exploded before the sun existed.', 'plankton, for the oxygen': 'Ocean plankton make a large share of the oxygen you breathe.' };

  /* ------------------------------------------------------------------ */
  const ITEM_ICONS = {
    cranberry: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="26" r="15" fill="#b8243d" stroke="#1c130c" stroke-width="2"/><circle cx="18" cy="20" r="4" fill="#fff" opacity=".35"/><path d="M24 11l2 4 4-1-3 3 1 4-4-2-4 2 1-4-3-3 4 1z" fill="#4d2f1a"/></svg>',
    potato: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 27c-2-9 7-16 16-15 10 1 16 7 14 15-2 9-11 12-19 11S11 35 9 27z" fill="#b98a52" stroke="#1c130c" stroke-width="2"/><circle cx="18" cy="22" r="1.6" fill="#5b3e22"/><circle cx="29" cy="20" r="1.4" fill="#5b3e22"/><circle cx="25" cy="31" r="1.6" fill="#5b3e22"/></svg>',
    pie: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 34L40 18v16z" fill="#d07a2c" stroke="#1c130c" stroke-width="2" stroke-linejoin="round"/><path d="M40 18v16h-4V20z" fill="#e8b26a" stroke="#1c130c" stroke-width="2"/><path d="M8 34h32v5H8z" fill="#e8b26a" stroke="#1c130c" stroke-width="2"/><ellipse cx="30" cy="22" rx="6" ry="3" fill="#f6efe1"/></svg>',
    coffee: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 20h24v10a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z" fill="#efe6d2" stroke="#1c130c" stroke-width="2"/><path d="M34 23h3a4 4 0 0 1 0 8h-4" fill="none" stroke="#1c130c" stroke-width="2"/><ellipse cx="22" cy="20" rx="12" ry="3" fill="#4a2a14" stroke="#1c130c" stroke-width="2"/><path d="M18 14c-2-3 2-4 0-7M25 14c-2-3 2-4 0-7" stroke="#cfc3a9" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  };

  /* ================================================================== */
  LT.chapter({
    id: 'grace', index: 4, numeral: 'IV', course: 'Fourth Course', title: 'Grace',
    blurb: 'What gratitude actually is.', music: 'grace', transition: 'smoke',
    light: { darkness: 0.82, radius: 320 },
    mount(root, api) {
      root.classList.add('grace');
      LT.music.param('melody', 0.15);
      LT.music.param('swell', 0);

      /* ---------- scene runner ---------- */
      const SCENES = ['The toast', 'Around the table', 'The empty chair', 'Your turn', 'The word', 'The hands', 'Both at once', 'The evidence', 'The letter', 'Hold the light'];
      const rail = el('nav', { class: 'g-rail', 'aria-label': 'Progress through Grace' });
      SCENES.forEach((s, i) => rail.appendChild(el('span', { class: 'g-dot', title: s, 'aria-label': s })));
      root.appendChild(rail);
      let current = null, advanceFn = null, respot = null;
      const scopes = [];
      api.cleanup(() => scopes.forEach((s) => s.dispose()));
      function scope() {
        const fns = [];
        const sc = { add(fn) { fns.push(fn); }, dispose() { fns.splice(0).reverse().forEach((f) => { try { f(); } catch (e) { console.warn(e); } }); } };
        scopes.push(sc);
        return sc;
      }
      async function run(i, fn) {
        rail.querySelectorAll('.g-dot').forEach((d, j) => { d.classList.toggle('on', j <= i); d.classList.toggle('cur', j === i); });
        const sec = el('section', { class: 'g-scene', 'aria-label': SCENES[i] });
        const old = current;
        current = sec;
        if (old) {
          old.classList.add('out');
          const sc = old._scope;
          api.timeout(() => { old.remove(); sc && sc.dispose(); }, RM ? 50 : 900);
          LT.audio.sfx('paper', { dur: 0.35, g: 0.6 });
        }
        root.insertBefore(sec, rail);
        sec._scope = scope();
        await U.nextFrame();
        sec.classList.add('in');
        await fn(sec, sec._scope);
      }
      api.on(window, 'keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        if (/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(tag)) return;
        if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && advanceFn) { e.preventDefault(); advanceFn(); }
      });
      api.on(window, 'resize', () => respot && respot());

      /** Resolve when the visitor taps the section (or presses Enter/Space/→). */
      function tap(sec) {
        return new Promise((res) => {
          let done = false;
          const fire = () => { if (done) return; done = true; advanceFn = null; sec.removeEventListener('click', onClick); res(); };
          const onClick = (e) => { if (e.target.closest && e.target.closest('[data-noadvance], input, textarea')) return; fire(); };
          sec.addEventListener('click', onClick);
          advanceFn = fire;
        });
      }
      /** Resolve after ms, or sooner on a tap. */
      function waitOrTap(sec, ms) {
        return new Promise((res) => {
          let done = false, id;
          const fire = () => { if (done) return; done = true; clearTimeout(id); advanceFn = null; sec.removeEventListener('click', onClick); res(); };
          const onClick = (e) => { if (e.target.closest && e.target.closest('[data-noadvance], input, textarea, button')) return; fire(); };
          sec.addEventListener('click', onClick);
          advanceFn = fire;
          id = api.timeout(fire, ms);
        });
      }
      const clicked = (btn) => new Promise((res) => btn.addEventListener('click', res, { once: true }));
      function spot(target, o = {}) {
        respot = () => {
          if (!target.isConnected) return;
          const r = target.getBoundingClientRect();
          LT.light.follow(false);
          LT.light.moveTo(r.left + r.width / 2, r.top + r.height / 2 + (o.dy || 0));
          LT.light.set({ radius: o.radius || Math.max(r.width, r.height) * 0.62 + 140, darkness: o.darkness ?? 0.8 });
        };
        respot();
      }
      function freeLight(o) { respot = null; LT.light.follow(true); LT.light.set(o); }
      function words(node, text, cls) {
        const p = el('p', { class: cls || '' }, text);
        node.appendChild(p);
        const ws = U.splitWords(p, 'g-w');
        ws.forEach((w, i) => { w.style.animationDelay = (RM ? 0 : i * 55) + 'ms'; });
        return p;
      }
      const readMs = (t) => Math.max(1700, t.split(/\s+/).length * 270 + 900);
      function swell(v, back, after = 5000) {
        LT.music.param('swell', v);
        if (back != null) api.timeout(() => LT.music.param('swell', back), after);
      }
      function pencil(n = 1) {
        if (!LT.audio.ready || LT.audio.muted) return;
        for (let i = 0; i < n; i++) LT.audio.noise({ t: LT.audio.now() + i * 0.05, dur: U.rand(0.03, 0.07), a: 0.004, g: U.rand(0.02, 0.05), filters: [{ type: 'bandpass', f: U.rand(3000, 5200), q: 1.4 }] });
      }
      function chime(n, g = 0.5) {
        if (!LT.audio.ready || LT.audio.muted) return;
        LT.music.instruments.musicbox(LT.audio.sfxBus, LT.audio.now() + 0.01, n, 1, g);
      }

      /* ---------- shared pieces ---------- */
      function tableMap(big) {
        const svg = S('svg', { class: 'g-map' + (big ? ' g-map--big' : ''), viewBox: '0 0 400 160', role: 'img', 'aria-label': 'Seating plan of the long table' });
        svg.appendChild(S('rect', { x: 52, y: 44, width: 296, height: 72, rx: 36, class: 'g-map-table' }));
        svg.appendChild(S('path', { d: 'M90 80 H310', class: 'g-map-runner' }));
        const seats = {};
        Object.entries(SEATS).forEach(([id, [x, y]]) => {
          const g = S('g', { class: 'g-seat g-seat--' + id, transform: `translate(${x},${y})` });
          if (id === 'biscuit') {
            g.appendChild(S('g', { class: 'g-paw' }, S('ellipse', { cx: 0, cy: 3, rx: 5, ry: 4 }), S('circle', { cx: -5, cy: -4, r: 2 }), S('circle', { cx: 0, cy: -6, r: 2 }), S('circle', { cx: 5, cy: -4, r: 2 })));
          } else {
            g.appendChild(S('circle', { r: id === 'you' ? 13 : 11, class: 'g-seat-c' }));
            g.appendChild(S('text', { y: id === 'you' ? 3.5 : 4, 'text-anchor': 'middle', class: 'g-seat-t' + (id === 'you' ? ' g-seat-t--you' : '') }, INITIAL[id]));
          }
          g.appendChild(S('path', { class: 'g-seat-flame', d: 'M0 -26 C5 -20 5 -15 0 -12 C-5 -15 -5 -20 0 -26Z' }));
          const who = id === 'you' ? 'You' : id === 'joe' ? LT.family.joe.name : (LT.family.get(id) || {}).name || id;
          g.appendChild(S('title', null, who));
          seats[id] = g;
          svg.appendChild(g);
        });
        return {
          el: svg,
          light(id) { seats[id] && seats[id].classList.add('lit'); },
          current(id) { Object.values(seats).forEach((s) => s.classList.remove('cur')); seats[id] && seats[id].classList.add('cur'); },
          clear() { Object.values(seats).forEach((s) => s.classList.remove('cur')); },
        };
      }

      function portrait(sc) {
        const svg = S('svg', { class: 'g-portrait', viewBox: '-170 -292 340 330', 'aria-hidden': 'true' });
        const defs = S('defs');
        const halo = S('radialGradient', { id: 'g-halo', cx: '50%', cy: '45%', r: '50%' },
          S('stop', { offset: '0', 'stop-color': '#ffcf7a', 'stop-opacity': '.32' }), S('stop', { offset: '1', 'stop-color': '#ffcf7a', 'stop-opacity': '0' }));
        const cloth = S('linearGradient', { id: 'g-cloth', x1: 0, x2: 0, y1: 0, y2: 1 },
          S('stop', { offset: '0', 'stop-color': '#efe6d2' }), S('stop', { offset: '1', 'stop-color': '#9d927c' }));
        defs.append(halo, cloth);
        svg.appendChild(defs);
        svg.appendChild(S('ellipse', { cx: 0, cy: -150, rx: 170, ry: 150, fill: 'url(#g-halo)' }));
        const figs = S('g');
        svg.appendChild(figs);
        // the table in front
        svg.appendChild(S('path', { d: 'M-170 -6 H170 V40 H-170Z', fill: 'url(#g-cloth)' }));
        svg.appendChild(S('path', { d: 'M-170 -6 H170', stroke: '#fff6e4', 'stroke-width': 2, opacity: 0.6 }));
        svg.appendChild(S('ellipse', { cx: -10, cy: 10, rx: 64, ry: 12, fill: '#f6efe1', stroke: '#1c130c', 'stroke-width': 2.5 }));
        svg.appendChild(S('ellipse', { cx: -10, cy: 9, rx: 42, ry: 7, fill: 'none', stroke: '#c9b48a', 'stroke-width': 1.5 }));
        svg.appendChild(S('path', { d: 'M-92 -2 v24 M-98 -2 v8 M-86 -2 v8 M-98 6 q6 4 12 0 M72 -2 v24', stroke: '#8e9089', 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' }));
        let cur = null;
        return {
          el: svg,
          show(item) {
            const wrap = S('g', { class: 'g-figwrap' });
            let fig;
            if (item.dog) {
              fig = LT.family.dogFigure({ scale: 1.15 });
              fig.mood('happy');
              wrap.setAttribute('data-noadvance', '');
              wrap.style.cursor = 'pointer';
              let pets = 0;
              wrap.addEventListener('click', () => {
                pets++;
                fig.wag(2.4); LT.audio.sfx('bark', { n: 1 });
                const r = wrap.getBoundingClientRect();
                LT.fx.float(r.left + r.width / 2, r.top + 20, pets >= 3 ? 'good boy' : '♥', { size: 26, color: '#f2c14e' });
                if (pets === 3) LT.egg('grace-biscuit', 'Under the table', 'Someone slipped Biscuit the turkey skin. Nobody saw. Everybody saw.');
              });
            } else {
              fig = LT.family.figure(item.id, { scale: 1.08, mood: item.mood || 'neutral' });
            }
            const inner = S('g');
            if (item.stand) {
              inner.appendChild(S('path', { d: 'M-58 0 L-60 90 H60 L58 0Z', fill: LT.family.get(item.id).shirt, stroke: '#1c130c', 'stroke-width': 3 }));
              inner.appendChild(S('path', { d: 'M-40 -10 L-46 90 H46 L40 -10Z', fill: '#efe6d2', stroke: '#1c130c', 'stroke-width': 2.5 }));
            }
            inner.appendChild(fig.el);
            const lift = item.id === 'benji' ? -26 : item.stand ? -54 : item.dog ? -6 : 0;
            wrap.setAttribute('transform', `translate(0,${lift})`);
            wrap.appendChild(inner);
            wrap.style.opacity = 0;
            figs.appendChild(wrap);
            requestAnimationFrame(() => { wrap.style.transition = 'opacity .7s ease'; wrap.style.opacity = 1; });
            if (cur) {
              const o = cur;
              o.wrap.style.opacity = 0;
              setTimeout(() => o.fig.destroy(), 800);
            }
            cur = { wrap, fig, lift };
            sc.add(() => fig.destroy());
            return cur;
          },
          sit() {
            if (!cur) return;
            const c = cur;
            U.tween({ from: c.lift, to: 0, dur: RM ? 0.1 : 0.9, ease: 'outBounce', onUpdate: (v) => c.wrap.setAttribute('transform', `translate(0,${v})`) });
            LT.audio.sfx('thud', { g: 0.3 });
          },
        };
      }

      function placeCard(content, cls) {
        return el('div', { class: 'g-card ' + (cls || '') }, el('div', { class: 'g-card-face' }, content));
      }

      /* ================================================================ */
      /* Scenes                                                            */
      /* ================================================================ */
      async function sceneToast(sec, sc) {
        sec.classList.add('g-toast');
        const outcome = LT.state.tableOutcome;
        const opener = outcome === 'chaos'
          ? 'The smoke alarm is finally quiet. Somebody opened a window. Nobody is talking about the gravy.'
          : outcome === 'survived'
            ? 'You made it to pie. Nobody stormed out. Somebody should write that down.'
            : 'The plates are mostly empty. The pie is cooling on the counter, and nobody is allowed to touch it yet.';
        const map = tableMap(true);
        const cv = el('canvas', { class: 'g-toast-candle', 'aria-hidden': 'true' });
        const text = el('div', { class: 'g-toast-text' });
        const go = el('button', { class: 'lt-btn', type: 'button' }, 'Go around the table', el('span', { 'aria-hidden': 'true' }, '→'));
        go.style.visibility = 'hidden';
        sec.append(el('p', { class: 'lt-eyebrow' }, 'Fourth Course'), map.el, cv, text, go);
        const candle = LT.candle(cv, { lit: false });
        sc.add(() => candle.destroy());
        await api.wait(120);
        spot(sec, { radius: Math.min(innerWidth, 900) * 0.55, darkness: 0.84 });
        await api.wait(RM ? 0 : 500);
        candle.light(); LT.audio.sfx('whoomp'); LT.light.pulse();
        words(text, opener, 'g-lede');
        await api.wait(RM ? 300 : 2600);
        words(text, '(Grandma taps her glass with a fork.)', 'g-dir');
        LT.audio.sfx('ting'); LT.audio.sfx('ting', { delay: 0.28 }); LT.audio.sfx('ting', { delay: 0.56 });
        LT.music.duck(0.35, 2.4);
        await api.wait(RM ? 300 : 1600);
        const q = words(text, '“Before pie, we go around. That’s the rule.”', 'g-say');
        q.appendChild(el('span', { class: 'g-who' }, ' Grandma Ruth'));
        await api.wait(RM ? 200 : 1300);
        go.style.visibility = 'visible';
        go.classList.add('g-pop');
        go.focus({ preventScroll: true });
        await clicked(go);
        LT.audio.sfx('clink');
      }

      async function sceneRound(sec, sc) {
        sec.classList.add('g-round');
        const map = tableMap(false);
        const frame = el('div', { class: 'g-frame' });
        const pt = portrait(sc);
        const cv = el('canvas', { class: 'g-pcandle', 'aria-hidden': 'true' });
        frame.append(pt.el, cv);
        const name = el('div', { class: 'g-name' });
        const blurb = el('div', { class: 'g-blurb' });
        const line = el('div', { class: 'g-lines', 'aria-live': 'polite' });
        const nextBtn = el('button', { class: 'g-next', type: 'button' });
        const skip = el('button', { class: 'g-skip', type: 'button', 'data-noadvance': '' }, 'Skip to your turn');
        const body = el('div', { class: 'g-round-body' }, frame, el('div', { class: 'g-round-text' }, el('div', { class: 'g-speaker' }, name, blurb), line, el('div', { class: 'g-controls' }, nextBtn, skip)));
        sec.append(map.el, body);
        const candle = LT.candle(cv, { lit: false, seed: 9 });
        sc.add(() => candle.destroy());
        await api.wait(60);
        spot(body, { darkness: 0.8 });
        let skipping = false;
        skip.addEventListener('click', () => { skipping = true; advanceFn && advanceFn(); });
        nextBtn.style.visibility = 'hidden';
        for (let i = 0; i < ROUND.length && !skipping; i++) {
          const p = ROUND[i];
          map.current(p.id);
          const def = p.dog ? LT.family.dog : LT.family.get(p.id);
          name.textContent = def.name;
          blurb.textContent = def.blurb;
          line.innerHTML = '';
          const c = pt.show(p);
          if (i === 0) { candle.light(); LT.audio.sfx('whoomp'); }
          LT.audio.sfx('ting', { g: 0.05, f: 1800 + i * 50 });
          LT.light.pulse();
          nextBtn.style.visibility = 'hidden';
          await api.wait(RM ? 100 : 650);
          for (const raw of p.beats) {
            if (skipping) break;
            const b = typeof raw === 'string' ? { t: raw } : raw;
            const dir = /^\(/.test(b.t);
            if (b.act === 'sit') pt.sit();
            if (b.act === 'look' && c.fig.lookAt) { c.fig.lookAt(1); c.fig.tilt && c.fig.tilt(7); }
            if (b.act === 'unlook' && c.fig.lookAt) { c.fig.lookAt(0); c.fig.tilt && c.fig.tilt(0); }
            if (b.mood && c.fig.mood) c.fig.mood(b.mood);
            words(line, b.t, dir ? 'g-dir' : 'g-say');
            while (line.children.length > 3) line.firstElementChild.remove();
            if (!dir && c.fig.talk) {
              c.fig.talk(true);
              const tmo = Math.min(4200, b.t.split(/\s+/).length * 230 + 200);
              api.timeout(() => { c.fig.talk(false); if (b.mood && c.fig.mood) c.fig.mood(b.mood); }, RM ? 400 : tmo);
            }
            if (p.dog) { c.fig.wag(2.2); LT.audio.sfx('thud', { g: 0.25 }); api.timeout(() => LT.audio.sfx('thud', { g: 0.25 }), 380); }
            await waitOrTap(sec, RM ? 900 : readMs(b.t));
            if (c.fig.talk) c.fig.talk(false);
          }
          if (p.end && c.fig.mood) c.fig.mood(p.end);
          map.light(p.id);
          LT.audio.sfx('pluck', { n: 61 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21][i % 10], g: 0.12 });
          const nx = ROUND[i + 1];
          if (skipping) break;
          nextBtn.innerHTML = '';
          nextBtn.append(nx ? `Next: ${(nx.dog ? LT.family.dog : LT.family.get(nx.id)).short}` : 'Then it’s you', el('span', { 'aria-hidden': 'true' }, ' →'));
          nextBtn.style.visibility = 'visible';
          await tap(sec);
        }
        ROUND.forEach((p) => map.light(p.id));
      }

      async function sceneChair(sec, sc) {
        sec.classList.add('g-chair');
        const still = S('svg', { class: 'g-still', viewBox: '0 0 420 260', 'aria-hidden': 'true' });
        still.innerHTML = `
          <defs><linearGradient id="g-wood" x1="0" x2="1"><stop offset="0" stop-color="#3a2416"/><stop offset=".5" stop-color="#6b4527"/><stop offset="1" stop-color="#2e1c10"/></linearGradient>
          <linearGradient id="g-cloth2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#efe6d2"/><stop offset="1" stop-color="#8f846f"/></linearGradient></defs>
          <g stroke="#1c130c" stroke-width="3" stroke-linejoin="round">
            <path d="M120 40 C150 14 270 14 300 40 L296 58 C266 36 154 36 124 58Z" fill="url(#g-wood)"/>
            <path d="M128 52 L136 170 M292 52 L284 170" stroke="#2e1c10" stroke-width="12" stroke-linecap="round"/>
            <path d="M160 44 L164 170 M190 40 L191 170 M220 39 L220 170 M250 40 L249 170 M278 44 L274 170" stroke="#5a3a20" stroke-width="6"/>
          </g>
          <path d="M0 160 H420 V260 H0Z" fill="url(#g-cloth2)"/>
          <path d="M0 160 H420" stroke="#fff6e4" stroke-width="2" opacity=".6"/>
          <ellipse cx="210" cy="196" rx="92" ry="20" fill="#f6efe1" stroke="#1c130c" stroke-width="3"/>
          <ellipse cx="210" cy="195" rx="62" ry="12" fill="none" stroke="#c9b48a" stroke-width="2"/>
          <path d="M186 186 l24 -14 l24 14 l-24 10z" fill="#6f1526" stroke="#1c130c" stroke-width="2"/>
          <path d="M96 176 v34 M88 176 v10 M104 176 v10 M88 186 q8 6 16 0 M324 176 v34" stroke="#8e9089" stroke-width="4" stroke-linecap="round" fill="none"/>
          <path d="M340 120 h26 l-4 40 h-18z" fill="rgba(239,230,210,.18)" stroke="#cfc3a9" stroke-width="2"/>
          <g transform="translate(210 236) rotate(-2)"><path d="M-46 -16 H46 L42 14 H-42Z" fill="#e8dcc1" stroke="#1c130c" stroke-width="2"/>
          <text x="0" y="7" text-anchor="middle" font-family="Homemade Apple, cursive" font-size="17" fill="#24170e">Joe</text></g>`;
        const txt = el('div', { class: 'g-chair-text' });
        const label = el('label', { for: 'g-chair', class: 'sr-only' }, 'A name for the empty chair (optional)');
        const input = el('input', { id: 'g-chair', class: 'g-card-input', type: 'text', maxlength: 40, autocomplete: 'off', placeholder: 'a name', value: LT.state.chair || '' });
        const card = placeCard(el('div', null, label, input), 'g-card--chair');
        const cv = el('canvas', { class: 'g-chair-candle', 'aria-hidden': 'true' });
        const light = el('button', { class: 'lt-btn', type: 'button' }, 'Light a candle');
        const pass = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button' }, 'Not this year');
        const row = el('div', { class: 'g-chair-row' }, cv, card);
        const btns = el('div', { class: 'g-btns' }, light, pass);
        sec.append(el('p', { class: 'lt-eyebrow' }, 'The empty chair'), still, txt, row, btns);
        const candle = LT.candle(cv, { lit: false, seed: 4 });
        sc.add(() => candle.destroy());
        await api.wait(60);
        spot(sec, { darkness: 0.78, radius: Math.min(innerWidth, 820) * 0.62 });
        words(txt, 'There’s a chair like this at a lot of tables.', 'g-lede');
        await api.wait(RM ? 100 : 1300);
        words(txt, 'Is there someone who isn’t at yours this year? You can write their name on a card. It stays on this device. Nobody else sees it.', 'g-body');
        let res, name;
        for (;;) {
          res = await Promise.race([clicked(light).then(() => 'light'), clicked(pass).then(() => 'pass'), new Promise((r) => input.addEventListener('keydown', (e) => { if (e.key === 'Enter') r('light'); }, { once: true }))]);
          name = input.value.trim();
          if (res === 'pass' || name) break;
          input.focus();
          card.classList.remove('g-nudge'); void card.offsetWidth; card.classList.add('g-nudge');
        }
        if (res === 'light' && name) {
          LT.state.chair = name; LT.save();
          input.blur();
          const writ = el('div', { class: 'g-card-script' }, name);
          card.querySelector('.g-card-face').replaceChildren(writ);
          LT.audio.sfx('match');
          await api.wait(450);
          candle.light(); LT.audio.sfx('whoomp'); LT.light.pulse();
          LT.stats.inc('candlesLit');
          const fp = candle.flamePos();
          LT.fx.sparks(fp.x, fp.y + 10, 16, { speed: [40, 180] });
          swell(0.35, 0.1, 7000);
          btns.innerHTML = '';
          txt.innerHTML = '';
          words(txt, `For ${name}.`, 'g-lede g-lede--for');
          await api.wait(RM ? 300 : 1800);
          words(txt, 'Grandma nods at the candle like it’s an old friend. Nobody says anything for a second. That’s allowed too.', 'g-body');
        } else {
          LT.state.chair = ''; LT.save();
          btns.innerHTML = '';
          txt.innerHTML = '';
          words(txt, 'That’s fine. The chair will be here if you ever need it.', 'g-lede');
        }
        await api.wait(RM ? 200 : 1600);
        const cont = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button' }, 'Back to the table', el('span', { 'aria-hidden': 'true' }, '→'));
        btns.appendChild(cont);
        cont.focus({ preventScroll: true });
        await clicked(cont);
      }

      async function sceneYou(sec, sc) {
        sec.classList.add('g-you');
        const head = el('div', { class: 'g-you-head' },
          el('p', { class: 'lt-eyebrow' }, 'Your turn'),
          el('h2', { class: 'lt-display g-h2' }, 'And ', el('i', null, 'you'), '?'),
          el('p', { class: 'g-body g-you-sub' }, 'Everybody is looking at you. So is Biscuit.'));
        const PROMPTS = [
          ['A person', 'My sister, who calls every Sunday even when I don’t pick up.'],
          ['A small thing from this week', 'The first cold morning, and coffee on the back step.'],
          ['Something hard that taught me something', 'The year everything fell apart, because I found out who shows up.'],
        ];
        const ta = el('textarea', { id: 'g-thanks', class: 'g-lined', rows: 3, maxlength: 280, placeholder: PROMPTS[0][1] });
        ta.value = LT.state.thanks || '';
        const chips = el('div', { class: 'g-chips', role: 'group', 'aria-label': 'Ideas to start from' });
        PROMPTS.forEach(([lab, ph], i) => {
          const b = el('button', { class: 'g-chip' + (i === 0 ? ' on' : ''), type: 'button' }, lab);
          b.addEventListener('click', () => { chips.querySelectorAll('.g-chip').forEach((c) => c.classList.remove('on')); b.classList.add('on'); ta.placeholder = ph; ta.focus(); LT.audio.sfx('tick', { g: 0.05 }); });
          chips.appendChild(b);
        });
        const lbl = el('label', { for: 'g-thanks', class: 'g-label' }, 'What are you thankful for?');
        const card = placeCard(el('div', { class: 'g-you-form' }, lbl, ta), 'g-card--you');
        const say = el('button', { class: 'lt-btn', type: 'button' }, 'Say it');
        const pass = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button' }, 'Pass');
        const btns = el('div', { class: 'g-btns' }, say, pass);
        const after = el('div', { class: 'g-after', 'aria-live': 'polite' });
        sec.append(head, chips, card, btns, after);
        await api.wait(60);
        spot(card, { darkness: 0.72, dy: -40, radius: Math.min(innerWidth, 900) * 0.55 });
        api.on(ta, 'input', () => { if (Math.random() < 0.5) pencil(1); });
        const res = await Promise.race([clicked(say).then(() => 'say'), clicked(pass).then(() => 'pass')]);
        const text = ta.value.trim();
        btns.remove(); chips.remove();
        if (res === 'say' && text) {
          LT.state.thanks = text; LT.save();
          const out = el('div', { class: 'g-card-script g-card-script--long' });
          card.querySelector('.g-card-face').replaceChildren(el('div', { class: 'g-card-k' }, 'I’m thankful for'), out);
          await U.type(out, text, RM ? 400 : 26, (ch, i) => { if (i % 3 === 0) pencil(1); });
          LT.light.pulse();
          words(after, '(Glasses go up all around the table.)', 'g-dir');
          [0, 0.12, 0.2, 0.34, 0.41, 0.55, 0.62].forEach((d, i) => LT.audio.sfx('clink', { delay: d, f: U.rand(1600, 2300), g: 0.1, pan: (i % 2 ? 1 : -1) * U.rand(0.2, 0.7) }));
          const r = card.getBoundingClientRect();
          LT.fx.burst(r.left + r.width / 2, r.top + 10, { count: 26, colors: ['#ffd27a', '#fff1c2'], shape: 'star', speed: [60, 220], gravity: 60, size: [2, 4], life: [0.8, 1.6], blend: 'lighter' });
          swell(0.6, 0.15, 6500);
          await api.wait(RM ? 300 : 1500);
          words(after, '“Good. That counts.”', 'g-say').appendChild(el('span', { class: 'g-who' }, ' Grandma Ruth'));
        } else {
          LT.state.thanks = ''; LT.save();
          words(after, '(You pass. That’s allowed. Grandma raises one eyebrow, then lets it go. You can come back to it.)', 'g-dir');
        }
        await api.wait(RM ? 200 : 1600);
        const cont = el('button', { class: 'lt-btn', type: 'button' }, 'So what is gratitude, actually?');
        after.appendChild(el('div', { class: 'g-btns' }, cont));
        cont.focus({ preventScroll: true });
        await clicked(cont);
      }

      async function sceneWord(sec, sc) {
        sec.classList.add('g-word');
        const intro = el('p', { class: 'g-body g-word-intro' }, 'Gratitude gets sold as a feeling you’re supposed to have on cue. It’s closer to a habit of attention. Four things worth knowing.');
        const letters = 'THINK'.split('').map((ch, i) => (i === 2
          ? el('button', { class: 'g-letter g-letter--i', type: 'button', 'aria-label': 'Change the I to an A' }, el('span', { class: 'g-lf' }, ch))
          : el('span', { class: 'g-letter' }, el('span', { class: 'g-lf' }, ch))));
        const word = el('div', { class: 'g-bigword', 'aria-live': 'polite' }, ...letters);
        const hint = el('p', { class: 'g-hint' }, 'Tap the I.');
        const body = el('div', { class: 'g-word-body' });
        sec.append(el('p', { class: 'lt-eyebrow' }, '1 · The word'), intro, word, hint, body);
        await api.wait(60);
        spot(word, { darkness: 0.72, radius: Math.min(innerWidth, 900) * 0.5 });
        const iBtn = letters[2];
        iBtn.focus({ preventScroll: true });
        await clicked(iBtn);
        hint.style.visibility = 'hidden';
        const lf = iBtn.querySelector('.g-lf');
        lf.classList.add('flip');
        LT.audio.sfx('whoosh', { dur: 0.35, low: 800, high: 3000, g: 0.15 });
        await api.wait(RM ? 50 : 260);
        lf.textContent = 'A';
        iBtn.classList.add('done');
        iBtn.setAttribute('aria-label', 'A');
        iBtn.disabled = true;
        const r = iBtn.getBoundingClientRect();
        LT.fx.sparks(r.left + r.width / 2, r.top + r.height / 2, 28);
        LT.audio.sfx('chime', { n: 73 });
        word.setAttribute('aria-label', 'THANK');
        await api.wait(RM ? 100 : 900);
        const p1 = el('p', { class: 'g-body' }, 'In Old English, ', el('button', { class: 'g-thorn', type: 'button', title: 'What is that letter?' }, 'þ'), el('span', null, 'anc'), ' meant a thought. A remembering. Goodwill toward someone.');
        body.appendChild(p1);
        p1.classList.add('g-rise');
        const thorn = p1.querySelector('.g-thorn');
        thorn.addEventListener('click', () => {
          LT.egg('grace-thorn', 'Ye olde thorn', 'That þ is a thorn, a letter English used for centuries. Early printers often set it as a y, so “Ye Olde” was always pronounced “the.”');
          thorn.classList.add('found');
        });
        await api.wait(RM ? 100 : 1700);
        const p2 = el('p', { class: 'g-body g-rise' }, 'Thank and think grew from the same root. German still keeps them side by side: ', el('em', null, 'denken'), ', to think. ', el('em', null, 'danken'), ', to thank.');
        body.appendChild(p2);
        await api.wait(RM ? 100 : 2200);
        const p3 = el('p', { class: 'g-lede g-rise' }, 'So the oldest meaning of thank you is ', el('i', null, 'I was thinking of you.'));
        body.appendChild(p3);
        swell(0.25, 0.05, 4000);
        await api.wait(RM ? 100 : 1500);
        const cont = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button' }, 'Next: the hands', el('span', { 'aria-hidden': 'true' }, '→'));
        body.appendChild(el('div', { class: 'g-btns' }, cont));
        await clicked(cont);
      }

      async function sceneHands(sec, sc) {
        sec.classList.add('g-hands');
        const head = el('div', { class: 'g-hands-head' },
          el('p', { class: 'lt-eyebrow' }, '2 · The hands'),
          el('p', { class: 'g-body' }, 'In 2018 the writer A.J. Jacobs set out to thank every person who had a hand in his morning coffee. He ended up thanking about a thousand people. The book is called ', el('i', null, 'Thanks a Thousand'), '.'),
          el('p', { class: 'g-body g-strong' }, 'Pick one thing on your plate.'));
        const chooser = el('div', { class: 'g-items', role: 'group', 'aria-label': 'Pick one thing' });
        Object.keys(ITEMS).forEach((k) => {
          const b = el('button', { class: 'g-item', type: 'button' }, U.html(ITEM_ICONS[k]), el('span', null, ITEMS[k].l.replace(/^One (slice of |cup of )?/, '')));
          b.addEventListener('click', () => start(k));
          b.addEventListener('mouseenter', () => LT.audio.sfx('tick', { g: 0.03 }));
          chooser.appendChild(b);
        });
        const stageEl = el('div', { class: 'g-web' });
        const canvas = el('canvas', { class: 'g-web-canvas', role: 'img', 'aria-label': 'A growing web of the people and forces behind one thing on your plate' });
        const big = el('div', { class: 'g-web-big', 'aria-live': 'polite' });
        stageEl.append(canvas, big);
        const count = el('div', { class: 'g-count' });
        const caption = el('p', { class: 'g-caption', 'aria-live': 'polite' }, 'Tap any light to see who is behind it.');
        const more = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button' }, 'Thank the next one');
        const bloom = el('button', { class: 'lt-btn', type: 'button' }, 'Let it bloom');
        const again = el('button', { class: 'g-skip', type: 'button' }, 'Start with something else');
        const cont = el('button', { class: 'lt-btn', type: 'button', hidden: true }, 'Next: both at once', el('span', { 'aria-hidden': 'true' }, '→'));
        const ctrl = el('div', { class: 'g-web-ctrl' }, count, caption, el('div', { class: 'g-btns' }, more, bloom, cont), again);
        stageEl.hidden = true; ctrl.hidden = true;
        sec.append(head, chooser, stageEl, ctrl);
        await api.wait(60);
        freeLight({ darkness: 0.45, radius: 520 });
        let web = null;
        const done = new Promise((res) => cont.addEventListener('click', res, { once: true }));
        function start(k) {
          LT.audio.sfx('clink');
          head.classList.add('small');
          chooser.hidden = true; stageEl.hidden = false; ctrl.hidden = false;
          big.textContent = ''; big.classList.remove('on');
          if (web) web.destroy();
          freeLight({ darkness: 0.12, radius: 700 });
          web = makeWeb(canvas, ITEMS[k], {
            caption(n) { caption.textContent = n.note ? `${cap(n.label)}. ${n.note}` : cap(n.label) + '.'; },
            count(nTotal) {
              count.textContent = `${nTotal} hands and forces, so far`;
              LT.music.param('swell', U.clamp((nTotal - 12) / 160, 0, 0.9));
              LT.music.param('melody', U.clamp(0.15 + nTotal / 200, 0.15, 0.7));
            },
            milestone() {
              big.innerHTML = '';
              big.append(el('span', null, 'You have never eaten'), el('br'), el('span', null, 'a meal ', el('i', null, 'alone'), '.'));
              big.classList.add('on');
              cont.hidden = false;
              LT.audio.sfx('swell', { dur: 2 });
              api.timeout(() => LT.audio.sfx('chime', { n: 80 }), 1900);
            },
            stardust() { LT.egg('grace-stardust', 'Stardust', 'The iron in your blood was made in stars that exploded before the sun existed. You go back a long way.'); },
          });
          sc.add(() => web && web.destroy());
          api.timeout(() => web && web.expand(web.root), RM ? 0 : 500);
        }
        more.addEventListener('click', () => web && web.expandNext());
        bloom.addEventListener('click', () => { if (!web) return; web.bloom(); bloom.disabled = true; bloom.textContent = 'Blooming…'; });
        again.addEventListener('click', () => {
          if (web) { web.destroy(); web = null; }
          chooser.hidden = false; stageEl.hidden = true; ctrl.hidden = true; head.classList.remove('small');
          bloom.disabled = false; bloom.textContent = 'Let it bloom';
          caption.textContent = 'Tap any light to see who is behind it.';
          freeLight({ darkness: 0.45, radius: 520 });
        });
        await done;
        LT.music.param('swell', 0.1); LT.music.param('melody', 0.3);
      }
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

      async function sceneBoth(sec, sc) {
        sec.classList.add('g-both');
        const chair = LT.state.chair;
        const text = el('div', { class: 'g-both-text' },
          el('p', { class: 'lt-eyebrow' }, '3 · Both at once'),
          el('p', { class: 'g-body' }, 'In October 1863, three months after Gettysburg, Abraham Lincoln proclaimed a national day of Thanksgiving. The war was still going. He didn’t ask anyone to pretend it wasn’t.'),
          el('blockquote', { class: 'g-quote' },
            el('p', null, '“…commend to His tender care all those who have become widows, orphans, mourners or sufferers in the lamentable civil strife in which we are unavoidably engaged…”'),
            el('cite', { class: 'lt-cite' }, 'Abraham Lincoln, Proclamation of Thanksgiving, October 3, 1863')),
          el('p', { class: 'g-body' }, 'Thanks and mourning in the same sentence. Gratitude isn’t the claim that everything is fine.'));
        const mk = (label, sub) => {
          const cv = el('canvas', { class: 'g-twin-canvas', 'aria-hidden': 'true' });
          const b = el('button', { class: 'g-twin', type: 'button', 'aria-label': `Light the candle: ${label}` }, cv, el('span', { class: 'g-twin-l' }, label), sub ? el('span', { class: 'g-twin-s' }, sub) : null);
          return { b, cv };
        };
        const A = mk('for what you have');
        const B = mk(chair ? `for ${chair}` : 'for what you miss');
        const twins = el('div', { class: 'g-twins' }, A.b, B.b);
        const status = el('p', { class: 'g-lede g-both-status', 'aria-live': 'polite' }, 'Light one.');
        sec.append(text, twins, status);
        const ca = LT.candle(A.cv, { lit: false, seed: 31 });
        const cb = LT.candle(B.cv, { lit: false, seed: 77, burn: 0.25 });
        sc.add(() => { ca.destroy(); cb.destroy(); });
        await api.wait(60);
        spot(sec, { darkness: 0.66, radius: Math.min(innerWidth, 1000) * 0.62 });
        B.b.disabled = true;
        A.b.focus({ preventScroll: true });
        await clicked(A.b);
        ca.light(); LT.audio.sfx('whoomp'); LT.light.pulse(); LT.stats.inc('candlesLit');
        A.b.disabled = true; A.b.classList.add('lit');
        status.textContent = chair ? `Now one for ${chair}.` : 'Now the other one.';
        B.b.disabled = false;
        B.b.focus({ preventScroll: true });
        await clicked(B.b);
        cb.light(); LT.audio.sfx('whoomp'); LT.light.pulse(); LT.stats.inc('candlesLit');
        B.b.disabled = true; B.b.classList.add('lit');
        swell(0.5, 0.1, 6000);
        status.innerHTML = '';
        words(status, 'You don’t have to blow one out to light the other.', 'g-lede');
        status.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
        await api.wait(RM ? 200 : 2000);
        const cont = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button' }, 'Next: the evidence', el('span', { 'aria-hidden': 'true' }, '→'));
        const cw = el('div', { class: 'g-btns' }, cont);
        sec.appendChild(cw);
        cw.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
        await clicked(cont);
      }

      async function sceneEvidence(sec, sc) {
        sec.classList.add('g-evidence');
        const card = (who, where, body, rot) => el('article', { class: 'g-index lt-card', style: { '--rot': rot + 'deg' } }, el('div', { class: 'g-index-who' }, who), el('p', null, body), el('div', { class: 'g-index-where' }, where));
        const c1 = card('Emmons & McCullough, 2003', 'Journal of Personality and Social Psychology', 'People who spent a few minutes each week listing what they were grateful for, instead of hassles or ordinary events, felt better about their lives as a whole. They also reported fewer physical complaints and spent more time exercising.', -1.6);
        const c2 = card('Seligman, Steen, Park & Peterson, 2005', 'American Psychologist', 'Of the exercises they tested, the biggest immediate lift came from the gratitude visit: write a letter to someone you never properly thanked, then deliver it. The boost lasted about a month.', 1.2);
        const cards = el('div', { class: 'g-cards' }, c1, c2);
        const guess = el('div', { class: 'g-guess lt-card' },
          el('p', { class: 'g-guess-q' }, 'Picture someone reading a thank-you note from you. Guess how it lands.'),
          el('label', { for: 'g-happy', class: 'g-range-l' }, 'How happy would they feel?', el('output', { id: 'g-happy-o', for: 'g-happy' }, '5')),
          el('input', { id: 'g-happy', type: 'range', min: 1, max: 10, value: 5 }),
          el('label', { for: 'g-awk', class: 'g-range-l' }, 'How awkward would they feel?', el('output', { id: 'g-awk-o', for: 'g-awk' }, '5')),
          el('input', { id: 'g-awk', type: 'range', min: 1, max: 10, value: 5 }));
        const check = el('button', { class: 'lt-btn lt-btn--ink', type: 'button' }, 'Check against the research');
        guess.appendChild(el('div', { class: 'g-btns' }, check));
        sec.append(el('p', { class: 'lt-eyebrow' }, '4 · The evidence'), el('p', { class: 'g-body g-ev-intro' }, 'Not magic. Not nothing. Three studies, in plain words.'), cards, guess);
        await api.wait(60);
        freeLight({ darkness: 0.38, radius: 600 });
        [c1, c2].forEach((c, i) => { c.style.animationDelay = (RM ? 0 : 200 + i * 350) + 'ms'; c.classList.add('g-deal'); });
        api.timeout(() => LT.audio.sfx('paper'), 200); api.timeout(() => LT.audio.sfx('paper'), 550);
        const h = guess.querySelector('#g-happy'), a = guess.querySelector('#g-awk');
        const ho = guess.querySelector('#g-happy-o'), ao = guess.querySelector('#g-awk-o');
        h.addEventListener('input', () => { ho.textContent = h.value; LT.audio.sfx('tick', { g: 0.03, f: 1800 + h.value * 120 }); });
        a.addEventListener('input', () => { ao.textContent = a.value; LT.audio.sfx('tick', { g: 0.03, f: 1800 + a.value * 120 }); });
        await clicked(check);
        check.remove();
        const c3 = card('Kumar & Epley, 2018', 'Psychological Science', `People wrote gratitude letters and predicted how the recipient would react. Over and over, writers underestimated how surprised and happy the recipients would feel, and overestimated how awkward it would be. You guessed ${h.value} out of 10 happy and ${a.value} out of 10 awkward. The research says: probably higher, and probably lower.`, -0.8);
        c3.classList.add('g-deal', 'g-index--wide');
        guess.replaceWith(c3);
        LT.audio.sfx('paper');
        swell(0.3, 0.1, 4000);
        await api.wait(RM ? 200 : 1400);
        const cont = el('button', { class: 'lt-btn', type: 'button' }, 'So write one', el('span', { 'aria-hidden': 'true' }, '→'));
        sec.appendChild(el('div', { class: 'g-btns' }, cont));
        cont.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
        await clicked(cont);
      }

      async function sceneLetter(sec, sc) {
        sec.classList.add('g-letter');
        const f = (id, label, ph, area, val) => {
          const input = el(area ? 'textarea' : 'input', Object.assign({ id, class: 'g-field', placeholder: ph, autocomplete: 'off', maxlength: area ? 400 : 60 }, area ? { rows: 3 } : { type: 'text' }));
          input.value = val || '';
          return { wrap: el('div', { class: 'g-f' }, el('label', { for: id }, label), input), input };
        };
        const to = f('g-to', 'Who did you never properly thank?', 'Their name', false, LT.state.letterTo);
        const did = f('g-did', 'One specific thing they did', 'drove me to the airport at 4 a.m. when I had nobody else to ask', true);
        const chg = f('g-chg', 'What it changed', 'I made the flight. I got the job. I think about it every time I fly.', true);
        const from = f('g-from', 'Sign it (optional)', 'your name', false);
        const SIGN = ['Love', 'Gratefully', 'Yours'];
        let sign = SIGN[0];
        const signs = el('div', { class: 'g-chips', role: 'group', 'aria-label': 'Sign-off' });
        SIGN.forEach((s, i) => {
          const b = el('button', { class: 'g-chip' + (i === 0 ? ' on' : ''), type: 'button' }, s);
          b.addEventListener('click', () => { sign = s; signs.querySelectorAll('.g-chip').forEach((c) => c.classList.remove('on')); b.classList.add('on'); render(); });
          signs.appendChild(b);
        });
        const form = el('form', { class: 'g-form', novalidate: true }, to.wrap, did.wrap, chg.wrap, el('div', { class: 'g-f' }, el('span', { class: 'g-f-l' }, 'Sign-off'), signs), from.wrap);
        form.addEventListener('submit', (e) => e.preventDefault());
        const paper = el('div', { class: 'g-paper lt-card' });
        const letter = el('div', { class: 'g-letter-text' });
        paper.appendChild(letter);
        const copy = el('button', { class: 'lt-btn lt-btn--ink', type: 'button' }, 'Copy the letter');
        const copied = el('p', { class: 'g-copied', 'aria-live': 'polite' });
        const send = el('p', { class: 'g-body g-send' }, 'Then actually send it. A text works. A card works. A voicemail works. The people in Kumar and Epley’s studies worried it would be awkward. Mostly, it wasn’t.');
        const cont = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button' }, 'I’ll send it', el('span', { 'aria-hidden': 'true' }, '→'));
        const right = el('div', { class: 'g-letter-right' }, paper, el('div', { class: 'g-btns' }, copy, cont), copied, send);
        sec.append(el('div', { class: 'g-letter-head' }, el('p', { class: 'lt-eyebrow' }, 'The letter'), el('h2', { class: 'lt-display g-h2' }, 'One person. ', el('i', null, 'One'), ' specific thing.')), el('div', { class: 'g-letter-grid' }, form, right));
        await api.wait(60);
        freeLight({ darkness: 0.32, radius: 640 });
        const sentence = (s) => { s = s.trim().replace(/\s+/g, ' '); if (!s) return ''; s = s.charAt(0).toUpperCase() + s.slice(1); return /[.!?…"”)]$/.test(s) ? s : s + '.'; };
        function parts() {
          const T = to.input.value.trim(), D = did.input.value.trim(), C = chg.input.value.trim(), F = from.input.value.trim();
          return {
            to: T || to.input.placeholder, toPh: !T,
            did: sentence(D || did.input.placeholder), didPh: !D,
            chg: sentence(C || chg.input.placeholder), chgPh: !C,
            from: F || '', sign,
          };
        }
        function plain() {
          const p = parts();
          return `Dear ${p.to},\n\nIt’s Thanksgiving, and I was thinking about you. (Turns out that’s the oldest meaning of the word thank.)\n\nThere’s something I never properly thanked you for. ${p.did}\n\n${p.chg}\n\nSo, thank you. I mean it.\n\n${p.sign},\n${p.from}`.trim();
        }
        function render() {
          const p = parts();
          const ph = (txt, on) => el('span', { class: on ? 'ph' : '' }, txt);
          letter.replaceChildren(
            el('p', null, 'Dear ', ph(p.to, p.toPh), ','),
            el('p', null, 'It’s Thanksgiving, and I was thinking about you. (Turns out that’s the oldest meaning of the word ', el('i', null, 'thank'), '.)'),
            el('p', null, 'There’s something I never properly thanked you for. ', ph(p.did, p.didPh)),
            el('p', null, ph(p.chg, p.chgPh)),
            el('p', null, 'So, thank you. I mean it.'),
            el('p', { class: 'g-sign' }, p.sign + ',', el('br'), p.from ? p.from : el('span', { class: 'ph' }, ' ')));
        }
        render();
        [to, did, chg, from].forEach((x) => x.input.addEventListener('input', () => {
          render();
          if (Math.random() < 0.4) pencil(1);
          if (x === to) { LT.state.letterTo = to.input.value.trim(); clearTimeout(sceneLetter._t); sceneLetter._t = setTimeout(LT.save, 500); }
        }));
        let counted = false;
        copy.addEventListener('click', () => {
          const txt = plain();
          U.copy(txt, letter).then((ok) => {
            copied.textContent = ok ? 'Copied. Now paste it somewhere they’ll read it.' : 'Your browser wouldn’t let me copy, so the letter is selected. Copy it from there.';
          });
          LT.audio.sfx('paper');
          if (!counted) { counted = true; LT.stats.inc('lettersWritten'); }
          LT.state.letterTo = to.input.value.trim(); LT.save();
          paper.classList.remove('g-stamp'); void paper.offsetWidth; paper.classList.add('g-stamp');
        });
        to.input.focus({ preventScroll: true });
        await clicked(cont);
        LT.state.letterTo = to.input.value.trim(); LT.save();
        if (!counted && (did.input.value.trim() || to.input.value.trim())) { LT.stats.inc('lettersWritten'); }
      }

      async function sceneEnd(sec, sc) {
        sec.classList.add('g-end');
        const lines = el('div', { class: 'g-end-lines' });
        const cv = el('canvas', { class: 'g-end-candle', 'aria-hidden': 'true' });
        sec.append(cv, lines);
        const candle = LT.candle(cv, { lit: true, seed: 12 });
        sc.add(() => candle.destroy());
        await api.wait(60);
        spot(sec, { darkness: 0.86, radius: 260 });
        LT.music.param('melody', 0.5);
        const L1 = el('p', { class: 'g-end-1' }, 'Gratitude is a kind of attention.');
        lines.appendChild(L1); L1.classList.add('g-rise');
        await api.wait(RM ? 200 : 2200);
        const L2 = el('p', { class: 'g-end-2' }, 'It’s where you choose to ', el('i', null, 'hold the light'), '.');
        lines.appendChild(L2); L2.classList.add('g-rise');
        LT.light.set({ darkness: 0.55, radius: Math.max(innerWidth, innerHeight) * 0.7 });
        swell(1, 0.2, 9000);
        LT.fx.embers(2.5);
        await api.wait(RM ? 200 : 2600);
        if (LT.state.thanks) {
          const L3 = el('p', { class: 'g-end-3' }, 'You said you’re thankful for', el('span', { class: 'lt-script' }, LT.state.thanks), 'Hold the light there a while.');
          lines.appendChild(L3); L3.classList.add('g-rise');
          await api.wait(RM ? 200 : 2200);
        }
        const nb = api.nextButton('Dessert is on the counter');
        const wrap = el('div', { class: 'g-end-next g-rise' }, nb);
        lines.appendChild(wrap);
        api.timeout(() => wrap.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' }), 300);
        freeLight({ darkness: 0.5, radius: 560 });
        nb.focus({ preventScroll: true });
      }

      /* ---------- go ---------- */
      (async () => {
        await run(0, sceneToast);
        await run(1, sceneRound);
        await run(2, sceneChair);
        await run(3, sceneYou);
        await run(4, sceneWord);
        await run(5, sceneHands);
        await run(6, sceneBoth);
        await run(7, sceneEvidence);
        await run(8, sceneLetter);
        await run(9, sceneEnd);
      })();
    },
  });

  /* ================================================================== */
  /* The web of hands, on a canvas.                                     */
  /* ================================================================== */
  function makeWeb(canvas, rootData, hooks) {
    const ctx = canvas.getContext('2d');
    let W = 1, H = 1, DPR = 1, alive = true, t = 0;
    const nodes = [];
    const cam = { x: 0, y: 0, s: 1.25 };
    let hover = null, milestone = false, blooming = false, bloomAcc = 0, expansions = 0;
    const bg = Array.from({ length: 260 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.25, tw: Math.random() * 6.28 }));
    const COLORS = { p: [255, 214, 138], n: [168, 208, 184], t: [233, 180, 162] };
    const NOTES = [61, 63, 65, 68, 70, 73, 75, 77, 80, 82, 85];
    const font = getComputedStyle(document.documentElement).getPropertyValue('--f-ui') || 'sans-serif';

    function resize() {
      const r = canvas.getBoundingClientRect();
      DPR = Math.min(2, devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    }
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro && ro.observe(canvas);

    function wrap(s, max) {
      const out = []; let line = '';
      s.split(' ').forEach((w) => { if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); });
      if (line) out.push(line);
      return out;
    }
    function add(d, parent, ang) {
      const depth = parent ? parent.depth + 1 : 0;
      const dist = depth === 1 ? 90 : 55;
      const n = {
        label: d.l, note: d.n || NOTE[d.l] || '', type: d.t || 'p', kids: d.k || null, parent, depth,
        x: parent ? parent.x + Math.cos(ang) * dist : 0, y: parent ? parent.y + Math.sin(ang) * dist : 0,
        vx: parent ? Math.cos(ang) * 60 : 0, vy: parent ? Math.sin(ang) * 60 : 0,
        born: t, expanded: false, seed: Math.random() * 10, lines: wrap(d.l, depth <= 1 ? 20 : 22),
      };
      nodes.push(n);
      return n;
    }
    const root = add(rootData, null, 0);

    function procedural(n) {
      const kids = [];
      const used = new Set();
      const want = n.depth <= 2 ? U.randi(3, 4) : U.randi(2, 3);
      for (let i = 0; i < want; i++) {
        let type = n.type;
        if (n.type === 'p') type = Math.random() < 0.3 ? 'n' : 'p';
        else if (n.type === 'n') type = Math.random() < 0.35 ? 'p' : 'n';
        else type = Math.random() < 0.55 ? 'p' : 't';
        const pool = POOL[type].filter((l) => !used.has(l) && l !== n.label);
        const l = U.pick(pool);
        used.add(l);
        kids.push({ l, t: type });
      }
      return kids;
    }
    function expand(n, quiet) {
      if (!n || n.expanded || nodes.length > 420) return;
      n.expanded = true;
      expansions++;
      const kids = n.kids || procedural(n);
      const base = n.parent ? Math.atan2(n.y - n.parent.y, n.x - n.parent.x) : -Math.PI / 2;
      const spread = n.parent ? Math.min(2.4, 0.7 + kids.length * 0.35) : Math.PI * 2;
      kids.forEach((k, i) => {
        const a = n.parent ? base - spread / 2 + (spread * (i + 0.5)) / kids.length : base + (i / kids.length) * Math.PI * 2;
        add(k, n, a + U.rand(-0.08, 0.08));
      });
      if (!quiet || expansions % 3 === 0) {
        if (LT.audio.ready && !LT.audio.muted) LT.music.instruments.musicbox(LT.audio.sfxBus, LT.audio.now() + 0.01, NOTES[Math.min(NOTES.length - 1, n.depth * 2 + (expansions % 3))], 1, quiet ? 0.25 : 0.55);
      }
      if (!quiet) {
        const p = toScreen(n);
        const r = canvas.getBoundingClientRect();
        LT.fx.burst(r.left + p.x, r.top + p.y, { count: 10, colors: ['#ffd68a', '#fff1c2'], speed: [40, 140], gravity: 0, size: [1, 2.4], life: [0.4, 0.9], blend: 'lighter' });
        hooks.caption && hooks.caption(n);
      }
      if (n.label.indexOf('star that died') >= 0) hooks.stardust && hooks.stardust();
      LT.stats.inc('handsThanked', kids.length);
      hooks.count && hooks.count(nodes.length);
      if (!milestone && nodes.length >= 46) { milestone = true; hooks.milestone && hooks.milestone(); }
    }
    function nextUnexpanded() {
      let best = null;
      for (const n of nodes) if (!n.expanded && (!best || n.depth < best.depth || (n.depth === best.depth && n.born < best.born))) best = n;
      return best;
    }
    function toScreen(n) { return { x: (n.x - cam.x) * cam.s + W / 2, y: (n.y - cam.y) * cam.s + H / 2 }; }
    function hit(px, py) {
      let best = null, bd = 1e9;
      for (const n of nodes) {
        const p = toScreen(n), d = Math.hypot(p.x - px, p.y - py);
        if (d < Math.max(18, radius(n) + 10) && d < bd) { bd = d; best = n; }
      }
      return best;
    }
    function radius(n) { const r = n.depth === 0 ? 11 : n.depth === 1 ? 7.5 : n.depth === 2 ? 5.8 : 4.4; return Math.max(1.5, r * Math.min(1, cam.s * 1.5)); }

    function onDown(e) {
      const r = canvas.getBoundingClientRect();
      const n = hit(e.clientX - r.left, e.clientY - r.top);
      if (!n) return;
      if (n.label.indexOf('star that died') >= 0) hooks.stardust && hooks.stardust();
      if (n.expanded) { hooks.caption && hooks.caption(n); LT.audio.sfx('tick', { g: 0.04 }); return; }
      expand(n);
    }
    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      hover = hit(e.clientX - r.left, e.clientY - r.top);
      canvas.style.cursor = hover && !hover.expanded ? 'pointer' : 'default';
    }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);

    function physics(dt) {
      const n = nodes.length;
      for (let i = 0; i < n; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < n; j++) {
          const b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 122500) continue;
          const d = Math.sqrt(d2) || 0.01;
          const f = (a.depth <= 1 || b.depth <= 1 ? 6400 : 3400) / (d2 + 160);
          dx /= d; dy /= d;
          a.vx -= dx * f * dt * 60; a.vy -= dy * f * dt * 60;
          b.vx += dx * f * dt * 60; b.vy += dy * f * dt * 60;
        }
      }
      for (const c of nodes) {
        if (!c.parent) continue;
        const p = c.parent;
        const rest = c.depth === 1 ? 190 : c.depth === 2 ? 118 : 80;
        let dx = c.x - p.x, dy = c.y - p.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const f = (d - rest) * 2.4 * dt;
        dx /= d; dy /= d;
        c.vx -= dx * f * 60 * 0.5; c.vy -= dy * f * 60 * 0.5;
        if (p !== root) { p.vx += dx * f * 60 * 0.25; p.vy += dy * f * 60 * 0.25; }
      }
      const damp = Math.pow(0.86, dt * 60);
      for (const c of nodes) {
        if (c === root) { c.x = 0; c.y = 0; c.vx = c.vy = 0; continue; }
        c.vx *= damp; c.vy *= damp;
        const sp = Math.hypot(c.vx, c.vy);
        if (sp > 600) { c.vx *= 600 / sp; c.vy *= 600 / sp; }
        c.x += c.vx * dt; c.y += c.vy * dt;
      }
    }
    function camera(dt) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const c of nodes) { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x); y1 = Math.max(y1, c.y); }
      const pad = cam.s > 0.5 ? 90 : 30;
      const bw = x1 - x0 + pad * 2, bh = y1 - y0 + pad * 2;
      const ts = U.clamp(Math.min(W / bw, H / bh), 0.05, 1.25);
      const k = 1 - Math.pow(0.25, dt);
      cam.s += (ts - cam.s) * k;
      cam.x += ((x0 + x1) / 2 - cam.x) * k;
      cam.y += ((y0 + y1) / 2 - cam.y) * k;
    }
    function draw() {
      const c = ctx;
      c.setTransform(DPR, 0, 0, DPR, 0, 0);
      c.clearRect(0, 0, W, H);
      const starMode = U.clamp((0.62 - cam.s) / 0.4, 0, 1);
      if (starMode > 0) {
        for (const s of bg) {
          const a = starMode * (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + s.tw)));
          c.fillStyle = `rgba(239,230,210,${a.toFixed(3)})`;
          c.beginPath(); c.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); c.fill();
        }
      }
      // edges
      c.lineWidth = 1;
      for (const n of nodes) {
        if (!n.parent) continue;
        const a = toScreen(n), b = toScreen(n.parent);
        const age = U.clamp((t - n.born) / 0.6, 0, 1);
        c.strokeStyle = `rgba(242,193,78,${(0.28 * age * (1 - starMode * 0.55)).toFixed(3)})`;
        c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x + (a.x - b.x) * age, b.y + (a.y - b.y) * age); c.stroke();
      }
      // nodes
      c.globalCompositeOperation = 'lighter';
      for (const n of nodes) {
        const p = toScreen(n), r = radius(n);
        const col = n.depth === 0 ? [255, 243, 214] : COLORS[n.type] || COLORS.p;
        const tw = 0.75 + 0.25 * Math.sin(t * 2 + n.seed * 3);
        const age = U.clamp((t - n.born) / 0.5, 0, 1);
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.2);
        g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${(0.55 * tw * age).toFixed(3)})`);
        g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, r * 4.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${age.toFixed(3)})`;
        c.beginPath(); c.arc(p.x, p.y, r * (0.8 + 0.2 * tw), 0, Math.PI * 2); c.fill();
        if (starMode > 0.4 && Math.sin(t * 0.9 + n.seed * 7) > 0.92) {
          const L = r * 5 * starMode;
          c.strokeStyle = `rgba(255,246,220,${(0.5 * starMode).toFixed(3)})`;
          c.beginPath(); c.moveTo(p.x - L, p.y); c.lineTo(p.x + L, p.y); c.moveTo(p.x, p.y - L); c.lineTo(p.x, p.y + L); c.stroke();
        }
      }
      c.globalCompositeOperation = 'source-over';
      // unexpanded rings
      if (cam.s > 0.45 && !blooming) {
        for (const n of nodes) {
          if (n.expanded) continue;
          const p = toScreen(n), r = radius(n);
          const pulse = 0.5 + 0.5 * Math.sin(t * 3 + n.seed);
          c.strokeStyle = `rgba(242,193,78,${(0.25 + 0.35 * pulse) * U.clamp((cam.s - 0.45) / 0.2, 0, 1)})`;
          c.lineWidth = 1.2;
          c.beginPath(); c.arc(p.x, p.y, r + 4 + pulse * 3, 0, Math.PI * 2); c.stroke();
        }
      }
      // labels
      const crowd = nodes.length < 26 ? 1 : 0;
      const base = U.clamp((cam.s - 0.42) / 0.2, 0, 1);
      c.textAlign = 'center'; c.textBaseline = 'top';
      for (const n of nodes) {
        const fresh = blooming ? 0 : U.clamp(1 - (t - n.born - 2.4) / 0.8, 0, 1);
        let a = Math.max(n === hover ? 1 : 0, fresh * (cam.s > 0.3 ? 1 : 0));
        if (n.depth === 0) a = Math.max(a, 0.95 * (1 - starMode));
        else if (n.depth === 1) a = Math.max(a, base);
        else a = Math.max(a, base * crowd);
        a *= U.clamp((t - n.born) / 0.4, 0, 1);
        if (a < 0.02) continue;
        const p = toScreen(n), r = radius(n);
        const fs = n.depth === 0 ? 17 : n.depth === 1 ? 14 : 12.5;
        c.font = `${n.depth <= 1 ? 600 : 500} ${fs}px ${font}`;
        n.lines.forEach((ln, i) => {
          const y = p.y + r + 7 + i * (fs + 2);
          c.lineWidth = 4; c.strokeStyle = `rgba(16,12,8,${(0.85 * a).toFixed(3)})`; c.lineJoin = 'round';
          c.strokeText(ln, p.x, y);
          c.fillStyle = n.depth === 0 ? `rgba(255,236,190,${a.toFixed(3)})` : `rgba(239,230,210,${a.toFixed(3)})`;
          c.fillText(ln, p.x, y);
        });
      }
    }
    const off = LT.loop.add((dt) => {
      if (!alive) return;
      t += dt;
      if (blooming) {
        bloomAcc += dt;
        const step = nodes.length < 80 ? 0.16 : 0.07;
        while (bloomAcc > step) {
          bloomAcc -= step;
          const nx = nextUnexpanded();
          if (!nx || nodes.length > 400) { blooming = false; break; }
          expand(nx, true);
        }
      }
      physics(dt);
      camera(dt);
      draw();
    });
    return {
      root,
      expand(n) { expand(n); },
      expandNext() { const n = nextUnexpanded(); if (n) expand(n); },
      bloom() { blooming = true; },
      destroy() { alive = false; off(); ro && ro.disconnect(); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); const c = ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height); },
    };
  }
})();
