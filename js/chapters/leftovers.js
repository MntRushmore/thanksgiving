/* V. Leftovers — the fridge, the porch, the stars, the candle. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el, S = U.svg;

  /* ---------- what goes in the containers ---------- */
  const STAT_INFO = {
    mythsCorrected: { label: 'Myths corrected', food: '#2b2219', note: 'You looked under the postcard. Most people never do.' },
    yearsTraveled: { label: 'Years traveled', food: '#8a6a3a', note: 'From 1621 to tonight, without a single layover.' },
    dishesTasted: { label: 'Dishes tasted', food: '#c98a3a', note: 'A balanced plate: one of everything, gravy on all of it.' },
    cranberriesBounced: { label: 'Cranberries bounced', food: '#b8243d', note: 'Fresh berries bounce. So, it turns out, do you.' },
    fryerFires: { label: 'Fryer fires', food: '#2a2622', note: 'Thaw it. Dry it. Outside, far from the house.' },
    marshmallowsBurnt: { label: 'Marshmallows sacrificed', food: '#3a2a1c', note: 'They died as they lived: on top of a sweet potato.' },
    wishbonesPulled: { label: 'Wishbones pulled', food: '#efe0c2', note: 'We won’t ask what you wished for.' },
    gravyPours: { label: 'Gravy pours', food: '#6b3f1d', note: 'Still not enough gravy. There is never enough gravy.' },
    fusesDefused: { label: 'Fuses defused', food: '#7a7468', note: 'Diplomatic immunity, earned one potato at a time.' },
    landminesExploded: { label: 'Topics that exploded', food: '#c8642a', note: 'Nobody remembers who started it. Everyone remembers.' },
    potatoesPassed: { label: 'Potatoes passed', food: '#efe3c2', note: 'The oldest deflection in the book. Still undefeated.' },
    incidentsHandled: { label: 'Incidents handled', food: '#6f8a4a', note: 'Peas, dog, alarm, gravy. You were the adult in the room.' },
    handsThanked: { label: 'Hands thanked', food: '#f2c14e', note: 'And there were always more behind them.' },
    lettersWritten: { label: 'Letters written', food: '#e8dcc1', note: 'Now send it. It will mean more than you think.' },
    candlesLit: { label: 'Candles lit', food: '#f4ead3', note: 'For what you have, and for what you miss.' },
    balloonsReleased: { label: 'Balloons released', food: '#3d5878', note: 'Macy\u2019s really did let them go in 1928. Somewhere over Queens, they popped.' },
    turkeySlices: { label: 'Turkey slices', food: '#e7c9a0', note: 'Dark meat or white? Wrong answer either way, according to someone.' },
    gobbles: { label: 'Gobbles', food: '#7a4a24', note: 'Only the males gobble. You did too, apparently.' },
    jellySlices: { label: 'Jelly slices (along the ridges)', food: '#8f1a2e', note: 'The ridges are for the can\u2019s strength. Everyone uses them as a guide anyway.' },
    onionsDropped: { label: 'Crispy onions', food: '#c98a3a', note: 'Dorcas Reilly would want you to have more.' },
    creamDollops: { label: 'Whipped cream', food: '#fbf6ea', note: 'Structurally, the pie is now mostly cream.' },
    cheesePulls: { label: 'Cheese pulls', food: '#f0b83c', note: 'Thank James Hemings.' },
    tableHighTemp: { label: 'Peak family temp', food: '#b8243d', note: 'Done is 165\u00b0F. Families run hotter.', unit: '\u00b0F' },
    dinnersSurvived: { label: 'Dinners survived', food: '#d9a441', note: 'Promoted from the kids\u2019 table. It goes on your permanent record.' },
    dinnersExploded: { label: 'Dinners exploded', food: '#3a2a1c', note: 'Yep. That\u2019s us.' },
    dogBribes: { label: 'Dog bribes', food: '#d39a4c', note: 'Biscuit sends his regards.' },
  };
  const STAT_ORDER = Object.keys(STAT_INFO);
  const LID_COLORS = ['#6f1526', '#646a3a', '#d9a441', '#2c7a74', '#b9552a', '#5b4870', '#3d5878'];
  const humanize = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

  /* The order of the Haudenosaunee Thanksgiving Address (as widely published in English). */
  const ADDRESS = ['The People', 'The Earth Mother', 'The Waters', 'The Fish', 'The Plants', 'The Food Plants', 'The Medicine Herbs', 'The Animals', 'The Trees', 'The Birds', 'The Four Winds', 'The Thunderers', 'The Sun', 'Grandmother Moon', 'The Stars', 'The Enlightened Teachers', 'The Creator'];

  LT.defineEgg('moonpie', 'Moon pie', 'Look up. Tap the moon.');
  LT.defineEgg('shootingstar', 'Shooting star', 'Watch the sky on the porch.');

  LT.chapter({
    id: 'leftovers', index: 5, numeral: 'V', course: 'Dessert', title: 'Leftovers',
    blurb: 'The fridge, the porch, the stars, and one last candle.',
    music: 'leftovers', transition: 'smoke', light: { darkness: 0.62, radius: 520 },
    mount(root, api) {
      root.classList.add('lo');
      let sceneEl = null, sceneOff = null, idx = -1;
      const scenes = [doorScene, porchScene, candleScene];
      async function goScene(i) {
        if (sceneEl) {
          const old = sceneEl;
          old.classList.add('lo-out');
          sceneOff && sceneOff();
          await api.wait(U.reducedMotion ? 50 : 900);
          old.remove();
        }
        idx = i;
        sceneEl = el('div', { class: 'lo-scene' });
        root.appendChild(sceneEl);
        root.scrollTop = 0;
        sceneOff = scenes[i](sceneEl) || null;
      }
      api.cleanup(() => sceneOff && sceneOff());
      goScene(0);

      /* ================= 1. the fridge ================= */
      function doorScene(box) {
        const offs = [];
        box.classList.add('lo-kitchen');
        LT.light.set({ darkness: 0.62, radius: 520 });
        LT.music.param('night', 0);
        const st = LT.state;
        const head = el('header', { class: 'lo-head' },
          el('p', { class: 'lt-eyebrow' }, 'Dessert · later that night'),
          U.html('<h2 class="lt-display lo-title">The <i>Leftovers</i> Report</h2>'),
          el('p', { class: 'lo-dek' }, 'The dishes are done. Mostly. Somebody is asleep on the couch. Everything you did tonight is in the fridge.'));

        // the door, with its magnets
        const door = el('div', { class: 'fr-door' });
        const notes = el('div', { class: 'fr-notes' });
        notes.appendChild(el('div', { class: 'fr-note fr-note--grandma', style: { '--r': '-3deg' } }, el('span', { class: 'mag', style: { background: '#6f1526' } }), el('p', { class: 'lt-script' }, 'Take a plate. Text me when you get home.'), el('p', { class: 'lt-script sig' }, '— R.')));
        if (st.thanks) notes.appendChild(el('div', { class: 'fr-note fr-note--sticky', style: { '--r': '2.5deg' } }, el('span', { class: 'mag', style: { background: '#646a3a' } }), el('p', { class: 'lt-hand k' }, 'thankful for:'), el('p', { class: 'lt-hand' }, st.thanks)));
        notes.appendChild(handTurkey());
        if (st.tableOutcome === 'survived') notes.appendChild(el('div', { class: 'fr-note fr-note--cert', style: { '--r': '-1.5deg' } }, el('span', { class: 'mag', style: { background: '#d9a441' } }), el('p', { class: 'k' }, 'CERTIFICATE'), el('p', null, 'Promoted from the kids’ table'), el('p', { class: 'lt-script sig' }, 'Grandma')));
        if (st.tableOutcome === 'chaos') notes.appendChild(el('div', { class: 'fr-note fr-note--sticky', style: { '--r': '-4deg', background: '#f3c9c9' } }, el('span', { class: 'mag', style: { background: '#b8243d' } }), el('p', { class: 'lt-hand' }, 'Smoke alarm battery: replaced. Again.'), el('p', { class: 'lt-hand k' }, '— Dad')));
        if (st.bingo && st.bingo.length) notes.appendChild(bingoCard(st.bingo));
        if (st.letterTo) notes.appendChild(el('div', { class: 'fr-note fr-note--sticky', style: { '--r': '3deg', background: '#cfe0c4' } }, el('span', { class: 'mag', style: { background: '#3d5878' } }), el('p', { class: 'lt-hand' }, `Send the letter to ${st.letterTo}.`), el('p', { class: 'lt-hand k' }, 'Today. Not someday.')));
        const handle = el('button', { class: 'fr-handle', type: 'button', 'aria-label': 'Open the fridge' }, el('span', null, 'Open the fridge'));
        door.append(notes, handle);

        // the inside
        const inside = el('div', { class: 'fr-inside', 'aria-live': 'polite' });
        const shelves = buildShelves();
        inside.append(el('div', { class: 'fr-bulb', 'aria-hidden': 'true' }), ...shelves);
        const fridge = el('div', { class: 'fridge' }, inside, door);
        const spill = el('div', { class: 'fr-spill', 'aria-hidden': 'true' });
        const onward = el('div', { class: 'lo-onward' },
          el('p', { class: 'lo-mom' }, el('b', null, 'Mom, from the other room: '), '“Take the stuffing. TAKE IT. I will not have this stuffing in my house tomorrow.”'),
          el('button', { class: 'lt-btn', type: 'button', on: { click: () => { LT.audio.sfx('thud', { g: 0.3 }); goScene(1); } } }, 'Step outside', el('span', { 'aria-hidden': 'true' }, '→')));
        onward.hidden = true;
        box.append(spill, head, fridge, onward);

        let hum = null;
        function open() {
          if (fridge.classList.contains('open')) return;
          fridge.classList.add('open');
          spill.classList.add('on');
          LT.audio.sfx('pop', { f: 300, g: 0.2 });
          LT.audio.sfx('whoosh', { dur: 0.5, low: 120, high: 700, g: 0.12 });
          hum = fridgeHum();
          LT.light.set({ darkness: 0.35, radius: 700 });
          api.timeout(() => { onward.hidden = false; onward.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 800, easing: 'ease-out' }); }, 1400);
          api.timeout(() => { const first = inside.querySelector('.tub'); first && first.focus({ preventScroll: true }); }, 1200);
        }
        handle.addEventListener('click', open);
        offs.push(() => hum && hum.stop());
        return () => offs.forEach((f) => f());
      }

      function buildShelves() {
        const items = [];
        const stats = LT.state.stats || {};
        const rank = (k) => { const i = STAT_ORDER.indexOf(k); return i < 0 ? 99 : i; };
        Object.keys(stats).filter((k) => stats[k] > 0 && STAT_INFO[k]).sort((a, b) => rank(a) - rank(b)).slice(0, 14).forEach((k) => {
          const info = STAT_INFO[k];
          items.push({ kind: 'stat', label: info.label, value: Math.round(stats[k]) + (info.unit || ''), food: info.food, note: info.note });
        });
        const eggs = LT.state.eggs || {};
        Object.keys(eggs).forEach((id) => items.push({ kind: 'egg', label: eggs[id].title, value: '✦', food: '#f2c14e', note: eggs[id].note || 'A secret, found.' }));
        const unknown = (LT.eggCatalog || []).filter((e) => !eggs[e.id]);
        U.shuffle(unknown).slice(0, 5).forEach((e) => items.push({ kind: 'mystery', label: '???', value: '', food: '#4a4a3a', note: e.hint ? `Mystery leftovers. Hint: ${e.hint}` : 'Mystery leftovers. Do not open.' }));
        if (unknown.length > 5) items.push({ kind: 'mystery', label: `${unknown.length - 5} more ???`, value: '', food: '#4a4a3a', note: `${unknown.length - 5} more secrets are still out there, in the courses and in the keys you type.` });
        if (!items.some((i) => i.kind === 'stat')) {
          items.unshift({ kind: 'stat', label: 'Turkey (untouched)', value: '1', food: '#c98a3a', note: 'You skipped straight to dessert. Honestly? Respect.' });
        }
        items.push({ kind: 'joke', label: 'A lid that fits nothing', value: '', food: 'transparent', note: 'Every family has one. Nobody knows where it came from. Nobody throws it out.' });
        items.push({ kind: 'joke', label: 'Soup (tomorrow)', value: '', food: '#d8b07a', note: 'The carcass becomes soup. The cycle continues.' });
        // shelves of five (three on a phone)
        const per = innerWidth < 560 ? 3 : 5;
        const shelves = [];
        for (let s = 0; s * per < items.length; s++) {
          const shelf = el('div', { class: 'fr-shelf' });
          items.slice(s * per, (s + 1) * per).forEach((it, i) => shelf.appendChild(tub(it, s * per + i)));
          shelves.push(shelf);
        }
        return shelves;
      }

      function tub(it, i) {
        const lid = LID_COLORS[i % LID_COLORS.length];
        const t = el('button', { class: `tub tub--${it.kind}`, type: 'button', style: { '--lid': lid, '--food': it.food, '--i': i, '--w': `${U.randi(0, 2)}` } },
          el('span', { class: 'tub-lid', 'aria-hidden': 'true' }),
          el('span', { class: 'tub-body', 'aria-hidden': 'true' }, el('span', { class: 'tub-food' })),
          el('span', { class: 'tub-tape' }, el('span', { class: 'tub-label' }, it.label), it.value !== '' ? el('span', { class: 'tub-val' }, String(it.value)) : null));
        const tip = el('span', { class: 'tub-note', role: 'note' }, it.note);
        t.appendChild(tip);
        t.addEventListener('click', () => {
          const was = t.classList.contains('peek');
          t.parentElement.parentElement.querySelectorAll('.tub.peek').forEach((x) => x.classList.remove('peek'));
          if (!was) {
            t.classList.add('peek');
            LT.audio.sfx('pop', { f: U.rand(500, 900), g: 0.18 });
            if (it.kind === 'mystery') LT.audio.sfx('boing');
          }
        });
        return t;
      }

      function handTurkey() {
        // Benji's hand turkey, in crayon.
        const svg = S('svg', { viewBox: '0 0 160 150', class: 'hand-turkey', 'aria-label': 'A hand turkey drawn in crayon, signed Benji' });
        const crayon = (d, c, w = 5) => S('path', { d, stroke: c, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#crayon)' });
        svg.appendChild(S('defs', null, S('filter', { id: 'crayon' }, S('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.9, numOctaves: 1, result: 'n' }), S('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 2.5 }))));
        svg.appendChild(S('rect', { x: 2, y: 2, width: 156, height: 146, fill: '#f6f0e1' }));
        svg.appendChild(crayon('M42 128 C40 100 30 92 24 70 C20 54 34 52 38 66 L44 84 L40 40 C38 26 54 24 56 40 L60 76 L64 28 C66 12 82 14 82 30 L80 74 L90 36 C94 22 110 26 106 40 L96 82 L114 56 C122 44 136 54 128 64 L104 104 C96 118 88 128 84 128 Z', '#8a4b1f', 4));
        svg.appendChild(crayon('M48 40 L46 52 M66 30 L66 44 M88 40 L84 52 M112 58 L104 66', '#e0662f', 6));
        svg.appendChild(crayon('M30 70 L36 82', '#d9a441', 6));
        svg.appendChild(S('circle', { cx: 120, cy: 60, r: 3, fill: '#1c130c' }));
        svg.appendChild(crayon('M128 62 L136 64 L128 68', '#d9a441', 3));
        svg.appendChild(crayon('M124 68 C126 76 120 78 120 72', '#b8243d', 4));
        svg.appendChild(crayon('M58 128 L56 142 M74 128 L76 142', '#d9a441', 4));
        svg.appendChild(S('text', { x: 14, y: 22, 'font-family': 'Caveat, cursive', 'font-size': 20, fill: '#3d5878', transform: 'rotate(-6 14 22)' }, 'BENJI'));
        svg.appendChild(S('text', { x: 100, y: 140, 'font-family': 'Caveat, cursive', 'font-size': 15, fill: '#b8243d' }, 'age 4'));
        return el('div', { class: 'fr-note fr-note--art', style: { '--r': '4deg' } }, el('span', { class: 'mag', style: { background: '#2c7a74' } }), svg);
      }

      function bingoCard(squares) {
        const grid = el('div', { class: 'bingo-mini' });
        squares.slice(0, 9).forEach((s) => grid.appendChild(el('span', null, s)));
        for (let i = squares.length; i < 9; i++) grid.appendChild(el('span', { class: 'empty' }, ''));
        return el('div', { class: 'fr-note fr-note--bingo', style: { '--r': '-2deg' } }, el('span', { class: 'mag', style: { background: '#5b4870' } }), el('p', { class: 'k' }, 'FAMILY BINGO'), grid);
      }

      function fridgeHum() {
        const A = LT.audio;
        if (!A.ready) return null;
        const ctx = A.ctx, g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);
        g.connect(A.sfxBus);
        const o1 = ctx.createOscillator(); o1.frequency.value = 58; o1.type = 'sine';
        const o2 = ctx.createOscillator(); o2.frequency.value = 117; o2.type = 'triangle';
        const g2 = ctx.createGain(); g2.gain.value = 0.35;
        o1.connect(g); o2.connect(g2); g2.connect(g); o1.start(); o2.start();
        return { stop() { const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0.0001, t + 0.6); setTimeout(() => { o1.stop(); o2.stop(); }, 700); } };
      }

      /* ================= 2. the porch ================= */
      function porchScene(box) {
        box.classList.add('lo-porch-scene');
        const offs = [];
        LT.light.set({ darkness: 0.28, radius: 600 });
        LT.music.param('night', 0.6);
        const wind = LT.audio.sfx('wind', { g: 0.28 });
        offs.push(() => wind && wind.stop(1));
        const sky = el('canvas', { class: 'lo-sky', 'aria-hidden': 'true' });
        const porch = el('div', { class: 'lo-porch', 'aria-hidden': 'true', html: PORCH_SVG });
        const goodbyes = el('div', { class: 'lo-goodbyes', 'aria-live': 'polite' });
        const panel = el('div', { class: 'lo-panel' });
        box.append(sky, porch, goodbyes, panel);
        const starsApi = starSky(sky, offs);

        // goodbyes on the porch
        const LINES = ['Drive safe!', 'Text me when you get home.', 'Did you take a plate?', 'Love you.', 'Who has my good dish?', 'Same time next year.', 'Go, go, it’s cold. Go.'];
        let gi = 0;
        const sayBye = () => {
          if (gi >= LINES.length) return;
          const line = el('span', { class: 'bye', style: { left: `${U.rand(8, 70)}%`, top: `${U.rand(4, 60)}%` } }, LINES[gi++]);
          goodbyes.appendChild(line);
          if (gi % 3 === 0) LT.audio.sfx('thud', { g: 0.18 });
          setTimeout(() => line.remove(), 5200);
        };
        sayBye();
        const byeTimer = setInterval(sayBye, 1150);
        offs.push(() => clearInterval(byeTimer));

        const step = (nodes, btnLabel, onNext) => {
          panel.innerHTML = '';
          panel.append(...nodes);
          if (btnLabel) {
            const b = el('button', { class: 'lt-btn', type: 'button' }, btnLabel);
            b.addEventListener('click', onNext, { once: true });
            panel.appendChild(b);
          }
          panel.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 900, easing: 'ease-out' });
        };

        api.timeout(() => {
          step([el('p', { class: 'lt-eyebrow' }, 'Outside'), el('p', { class: 'lo-big' }, 'The cars pull away one by one. Someone honks twice at the corner, like always. Then it’s quiet.')], 'Look up', lookUp);
        }, 2600);

        function lookUp() {
          LT.audio.sfx('swell', { dur: 2.2, g: 0.12 });
          box.classList.add('look-up');
          LT.music.param('night', 0.85);
          const mine = LT.state.thanks;
          const chair = LT.state.chair;
          const nodes = [el('p', { class: 'lt-eyebrow' }, 'Look up')];
          if (mine) {
            nodes.push(el('p', { class: 'lo-big' }, 'You said you were thankful for:'), el('p', { class: 'lt-script lo-mine' }, mine));
            api.timeout(() => starsApi.release(mine, 0.62, 0.28), 1200);
          } else {
            nodes.push(el('p', { class: 'lo-big' }, 'You didn’t say out loud what you were thankful for. That’s allowed. Keep it. It goes up anyway.'));
            api.timeout(() => starsApi.release('', 0.62, 0.28), 1200);
          }
          if (chair) {
            nodes.push(el('p', { class: 'lo-small' }, 'And one for ', el('span', { class: 'lt-script' }, chair), ', who wasn’t at the table this year.'));
            api.timeout(() => starsApi.release(chair, 0.4, 0.22), 3200);
          }
          step(nodes, 'Keep looking', address);
        }

        function address() {
          LT.music.param('night', 1);
          box.scrollTo({ top: 0, behavior: U.reducedMotion ? 'auto' : 'smooth' });
          panel.classList.add('tight');
          const intro = el('div', { class: 'lo-address-intro' },
            el('p', { class: 'lt-eyebrow' }, 'The words that come before all else'),
            el('p', { class: 'lo-big' }, 'Long before 1621, and still today, Haudenosaunee gatherings open with the Thanksgiving Address, ', el('i', null, 'Ohén:ton Karihwatéhkwen'), ': the words that come before all else.'),
            el('p', { class: 'lo-small' }, 'It isn’t a grace said over food. It’s a long, deliberate act of attention that thanks the whole world in order, and after each part the speaker asks the gathering to agree. It isn’t ours to recite. But its order is a lesson in where to point the light. Light it, one at a time.'));
          step([intro], null);
          const list = el('ol', { class: 'lo-address' });
          ADDRESS.forEach((name, i) => {
            const li = el('li', null, el('button', { type: 'button', class: 'addr', disabled: i > 0 }, el('span', { class: 'dot', 'aria-hidden': 'true' }), el('span', { class: 'nm' }, name)));
            list.appendChild(li);
          });
          panel.appendChild(list);
          const auto = el('button', { class: 'lt-btn lt-btn--ghost addr-auto', type: 'button' }, 'Let it play');
          panel.appendChild(auto);
          const btns = [...list.querySelectorAll('.addr')];
          let lit = 0, autoplay = null;
          const SCALE = [62, 64, 67, 69, 71, 74, 76, 79, 81, 83, 86, 88, 91, 93, 95, 98, 100];
          function light(i) {
            if (i !== lit) return;
            const b = btns[i];
            b.classList.add('on'); b.disabled = true;
            LT.audio.sfx('chime', { n: SCALE[i] - 12 });
            starsApi.constellation(i, ADDRESS.length);
            lit++;
            if (lit < btns.length) { btns[lit].disabled = false; if (!autoplay) btns[lit].focus({ preventScroll: true }); }
            else finish();
          }
          btns.forEach((b, i) => b.addEventListener('click', () => light(i)));
          auto.addEventListener('click', () => {
            auto.remove();
            autoplay = setInterval(() => (lit < btns.length ? light(lit) : clearInterval(autoplay)), U.reducedMotion ? 250 : 1100);
            offs.push(() => clearInterval(autoplay));
          });
          function finish() {
            clearInterval(autoplay);
            auto.remove();
            LT.music.param('night', 0.7);
            LT.audio.sfx('swell', { dur: 2.6, g: 0.1 });
            api.timeout(() => {
              const end = el('div', { class: 'lo-address-end' },
                el('p', { class: 'lo-onemind' }, 'Now our minds are one.'),
                el('p', { class: 'lt-cite' }, 'The refrain of the Haudenosaunee Thanksgiving Address. The names above follow the order of its widely published English version; the full address, in English and in the Haudenosaunee languages, is shared by Haudenosaunee educators and is worth reading in their words.'),
                el('button', { class: 'lt-btn', type: 'button', on: { click: () => { LT.audio.sfx('thud', { g: 0.25 }); goScene(2); } } }, 'Go back inside', el('span', { 'aria-hidden': 'true' }, '→')));
              panel.appendChild(end);
              end.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1600, easing: 'ease-out' });
              end.scrollIntoView({ behavior: U.reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
            }, 1400);
          }
        }
        return () => offs.forEach((f) => f());
      }

      /* the night sky: stars, the moon, a shooting star, lanterns */
      function starSky(canvas, offs) {
        const cx = canvas.getContext('2d');
        let W = 0, H = 0, DPR = 1;
        const rnd = U.seeded(1126);
        const stars = Array.from({ length: 360 }, () => ({ x: rnd(), y: Math.pow(rnd(), 1.25) * 0.8, r: rnd() < 0.06 ? 1.6 + rnd() * 1.2 : 0.4 + rnd() * 0.9, tw: rnd() * 10, sp: 0.6 + rnd() * 2.5, hue: rnd() }));
        const lanterns = [];
        const named = [];
        const cons = [];
        let moonClicks = 0, moonPie = false, shoot = null, shootT = U.rand(8, 14);
        const moon = { x: 0.84, y: 0.17, r: 30 };
        function resize() {
          const r = canvas.getBoundingClientRect();
          DPR = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
          canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
        }
        resize();
        const onR = () => resize();
        addEventListener('resize', onR); offs.push(() => removeEventListener('resize', onR));

        const onClick = (e) => {
          const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
          const mr = moon.r * Math.min(1.2, W / 900 + 0.5);
          if (Math.hypot(x - moon.x * W, y - moon.y * H) < mr + 14) {
            moonClicks++;
            LT.audio.sfx('ting', { f: 1800 + moonClicks * 200 });
            if (moonClicks >= 3 && !moonPie) { moonPie = true; LT.audio.sfx('tada'); LT.fx.confetti(e.clientX, e.clientY, { count: 40 }); LT.egg('moonpie', 'Moon pie', 'Every full moon is a pumpkin pie if you squint.'); }
            return;
          }
          if (shoot && Math.hypot(x - shoot.x * W, y - shoot.y * H) < 60) {
            LT.fx.sparks(e.clientX, e.clientY, 30);
            LT.audio.sfx('secret');
            LT.egg('shootingstar', 'Caught a shooting star', 'Make a wish. (The wishbone counts too.)');
            shoot = null;
          }
        };
        canvas.addEventListener('pointerdown', onClick);
        offs.push(() => canvas.removeEventListener('pointerdown', onClick));

        const off = LT.loop.add((dt, t) => {
          cx.setTransform(DPR, 0, 0, DPR, 0, 0);
          cx.clearRect(0, 0, W, H);
          // sky
          const g = cx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, '#05070d'); g.addColorStop(0.55, '#0c1120'); g.addColorStop(1, '#1d1a22');
          cx.fillStyle = g; cx.fillRect(0, 0, W, H);
          // milky way haze
          cx.save(); cx.translate(W * 0.5, H * 0.35); cx.rotate(-0.42);
          const mw = cx.createLinearGradient(0, -H * 0.18, 0, H * 0.18);
          mw.addColorStop(0, 'rgba(180,190,230,0)'); mw.addColorStop(0.5, 'rgba(180,190,230,.06)'); mw.addColorStop(1, 'rgba(180,190,230,0)');
          cx.fillStyle = mw; cx.fillRect(-W, -H * 0.18, W * 2, H * 0.36); cx.restore();
          // stars
          for (const s of stars) {
            const a = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.sp + s.tw));
            cx.globalAlpha = a;
            cx.fillStyle = s.hue < 0.15 ? '#ffd9a8' : s.hue > 0.9 ? '#cfe0ff' : '#f4efe6';
            cx.beginPath(); cx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); cx.fill();
          }
          cx.globalAlpha = 1;
          // moon (or pie)
          const mr = moon.r * Math.min(1.2, W / 900 + 0.5), mx = moon.x * W, my = moon.y * H;
          const halo = cx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 4);
          halo.addColorStop(0, 'rgba(255,240,210,.18)'); halo.addColorStop(1, 'rgba(255,240,210,0)');
          cx.fillStyle = halo; cx.beginPath(); cx.arc(mx, my, mr * 4, 0, Math.PI * 2); cx.fill();
          if (!moonPie) {
            cx.fillStyle = '#f1ead6'; cx.beginPath(); cx.arc(mx, my, mr, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = 'rgba(160,150,130,.35)';
            [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.05, 0.35, 0.12], [0.35, -0.35, 0.1]].forEach(([dx, dy, rr]) => { cx.beginPath(); cx.arc(mx + dx * mr, my + dy * mr, rr * mr, 0, Math.PI * 2); cx.fill(); });
          } else {
            cx.fillStyle = '#c9772e'; cx.beginPath(); cx.arc(mx, my, mr, 0, Math.PI * 2); cx.fill();
            cx.strokeStyle = '#e6b36a'; cx.lineWidth = mr * 0.22; cx.beginPath(); cx.arc(mx, my, mr * 0.9, 0, Math.PI * 2); cx.stroke();
            cx.strokeStyle = 'rgba(120,60,20,.6)'; cx.lineWidth = 1.5;
            for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; cx.beginPath(); cx.moveTo(mx, my); cx.lineTo(mx + Math.cos(a) * mr * 0.8, my + Math.sin(a) * mr * 0.8); cx.stroke(); }
            cx.fillStyle = '#fff8ec'; cx.beginPath(); cx.arc(mx, my, mr * 0.28, 0, Math.PI * 2); cx.fill();
          }
          // shooting star
          shootT -= dt;
          if (shootT <= 0 && !shoot) { shoot = { x: U.rand(0.1, 0.6), y: U.rand(0.05, 0.3), vx: U.rand(0.25, 0.4), vy: U.rand(0.08, 0.16), life: 0 }; shootT = U.rand(10, 18); }
          if (shoot) {
            shoot.life += dt; shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
            const sx = shoot.x * W, sy = shoot.y * H, tx = sx - shoot.vx * W * 0.25, ty = sy - shoot.vy * H * 0.25;
            const sg = cx.createLinearGradient(tx, ty, sx, sy);
            sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(1, `rgba(255,250,235,${Math.max(0, 1 - shoot.life / 1.6)})`);
            cx.strokeStyle = sg; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(tx, ty); cx.lineTo(sx, sy); cx.stroke();
            if (shoot.life > 1.6) shoot = null;
          }
          // constellation lights (the Address)
          for (const c of cons) {
            c.k = Math.min(1, c.k + dt * 0.8);
            const a = c.k;
            cx.strokeStyle = `rgba(242,193,78,${0.28 * a})`; cx.lineWidth = 1;
            cx.beginPath(); c.pts.forEach(([x, y], i) => (i ? cx.lineTo(x * W, y * H) : cx.moveTo(x * W, y * H))); cx.stroke();
            c.pts.forEach(([x, y]) => {
              const gg = cx.createRadialGradient(x * W, y * H, 0, x * W, y * H, 10);
              gg.addColorStop(0, `rgba(255,230,170,${a})`); gg.addColorStop(1, 'rgba(255,200,120,0)');
              cx.fillStyle = gg; cx.beginPath(); cx.arc(x * W, y * H, 10, 0, Math.PI * 2); cx.fill();
            });
          }
          // lanterns rising to become stars
          for (const l of lanterns) {
            l.t += dt;
            const k = U.clamp(l.t / l.dur, 0, 1), e = U.ease.inOutSine(k);
            const x = U.lerp(l.x0, l.x1, e) + Math.sin(l.t * 1.3) * 10 * (1 - k), y = U.lerp(l.y0, l.y1, e);
            const glowR = U.lerp(26, 9, k);
            const lg = cx.createRadialGradient(x * W, y * H, 0, x * W, y * H, glowR * 2.4);
            lg.addColorStop(0, 'rgba(255,240,200,1)'); lg.addColorStop(0.25, 'rgba(255,200,110,.85)'); lg.addColorStop(1, 'rgba(255,160,60,0)');
            cx.fillStyle = lg; cx.beginPath(); cx.arc(x * W, y * H, glowR * 2.4, 0, Math.PI * 2); cx.fill();
            if (k >= 1 && !l.done) { l.done = true; LT.audio.sfx('ting', { f: 2600 }); if (l.text) named.push({ x: x, y: y, text: l.text }); }
          }
          cx.font = `${Math.max(14, Math.min(20, W / 60))}px "Homemade Apple", cursive`;
          cx.textAlign = 'center';
          for (const n of named) {
            n.a = Math.min(1, (n.a || 0) + dt * 0.6);
            cx.fillStyle = `rgba(255,236,200,${0.85 * n.a})`;
            const txt = n.text.length > 40 ? n.text.slice(0, 38) + '…' : n.text;
            cx.fillText(txt, n.x * W, n.y * H + 34);
          }
        });
        offs.push(off);
        return {
          release(text, x1, y1) {
            lanterns.push({ x0: 0.5, y0: 0.92, x1, y1, t: 0, dur: U.reducedMotion ? 0.5 : 4.5, text });
            LT.audio.sfx('swell', { dur: 1.2, g: 0.08 });
          },
          constellation(i, n) {
            const cx0 = 0.07 + ((i * 0.618034 + 0.1) % 1) * 0.86;
            const cy0 = 0.08 + ((i * 0.381966 + 0.05) % 1) * 0.55;
            const r2 = U.seeded(i * 97 + 3);
            const pts = Array.from({ length: 3 + Math.floor(r2() * 3) }, () => [cx0 + (r2() - 0.5) * 0.07, cy0 + (r2() - 0.5) * 0.1]);
            cons.push({ pts, k: 0 });
          },
        };
      }

      const PORCH_SVG = `
<svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice">
  <defs><linearGradient id="lo-wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1b140e"/><stop offset="1" stop-color="#0b0806"/></linearGradient>
  <radialGradient id="lo-lamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(255,210,140,.55)"/><stop offset="1" stop-color="rgba(255,190,110,0)"/></radialGradient></defs>
  <circle cx="1040" cy="70" r="150" fill="url(#lo-lamp)"/>
  <path d="M0 260 L0 150 L1200 150 L1200 260Z" fill="url(#lo-wood)"/>
  <path d="M0 150 H1200" stroke="#2a2018" stroke-width="6"/>
  <g stroke="#0e0a07" stroke-width="14">${Array.from({ length: 24 }, (_, i) => `<path d="M${25 + i * 50} 150 V255"/>`).join('')}</g>
  <path d="M0 158 H1200" stroke="#2c221a" stroke-width="10"/>
  <rect x="1005" y="0" width="22" height="70" fill="#100c08"/>
  <path d="M1000 60 h32 l-4 34 h-24z" fill="#3a2c1f" stroke="#0b0806" stroke-width="3"/>
  <rect x="1008" y="66" width="16" height="22" fill="#ffd79a"/>
  <path d="M1110 0 V260" stroke="#0f0b08" stroke-width="40"/>
</svg>`;

      /* ================= 3. the candle ================= */
      function candleScene(box) {
        box.classList.add('lo-candle-scene');
        const offs = [];
        LT.music.param('night', 0.35);
        const cv = el('canvas', { class: 'lo-candle', 'aria-hidden': 'true' });
        const say = el('div', { class: 'lo-candle-text' },
          el('p', { class: 'lo-thanks' }, 'Thank you for coming to the table.'),
          el('p', { class: 'lo-small' }, 'The candle from the beginning has burned down a long way. It’s late. Somebody has to do it.'));
        const hold = el('button', { class: 'lt-btn hold-btn', type: 'button' }, el('span', { class: 'fill', 'aria-hidden': 'true' }), el('span', { class: 'lbl' }, 'Hold to blow out the candle'));
        box.append(el('div', { class: 'lo-candle-wrap' }, cv), say, hold);
        const W = LT.world, in3d = !!W.ok;
        let candle;
        if (in3d) {
          // back at the real table: the night is nearly over, every candle has burned down
          box.classList.add('in3d');
          root.classList.add('lo-world');
          W.aftermath(true); W.setCandles(1); W.hero.burn(0.62); W.hero.light();
          W.shot('above', { dur: 0 });
          W.mood({ dim: 0.72, soft: 0, cursor: 0.08, moon: 0.3, instant: true });
          W.show(true, { dur: 1.6 });
          W.shot('finale', { dur: U.reducedMotion ? 0.4 : 7, ease: 'inOutSine', lift: 0.05 });
          LT.light.set({ darkness: 0.16, radius: 1000 });
          candle = { blow: (v) => W.hero.blow(v), out: () => W.hero.out(), destroy() {} };
          offs.push(() => { root.classList.remove('lo-world'); W.show(false, { dur: 0.6 }); });
        } else {
          candle = LT.candle(cv, { lit: true, burn: 0.62, blowDir: -1 });
          offs.push(() => candle.destroy());
          LT.light.set({ darkness: 0.8, radius: 460 });
          LT.light.follow(false);
          const keepLit = () => { const p = candle.flamePos(); LT.light.moveTo(p.x, p.y + 120); };
          api.timeout(keepLit, 100);
          const onRs = () => keepLit();
          addEventListener('resize', onRs); offs.push(() => removeEventListener('resize', onRs));
          offs.push(() => LT.light.follow(true));
        }

        // a breath you can hold
        let pressing = false, strength = 0, done = false, breath = null;
        const A = LT.audio;
        function breathStart() {
          if (!A.ready || breath) return;
          const ctx = A.ctx, src = ctx.createBufferSource(); src.buffer = A.buf.pink; src.loop = true;
          const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.6;
          const g = ctx.createGain(); g.gain.value = 0.0001;
          src.connect(bp); bp.connect(g); g.connect(A.sfxBus); src.start();
          breath = { src, g, bp };
        }
        function breathStop() { if (!breath) return; const b = breath; breath = null; const t = A.ctx.currentTime; b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(b.g.gain.value, t); b.g.gain.linearRampToValueAtTime(0.0001, t + 0.25); setTimeout(() => { try { b.src.stop(); } catch (e) {} }, 300); }
        offs.push(breathStop);
        const down = (e) => { if (done) return; if (e && e.preventDefault) e.preventDefault(); pressing = true; breathStart(); };
        const up = () => { pressing = false; };
        hold.addEventListener('pointerdown', down);
        hold.addEventListener('pointerup', up);
        hold.addEventListener('pointerleave', up);
        hold.addEventListener('pointercancel', up);
        hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
        hold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') up(); });
        hold.addEventListener('contextmenu', (e) => e.preventDefault());
        const fill = hold.querySelector('.fill');
        offs.push(LT.loop.add((dt, _t, raw) => {
          if (done) return;
          strength = U.clamp(strength + (pressing ? raw / 1.7 : -raw / 0.6), 0, 1);
          candle.blow(strength * 0.95);
          fill.style.transform = `scaleX(${strength})`;
          if (breath) {
            const t = A.ctx.currentTime;
            breath.g.gain.setTargetAtTime(0.02 + strength * 0.4, t, 0.05);
            breath.bp.frequency.setTargetAtTime(500 + strength * 700, t, 0.08);
            if (!pressing && strength <= 0.01) breathStop();
          }
          if (strength >= 1) blowOut();
        }));

        async function blowOut() {
          done = true;
          breathStop();
          candle.out();
          LT.audio.sfx('snuff');
          LT.music.stop(3.5);
          hold.remove();
          say.style.opacity = 0;
          if (in3d) {
            // your breath travels the length of the table
            await api.wait(500);
            W.shot('reveal', { dur: U.reducedMotion ? 0.4 : 7.5, ease: 'inOutSine', lift: 0.25 });
            W.mood({ cursor: 0, moon: 0.25 });
            LT.audio.sfx('blow', { dur: 2.4, g: 0.12 });
            await W.extinguish({ gap: 0.075 });
            await api.wait(800);
            W.mood({ dim: 0, moon: 0 });
            LT.light.set({ darkness: 0.6, radius: 0 });
            await api.wait(1800);
            finale();
            return;
          }
          LT.light.follow(false);
          LT.light.set({ darkness: 1, radius: 0 });
          await api.wait(2600);
          finale();
        }

        function finale() {
          // Lines that need to read in the dark live above the darkness layer.
          const layer = el('div', { class: 'lo-finale', role: 'region', 'aria-label': 'Closing credits' });
          document.getElementById('app').appendChild(layer);
          offs.push(() => layer.remove());
          const line = (text, cls, delay) => {
            const p = el('p', { class: 'lo-fin ' + (cls || '') }, text);
            p.style.animationDelay = delay + 's';
            return p;
          };
          const who = LT.state.letterTo;
          const first = el('div', { class: 'lo-fin-block' },
            line('Now go find your people.', 'big', 0.2),
            line(who ? `Or call them. Start with ${who}.` : 'Or call them.', '', 2.6),
            line('Tell one of them one specific thing.', '', 4.6));
          layer.appendChild(first);
          api.timeout(() => {
            first.classList.add('gone');
            api.timeout(() => { first.remove(); credits(layer); }, 1200);
          }, U.reducedMotion ? 2500 : 8200);
        }

        function credits(layer) {
          LT.light.set({ darkness: 0.9, radius: 0 });
          LT.music.play('leftovers', 4);
          LT.music.param('night', 0.15);
          const found = Object.keys(LT.state.eggs || {}).length, total = (LT.eggCatalog || []).length;
          const roll = el('div', { class: 'lo-credits' },
            U.html('<p class="lt-eyebrow">That was</p>'),
            U.html('<h2 class="lt-display">The Long <i>Table</i></h2>'),
            el('p', { class: 'lo-small' }, 'Thanksgiving, in five courses. Made on Thanksgiving Day, 2026.'),
            el('p', { class: 'lo-small' }, 'Every sound you heard was synthesized in your browser, note by note. Every picture was drawn in code. No turkeys were harmed. Several were pardoned.'),
            found ? el('p', { class: 'lo-small' }, `You found ${found} of ${Math.max(found, total)} secrets.`) : null,
            el('div', { class: 'lo-sources' },
              el('p', { class: 'lt-eyebrow' }, 'Sources and further reading'),
              el('ul', null, ...[
                'Edward Winslow’s letter of December 1621, printed in Mourt’s Relation (1622)',
                'William Bradford, Of Plymouth Plantation',
                'Plimoth Patuxet Museums; the Wampanoag Homesite',
                'The National Museum of the American Indian, on the Haudenosaunee Thanksgiving Address',
                'Wamsutta Frank James, the suppressed 1970 speech, and the National Day of Mourning',
                'George Washington, Thanksgiving Proclamation (1789); Abraham Lincoln, Proclamation of Thanksgiving (1863)',
                'Sarah Josepha Hale’s editorials in Godey’s Lady’s Book',
                'Benjamin Franklin to Sarah Bache, January 26, 1784',
                'Amelia Simmons, American Cookery (1796)',
                'Emmons & McCullough (2003); Seligman, Steen, Park & Peterson (2005); Kumar & Epley (2018)',
                'A.J. Jacobs, Thanks a Thousand (2018)',
              ].map((s) => el('li', null, s)))),
            el('p', { class: 'lt-script lo-ps' }, 'P.S. Grandma says take a plate.'),
            el('div', { class: 'lo-end-btns' },
              el('button', { class: 'lt-btn', type: 'button', on: { click: () => { LT.audio.sfx('match'); LT.go('prelude', { transition: 'smoke' }); } } }, 'Light the candle again'),
              el('button', { class: 'lt-btn lt-btn--ghost', type: 'button', on: { click: () => LT.go('menu') } }, 'Back to the bill of fare')));
          layer.appendChild(roll);
          layer.classList.add('rolling');
          LT.fx.embers(1);
        }
        return () => offs.forEach((f) => f());
      }
    },
  });
})();
