/* III. The Table — survive dinner with the family. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el, S = U.svg;
  const INK = '#1c130c';
  const DURATION = 80;          // seconds of dinner, 6:00 to 7:30 PM
  const T_START = 40, T_DONE = 165;

  /* =========================================================
     The script. Every landmine: who says it, what you say back,
     and what happens if the fuse burns down.
     ========================================================= */
  const LANDMINES = [
    // Aunt Linda
    { who: 'linda', say: 'So... are you seeing anyone?', you: "I'm seeing this pie.", boom: "Linda has set you up with her dentist's nephew. He's a Scorpio.", bingo: 0 },
    { who: 'linda', say: 'You look thin. Are you eating?', you: 'Eating right now. Watch me.', boom: 'Linda has put four more rolls on your plate.' },
    { who: 'linda', say: 'Tyler, honey, when are you two getting married?', you: 'Linda! Have you tried the cranberry?', boom: 'Skye went to the bathroom. It has been twenty minutes.', also: 'skye' },
    { who: 'linda', say: "Did you hear Barbara's son got divorced?", you: 'Wow, this stuffing!', boom: "You now know everything about Barbara's son. Everything." },
    { who: 'linda', say: 'Who wants to hear about my colonoscopy?', you: 'Pass the potatoes!', boom: 'Everyone heard about the colonoscopy.' },
    // Uncle Dale
    { who: 'dale', say: "Now, I'm not trying to start anything, but...", you: 'Dale! More turkey?', boom: 'Dale has started something.', bingo: 1, also: 'tyler' },
    { who: 'dale', say: "You know what's wrong with this country?", you: 'The gravy shortage. Pass it?', boom: "Everyone now knows what's wrong with this country. Again.", bingo: 1 },
    { who: 'dale', say: 'Fried turkey is just objectively better.', you: "Mom's turkey is perfect.", boom: 'Mom heard that.', also: 'mom' },
    { who: 'dale', say: 'So what is it you actually DO for work?', you: "I'll explain after pie.", boom: 'You explained your job for nine minutes. Nobody understood.' },
    { who: 'dale', say: 'Back in my day, phones were attached to the wall.', you: 'And the rolls were this good? Pass them.', boom: 'Maya rolled her eyes so hard she saw her own brain.', also: 'maya' },
    // Cousin Tyler
    { who: 'tyler', say: 'Have you guys tried cold plunging? Life-changing.', you: 'Is that why the gravy is cold? Kidding. Pass it.', boom: 'Tyler is describing his morning routine. It starts at 4 a.m.' },
    { who: 'tyler', say: 'So my startup is basically Uber, but for leftovers.', you: 'Speaking of leftovers. More potatoes?', boom: 'Dale invested. Linda is crying.', bingo: 6, also: 'linda' },
    { who: 'tyler', say: 'Have you thought about crypto? Like, really thought?', you: 'Never once. Rolls?', boom: 'Tyler is drawing a blockchain on a napkin. Dad is nodding like he gets it.', bingo: 6 },
    { who: 'tyler', say: "I don't really do carbs anymore.", you: 'More stuffing for me, then.', boom: 'Grandma heard. Grandma is offended on behalf of bread.', also: 'grandma' },
    // Skye
    { who: 'skye', say: 'This tofurkey is... really something!', you: "It's great, Skye. Seconds?", boom: "Dale asked what's in tofurkey. Skye told him. Dale needs a minute.", also: 'dale' },
    { who: 'skye', say: 'Tyler said this would be low-key?', you: 'This IS low-key. Potatoes?', boom: 'Skye is texting their therapist under the table.' },
    { who: 'skye', say: 'Is there... meat in the green beans?', you: 'Only emotionally. Here, have a roll.', boom: 'There was bacon. There is always bacon.' },
    { who: 'skye', say: 'So how did everyone in the family meet?', you: "Let's save that for dessert!", boom: 'Linda is telling the whole story. Both versions.', also: 'linda' },
    // Mom
    { who: 'mom', say: 'Does everyone have what they need?', you: "We're good, Mom. Sit down!", boom: 'Mom has gotten up four more times.' },
    { who: 'mom', say: 'Did anyone take the rolls out of the oven?', you: "I'll check on them!", boom: 'Nobody took the rolls out of the oven.', then: 'alarm' },
    { who: 'mom', say: 'Is the turkey dry? Be honest.', you: "It's perfect, Mom.", boom: 'Someone was honest. Mom is in the kitchen now.', bingo: 7 },
    { who: 'mom', say: 'Nobody touch the pie until after.', you: 'We would never.', boom: 'Benji has touched the pie.', also: 'benji' },
    // Dad
    { who: 'dad', say: 'Now, the secret to carving is respecting the grain...', you: 'Fascinating! Pass a slice?', boom: 'Dad is still carving. Dad will always be carving.' },
    { who: 'dad', say: "Why'd the turkey join the band? It had the drumsticks.", you: 'Wow. Gravy?', boom: 'Dad told four more. They got worse.' },
    { who: 'dad', say: "Who's ready for the game? Lions are up.", you: 'After pie, Dad.', boom: 'The TV is on now. Loudly.' },
    { who: 'dad', say: "Has anyone tried my cranberry chutney? My mother's recipe.", you: "Pass it down, I'll try it!", boom: 'Nobody tried the chutney. Dad is fine. Dad is totally fine.' },
    // Maya
    { who: 'maya', say: 'can i be excused', you: 'One more bite, Maya.', boom: 'Maya has been excused. Spiritually.' },
    { who: 'maya', say: 'why is everyone yelling', you: "It's called family. Rolls?", boom: 'Maya is livestreaming this.', bingo: 5 },
    { who: 'maya', say: "grandma you're on my story lol", you: 'Put it away, pie soon!', boom: 'Grandma has 40,000 views.', bingo: 5, also: 'grandma' },
    { who: 'maya', say: 'ok.', you: '...Pass the potatoes?', boom: "Maya said 'ok' in a way that changed the temperature of the room." },
    // Benji
    { who: 'benji', say: "Did you know T. rex couldn't clap?", you: "Wow! It couldn't pass potatoes either.", boom: 'Benji is demonstrating. Loudly. Near the gravy.' },
    { who: 'benji', say: "I'm a velociraptor now.", you: 'Raptors eat their peas.', boom: 'Benji is under the table. With the dog.' },
    { who: 'benji', say: 'Uncle Dale said a bad word!', you: 'Benji, tell us about stegosaurus!', boom: 'Benji is repeating the bad word. With feeling.', also: 'dale' },
    { who: 'benji', say: 'Why is the turkey naked?', you: 'Great question for Dad. Gravy?', boom: 'Dad is answering. In detail.', also: 'dad' },
    // Grandma
    { who: 'grandma', say: "Denise, the turkey's a little dry.", you: 'Gravy fixes everything, Grandma!', boom: "Mom went to the kitchen to 'check on something.'", bingo: 7, also: 'mom' },
    { who: 'grandma', say: "Who's the new one?", you: 'Grandma, this is Skye! Skye, Grandma.', boom: 'Grandma asked Skye what their parents do. Then their grandparents.', also: 'skye' },
    { who: 'grandma', say: "When I'm gone, you can all fight over the china.", you: "You'll outlive us all, Ruth.", boom: 'Everyone is now fighting over the china.' },
    { who: 'grandma', say: 'In my day, we were grateful for one potato.', you: 'And now there is a whole bowl! Pass it?', boom: 'Grandma is describing the potato. It was small.' },
    { who: 'grandma', say: 'WHAT? Speak up!', you: 'MORE POTATOES, GRANDMA?', boom: 'Grandma heard that one. Grandma hears everything.' },
    { who: 'grandma', say: 'Is THAT what you’re wearing?', you: "Thanks, Grandma. It's new!", boom: 'Grandma described what she wore in 1962. It was better.' },
  ];
  const REACT = {
    linda: ['Ooh, potatoes!', 'Well, aren’t you sweet.', 'Oh! Yes, please.'],
    dale: ['...Yeah, alright.', 'Now THAT’s a turkey.', 'Fair enough.'],
    tyler: ['Bro. Yes.', 'Love that energy.', 'Okay, carb day.'],
    skye: ['Oh, thank god.', 'Yes! Thank you!', 'You’re my favorite.'],
    mom: ['Okay. Okay. Good.', 'I’m sitting! I’m sitting.', 'There’s more in the kitchen.'],
    dad: ['A person of culture.', 'Ha! Fair.', 'That’s what I’m saying.'],
    maya: ['fine.', 'k', '...thanks'],
    benji: ['RAWR.', 'Okay!', 'Can I have pie?'],
    grandma: ['Hmph.', 'That’s better.', 'Good. Pass the rolls.'],
  };
  const CHAOS_LINES = ["IT'S NOT DRY!", 'BISCUIT, NO!', 'Is that SMOKE?', "I'm JUST saying—", 'WHO TOUCHED THE PIE?', 'lol', 'BENJI!', "It's called a BLOCKCHAIN—", 'Can I be EXCUSED?', 'Pass the— PASS THE—', 'This is fine.', 'WHAT?', 'MY GOOD TABLECLOTH!', 'RAWR!'];
  const BINGO = ['“Are you seeing anyone?”', 'Politics', 'Dog gets fed', 'Smoke alarm', 'Mom never sits down', 'Phone at the table', 'Crypto comes up', '“A little dry”', 'Something spills'];
  const VOICE = { grandma: 330, dale: 118, linda: 285, mom: 250, dad: 150, tyler: 182, skye: 222, maya: 268, benji: 420, you: 205 };

  /* =========================================================
     Two compositions: wide (one long table) and tall (the long
     table never fits, so it wraps onto the folding table).
     ========================================================= */
  const WIDE = {
    vb: [0, 0, 1600, 1000], rail: 470, floor: 772,
    door: { x: -40, y: 150, w: 150, h: 622 },
    painting: { x: 300, y: 112, w: 200, h: 160 },
    clock: { x: 660, y: 170, r: 44 },
    lamp: { x: 800, y: 112 },
    window: { x: 1190, y: 104, w: 230, h: 250 },
    alarm: { x: 1045, y: 196 },
    garland: { x1: 210, x2: 1130, y: 40, sag: 44, text: 'GIVE THANKS' },
    bands: [
      { tables: [{ id: 'main', x1: 110, x2: 1330, top: 548, front: 600, drop: 772, cloth: 'linen' }, { id: 'ext', x1: 1330, x2: 1540, top: 562, front: 614, drop: 772, cloth: 'check' }],
        seats: [{ id: 'mom', x: 200, t: 'main', stand: true }, { id: 'tyler', x: 345, t: 'main' }, { id: 'skye', x: 490, t: 'main' }, { id: 'dad', x: 640, t: 'main' }, { id: 'grandma', x: 805, t: 'main' }, { id: 'joe', x: 965, t: 'main' }, { id: 'linda', x: 1120, t: 'main' }, { id: 'dale', x: 1430, t: 'ext' }],
        dishes: [{ k: 'rolls', x: 272, t: 'main' }, { k: 'casserole', x: 418, t: 'main' }, { k: 'cranberry', x: 565, t: 'main' }, { k: 'turkey', x: 722, t: 'main' }, { k: 'candle', x: 885, t: 'main' }, { k: 'potatoes', x: 1042, t: 'main' }, { k: 'gravy', x: 1228, t: 'main' }, { k: 'candle', x: 1300, t: 'main' }] },
      { tables: [{ id: 'kids', x1: 460, x2: 1140, top: 866, front: 902, drop: 1400, cloth: 'paper' }],
        seats: [{ id: 'maya', x: 610, t: 'kids', s: 1.14 }, { id: 'benji', x: 990, t: 'kids', s: 1.14, booster: true }],
        dishes: [{ k: 'you', x: 800, t: 'kids' }] },
    ],
    dog: { x: 1250, y: 1010, s: 1.3 },
  };
  const TALL = {
    vb: [0, 0, 900, 1500], rail: 440, floor: 1160,
    door: { x: -70, y: 160, w: 120, h: 1000 },
    painting: { x: 80, y: 130, w: 150, h: 120 },
    clock: { x: 320, y: 176, r: 38 },
    lamp: { x: 470, y: 96 },
    window: { x: 620, y: 100, w: 200, h: 210 },
    alarm: { x: 560, y: 236 },
    garland: { x1: 60, x2: 840, y: 34, sag: 34, text: 'GIVE THANKS' },
    bands: [
      { tables: [{ id: 'a', x1: 40, x2: 860, top: 560, front: 604, drop: 790, cloth: 'linen' }],
        seats: [{ id: 'linda', x: 145, t: 'a', s: 0.86 }, { id: 'grandma', x: 345, t: 'a', s: 0.86 }, { id: 'joe', x: 545, t: 'a', s: 0.86 }, { id: 'dale', x: 750, t: 'a', s: 0.86 }],
        dishes: [{ k: 'rolls', x: 245, t: 'a', s: 0.86 }, { k: 'candle', x: 445, t: 'a', s: 0.86 }, { k: 'gravy', x: 648, t: 'a', s: 0.86 }] },
      { tables: [{ id: 'b', x1: 20, x2: 880, top: 930, front: 978, drop: 1160, cloth: 'check' }],
        seats: [{ id: 'mom', x: 100, t: 'b', stand: true }, { id: 'tyler', x: 290, t: 'b' }, { id: 'skye', x: 470, t: 'b' }, { id: 'dad', x: 690, t: 'b' }],
        dishes: [{ k: 'casserole', x: 195, t: 'b' }, { k: 'cranberry', x: 380, t: 'b' }, { k: 'turkey', x: 575, t: 'b' }, { k: 'potatoes', x: 812, t: 'b' }] },
      { tables: [{ id: 'kids', x1: 90, x2: 810, top: 1302, front: 1340, drop: 1800, cloth: 'paper' }],
        seats: [{ id: 'maya', x: 225, t: 'kids', s: 1.12 }, { id: 'benji', x: 670, t: 'kids', s: 1.12, booster: true }],
        dishes: [{ k: 'you', x: 450, t: 'kids' }] },
    ],
    dog: { x: 820, y: 1512, s: 1.15 },
  };

  /* =========================================================
     Drawing
     ========================================================= */
  function defs() {
    return S('defs', null,
      S('pattern', { id: 'tb-wall', width: 56, height: 56, patternUnits: 'userSpaceOnUse' },
        S('rect', { width: 56, height: 56, fill: '#a77c4c' }),
        S('rect', { x: 0, width: 8, height: 56, fill: '#9a7044' }),
        S('rect', { x: 28, width: 2, height: 56, fill: '#b48a58' }),
        S('path', { d: 'M42 20 l5 8 -5 8 -5 -8z', fill: '#8f6640' })),
      S('pattern', { id: 'tb-floor', width: 240, height: 44, patternUnits: 'userSpaceOnUse' },
        S('rect', { width: 240, height: 44, fill: '#4a2d1a' }),
        S('path', { d: 'M0 43.5H240M90 0V44M200 0V22M30 22V44', stroke: '#2e1b0f', 'stroke-width': 2 }),
        S('path', { d: 'M0 22H240', stroke: '#3a2314', 'stroke-width': 1.5 })),
      S('pattern', { id: 'tb-linen', width: 76, height: 20, patternUnits: 'userSpaceOnUse' },
        S('rect', { width: 76, height: 20, fill: '#ebe1ca' }),
        S('rect', { x: 34, width: 30, height: 20, fill: 'rgba(80,50,20,.07)' }),
        S('rect', { x: 64, width: 6, height: 20, fill: 'rgba(80,50,20,.1)' })),
      S('pattern', { id: 'tb-check', width: 30, height: 30, patternUnits: 'userSpaceOnUse' },
        S('rect', { width: 30, height: 30, fill: '#f1e0bd' }),
        S('rect', { width: 15, height: 30, fill: 'rgba(214,110,40,.45)' }),
        S('rect', { width: 30, height: 15, fill: 'rgba(214,110,40,.45)' })),
      S('linearGradient', { id: 'tb-night', x1: 0, x2: 0, y1: 0, y2: 1 }, S('stop', { offset: 0, 'stop-color': '#0c1424' }), S('stop', { offset: 1, 'stop-color': '#22304a' })),
      S('radialGradient', { id: 'tb-kitchen', cx: 0.5, cy: 0.35, r: 0.8 }, S('stop', { offset: 0, 'stop-color': '#ffe0a0' }), S('stop', { offset: 1, 'stop-color': '#c78a3c' })),
      S('radialGradient', { id: 'tb-bulb', cx: 0.5, cy: 0.5, r: 0.5 }, S('stop', { offset: 0, 'stop-color': '#fff8d8', 'stop-opacity': 1 }), S('stop', { offset: 0.3, 'stop-color': '#ffe9a8', 'stop-opacity': 0.55 }), S('stop', { offset: 1, 'stop-color': '#ffd070', 'stop-opacity': 0 })),
      S('radialGradient', { id: 'tb-fglow', cx: 0.5, cy: 0.5, r: 0.5 }, S('stop', { offset: 0, 'stop-color': '#ffb050', 'stop-opacity': 0.9 }), S('stop', { offset: 1, 'stop-color': '#ff7020', 'stop-opacity': 0 })),
      S('radialGradient', { id: 'tb-candle', cx: 0.5, cy: 0.5, r: 0.5 }, S('stop', { offset: 0, 'stop-color': '#ffd890', 'stop-opacity': 0.7 }), S('stop', { offset: 1, 'stop-color': '#ff9a40', 'stop-opacity': 0 })),
      S('linearGradient', { id: 'tb-pewter', x1: 0, x2: 1 }, S('stop', { offset: 0, 'stop-color': '#4a4c48' }), S('stop', { offset: 0.45, 'stop-color': '#cfd1c8' }), S('stop', { offset: 1, 'stop-color': '#3a3c38' })),
      S('linearGradient', { id: 'tb-gold', x1: 0, x2: 1, y1: 0, y2: 1 }, S('stop', { offset: 0, 'stop-color': '#f2c14e' }), S('stop', { offset: 0.5, 'stop-color': '#9a6c1e' }), S('stop', { offset: 1, 'stop-color': '#e0a83e' })),
    );
  }
  const st = { stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const st2 = { stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const at = (x, y, s, ...kids) => S('g', { transform: `translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}` }, ...kids);

  function room(L, refs) {
    const g = S('g', { class: 'tb-room' });
    const W = L.vb[2];
    g.appendChild(S('rect', { x: -1600, y: -1600, width: W + 3200, height: L.rail + 1600, fill: 'url(#tb-wall)' }));
    g.appendChild(S('rect', { x: -1600, y: L.rail, width: W + 3200, height: L.floor - L.rail, fill: '#5b3822' }));
    g.appendChild(S('rect', { x: -1600, y: L.rail - 10, width: W + 3200, height: 14, fill: '#6e4528', stroke: INK, 'stroke-width': 2 }));
    for (let x = -1600; x < W + 1600; x += 170) g.appendChild(S('rect', { x: x + 20, y: L.rail + 30, width: 130, height: Math.max(40, L.floor - L.rail - 70), fill: 'none', stroke: 'rgba(20,10,5,.35)', 'stroke-width': 3 }));
    g.appendChild(S('rect', { x: -1600, y: L.floor, width: W + 3200, height: 2400, fill: 'url(#tb-floor)' }));
    g.appendChild(S('rect', { x: -1600, y: L.floor - 6, width: W + 3200, height: 12, fill: '#2b1a0f' }));
    // kitchen doorway (warm light spills out)
    const d = L.door;
    g.appendChild(S('rect', { x: d.x - 14, y: d.y - 14, width: d.w + 28, height: d.h + 14, fill: '#3f2614', stroke: INK, 'stroke-width': 3 }));
    g.appendChild(S('rect', { x: d.x, y: d.y, width: d.w, height: d.h, fill: 'url(#tb-kitchen)' }));
    g.appendChild(S('rect', { x: d.x + 10, y: d.y + 60, width: d.w - 20, height: 70, fill: 'rgba(120,70,20,.35)' }));
    refs.door = { x: d.x + d.w / 2, y: d.y + 90 };
    // a little Dutch still life on the wall (of course)
    const p = L.painting;
    g.appendChild(S('rect', { x: p.x - 12, y: p.y - 12, width: p.w + 24, height: p.h + 24, fill: 'url(#tb-gold)', stroke: INK, 'stroke-width': 3 }));
    g.appendChild(S('rect', { x: p.x, y: p.y, width: p.w, height: p.h, fill: '#1b1610' }));
    g.appendChild(S('ellipse', { cx: p.x + p.w * 0.5, cy: p.y + p.h * 0.82, rx: p.w * 0.36, ry: p.h * 0.06, fill: '#7d7c74' }));
    g.appendChild(S('ellipse', { cx: p.x + p.w * 0.36, cy: p.y + p.h * 0.72, rx: p.w * 0.12, ry: p.h * 0.1, fill: '#e8b93a' }));
    g.appendChild(S('path', { d: `M${p.x + p.w * 0.6} ${p.y + p.h * 0.78} l0 -${p.h * 0.18} c-${p.w * 0.07} -${p.h * 0.05} -${p.w * 0.07} -${p.h * 0.32} 0 -${p.h * 0.36} c${p.w * 0.07} ${p.h * 0.04} ${p.w * 0.07} ${p.h * 0.31} 0 ${p.h * 0.36}`, fill: 'rgba(170,190,150,.35)', stroke: 'rgba(220,230,200,.5)', 'stroke-width': 2 }));
    g.appendChild(S('path', { d: `M${p.x + p.w * 0.2} ${p.y + p.h * 0.8} q${p.w * 0.1} -${p.h * 0.25} ${p.w * 0.24} -${p.h * 0.02}`, stroke: '#c9a04a', 'stroke-width': 3, fill: 'none' }));
    // the wall clock (it keeps dinner time)
    const c = L.clock;
    g.appendChild(S('circle', { cx: c.x, cy: c.y, r: c.r + 8, fill: '#5a351c', stroke: INK, 'stroke-width': 3 }));
    g.appendChild(S('circle', { cx: c.x, cy: c.y, r: c.r, fill: '#f1e8d2', stroke: INK, 'stroke-width': 2 }));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.appendChild(S('line', { x1: c.x + Math.sin(a) * c.r * 0.78, y1: c.y - Math.cos(a) * c.r * 0.78, x2: c.x + Math.sin(a) * c.r * 0.92, y2: c.y - Math.cos(a) * c.r * 0.92, stroke: INK, 'stroke-width': i % 3 ? 2 : 4 })); }
    refs.hourHand = S('line', { x1: c.x, y1: c.y, x2: c.x, y2: c.y - c.r * 0.5, stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' });
    refs.minHand = S('line', { x1: c.x, y1: c.y, x2: c.x, y2: c.y - c.r * 0.8, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' });
    refs.clock = c;
    g.append(refs.hourHand, refs.minHand, S('circle', { cx: c.x, cy: c.y, r: 4, fill: '#b8243d' }));
    // the window, and Dale's turkey fryer out in the yard
    const w = L.window;
    g.appendChild(S('rect', { x: w.x - 10, y: w.y - 10, width: w.w + 20, height: w.h + 20, fill: '#efe6d2', stroke: INK, 'stroke-width': 3 }));
    g.appendChild(S('rect', { x: w.x, y: w.y, width: w.w, height: w.h, fill: 'url(#tb-night)' }));
    const rnd = U.seeded(7);
    for (let i = 0; i < 14; i++) g.appendChild(S('circle', { cx: w.x + rnd() * w.w, cy: w.y + rnd() * w.h * 0.6, r: 0.8 + rnd() * 1.4, fill: '#fff8e0', opacity: 0.4 + rnd() * 0.6 }));
    g.appendChild(S('circle', { cx: w.x + w.w * 0.78, cy: w.y + w.h * 0.2, r: 13, fill: '#f6ecd0' }));
    g.appendChild(S('rect', { x: w.x, y: w.y + w.h * 0.82, width: w.w, height: w.h * 0.18, fill: '#101810' }));
    const fx = w.x + w.w * 0.42, fy = w.y + w.h * 0.86;
    refs.fryerGlow = S('ellipse', { cx: fx, cy: fy - 18, rx: 46, ry: 34, fill: 'url(#tb-fglow)', class: 'tb-fryer-glow' });
    refs.fryerFire = S('path', { d: `M${fx - 30} ${fy - 30} C${fx - 40} ${fy - 80} ${fx - 10} ${fy - 70} ${fx} ${fy - 120} C${fx + 12} ${fy - 70} ${fx + 44} ${fy - 84} ${fx + 30} ${fy - 30} Z`, fill: '#ffb03a', opacity: 0, class: 'tb-fryer-fire' });
    g.append(refs.fryerGlow, refs.fryerFire,
      S('rect', { x: fx - 18, y: fy - 34, width: 36, height: 26, rx: 3, fill: '#2a2a2a' }),
      S('path', { d: `M${fx - 16} ${fy - 8}l-8 18M${fx + 16} ${fy - 8}l8 18M${fx} ${fy - 8}v18`, stroke: '#2a2a2a', 'stroke-width': 3 }),
      S('rect', { x: fx + 30, y: fy - 22, width: 16, height: 26, rx: 7, fill: '#d8d8d0' }));
    refs.fryer = { x: fx, y: fy - 40 };
    g.appendChild(S('path', { d: `M${w.x + w.w / 2} ${w.y}V${w.y + w.h}M${w.x} ${w.y + w.h * 0.5}H${w.x + w.w}`, stroke: '#efe6d2', 'stroke-width': 8 }));
    g.appendChild(S('path', { d: `M${w.x - 26} ${w.y - 20} C${w.x + 10} ${w.y + 60} ${w.x - 10} ${w.y + 160} ${w.x + 6} ${w.y + w.h + 30} L${w.x - 34} ${w.y + w.h + 30} Z`, fill: '#7d1a2c', stroke: INK, 'stroke-width': 2.5 }));
    g.appendChild(S('path', { d: `M${w.x + w.w + 26} ${w.y - 20} C${w.x + w.w - 10} ${w.y + 60} ${w.x + w.w + 10} ${w.y + 160} ${w.x + w.w - 6} ${w.y + w.h + 30} L${w.x + w.w + 34} ${w.y + w.h + 30} Z`, fill: '#7d1a2c', stroke: INK, 'stroke-width': 2.5 }));
    g.appendChild(S('rect', { x: w.x - 40, y: w.y - 26, width: w.w + 80, height: 10, rx: 5, fill: '#3a2414' }));
    // the garland (one letter fell off years ago; nobody fixed it)
    const gl = L.garland, letters = gl.text.split('');
    const path = `M${gl.x1} ${gl.y} Q${(gl.x1 + gl.x2) / 2} ${gl.y + gl.sag * 2} ${gl.x2} ${gl.y}`;
    g.appendChild(S('path', { d: path, stroke: '#3a2414', 'stroke-width': 2.5, fill: 'none' }));
    const n = letters.length;
    letters.forEach((ch, i) => {
      if (ch === ' ' || i === 9) return; // the K is long gone
      const t = (i + 0.5) / n, x = gl.x1 + (gl.x2 - gl.x1) * t;
      const y = gl.y + gl.sag * 2 * 2 * t * (1 - t);
      const col = ['#7d1a2c', '#c98a3a', '#646a3a'][i % 3];
      const sz = (gl.x2 - gl.x1) / n * 0.42;
      g.appendChild(S('g', { transform: `translate(${x},${y}) rotate(${(t - 0.5) * 22})` },
        S('path', { d: `M${-sz} 0 L${sz} 0 L0 ${sz * 2.1} Z`, fill: col, stroke: INK, 'stroke-width': 2 }),
        S('text', { x: 0, y: sz * 0.95, 'text-anchor': 'middle', 'font-family': 'IM Fell English SC, Georgia, serif', 'font-size': sz * 0.95, fill: '#f1e8d2' }, ch)));
    });
    // smoke alarm on the wall by the kitchen... no, by the window. Nobody knows why.
    const a = L.alarm;
    refs.alarmLed = S('circle', { cx: a.x + 6, cy: a.y - 2, r: 3.5, fill: '#5a1a12', class: 'tb-led' });
    g.append(S('circle', { cx: a.x, cy: a.y, r: 17, fill: '#f6f3ea', stroke: INK, 'stroke-width': 2.5 }), S('circle', { cx: a.x, cy: a.y, r: 10, fill: 'none', stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1.5 }), refs.alarmLed);
    refs.alarm = a;
    return g;
  }

  function lamp(L, refs) {
    const g = S('g', { class: 'tb-lamp' });
    const { x, y } = L.lamp;
    g.appendChild(S('line', { x1: x, y1: -1600, x2: x, y2: y, stroke: '#1c130c', 'stroke-width': 3 }));
    refs.cone = S('path', { d: `M${x - 38} ${y + 40} L${x - 900} ${L.vb[3] + 200} L${x + 900} ${L.vb[3] + 200} L${x + 38} ${y + 40}Z`, fill: '#fff2c0', opacity: 0, class: 'tb-cone' });
    refs.bulb = S('circle', { cx: x, cy: y + 44, r: 160, fill: 'url(#tb-bulb)', opacity: 0, class: 'tb-bulb' });
    g.append(refs.cone, S('path', { d: `M${x - 18} ${y} L${x + 18} ${y} L${x + 58} ${y + 44} L${x - 58} ${y + 44} Z`, fill: '#596033', stroke: INK, 'stroke-width': 3 }), S('ellipse', { cx: x, cy: y + 44, rx: 58, ry: 8, fill: '#e9d48a', stroke: INK, 'stroke-width': 2 }), refs.bulb);
    return g;
  }

  function chairBack(x, y, s, full) {
    const g = S('g', { transform: `translate(${x},${y}) scale(${s})` });
    const wood = '#4a2a16';
    g.appendChild(S('rect', { x: -58, y: -178, width: 12, height: 182, rx: 4, fill: wood, ...st2 }));
    g.appendChild(S('rect', { x: 46, y: -178, width: 12, height: 182, rx: 4, fill: wood, ...st2 }));
    g.appendChild(S('path', { d: 'M-62 -176 Q0 -200 62 -176 L62 -156 Q0 -178 -62 -156 Z', fill: '#5a341c', ...st2 }));
    if (full) [-130, -96, -62].forEach((yy) => g.appendChild(S('rect', { x: -48, y: yy, width: 96, height: 9, rx: 3, fill: wood, ...st2 })));
    return g;
  }

  function tableTop(t) {
    const g = S('g', { class: 'tb-table' });
    const cloth = t.cloth === 'linen' ? 'url(#tb-linen)' : t.cloth === 'check' ? 'url(#tb-check)' : '#f7f3ea';
    const topFill = t.cloth === 'linen' ? '#f2ead6' : t.cloth === 'check' ? '#f1dfbb' : '#fbf8f1';
    const d = t.front - t.top;
    g.appendChild(S('path', { d: `M${t.x1 + 10} ${t.top} L${t.x2 - 10} ${t.top} L${t.x2} ${t.front} L${t.x1} ${t.front} Z`, fill: topFill, ...st }));
    if (t.cloth === 'linen') g.appendChild(S('rect', { x: t.x1 + 16, y: t.top + d * 0.32, width: t.x2 - t.x1 - 32, height: d * 0.34, fill: '#7d1a2c', opacity: 0.85 }));
    g.appendChild(S('path', { d: `M${t.x1} ${t.front} L${t.x2} ${t.front} L${t.x2 + 6} ${t.drop} L${t.x1 - 6} ${t.drop} Z`, fill: cloth, ...st }));
    if (t.cloth === 'linen') g.appendChild(S('rect', { x: t.x1 - 4, y: t.drop - 34, width: t.x2 - t.x1 + 8, height: 10, fill: '#7d1a2c', opacity: 0.7 }));
    if (t.cloth === 'paper') {
      // crayons, scribbles, and the hand turkey every kid has drawn
      const cx = t.x1 + 90, cy = t.front + 60;
      const ht = S('g', { transform: `translate(${cx},${cy}) rotate(-8)`, fill: 'none', 'stroke-width': 4, 'stroke-linecap': 'round' });
      [['#d9572b', -34], ['#e8b93a', -14], ['#4c8748', 6], ['#b8243d', 26]].forEach(([col, dx], i) => ht.appendChild(S('path', { d: `M${dx} 0 C${dx - 6} -40 ${dx + 14} -52 ${dx + 14} -14`, stroke: col })));
      ht.appendChild(S('ellipse', { cx: 0, cy: 10, rx: 40, ry: 26, stroke: '#7a4a24' }));
      ht.appendChild(S('path', { d: 'M38 4 C60 -6 64 18 46 22', stroke: '#7a4a24' }));
      ht.appendChild(S('circle', { cx: 50, cy: 6, r: 2.5, fill: INK, stroke: 'none' }));
      ht.appendChild(S('path', { d: 'M58 12 l10 3 -10 3', stroke: '#e8b93a', 'stroke-width': 3 }));
      ht.appendChild(S('path', { d: 'M-20 36 l-4 18 M10 36 l4 18', stroke: '#7a4a24', 'stroke-width': 3 }));
      g.appendChild(ht);
      g.appendChild(S('text', { x: cx + 6, y: cy + 92, 'text-anchor': 'middle', 'font-family': 'Caveat, cursive', 'font-weight': 700, 'font-size': 26, fill: '#d9572b', transform: `rotate(-6 ${cx} ${cy + 92})` }, 'BENJI'));
      g.appendChild(S('path', { d: `M${t.x2 - 170} ${t.front + 40} c20 -18 40 18 60 0 s40 18 60 0`, stroke: '#3a6fb0', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }));
      g.appendChild(S('path', { d: `M${t.x2 - 150} ${t.front + 82} l30 -24 l30 24 l30 -24`, stroke: '#4c8748', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }));
      [['#b8243d', 0], ['#3a6fb0', 18], ['#e8b93a', 36]].forEach(([col, dx]) => g.appendChild(S('rect', { x: t.x2 - 120 + dx, y: t.top + 6, width: 8, height: 26, rx: 2, fill: col, transform: `rotate(${60 + dx} ${t.x2 - 116 + dx} ${t.top + 19})`, stroke: INK, 'stroke-width': 1.2 })));
      g.appendChild(S('text', { x: (t.x1 + t.x2) / 2, y: t.front + 74, 'text-anchor': 'middle', 'font-family': 'IM Fell English SC, Georgia, serif', 'font-size': 20, fill: 'rgba(36,23,14,.45)', 'letter-spacing': 6 }, 'THE KIDS’ TABLE'));
    }
    return g;
  }

  /* ---------- dishes (local coords, sitting on y = 0) ---------- */
  const D = {};
  D.plate = (rx = 34) => S('g', null, S('ellipse', { cx: 0, cy: 0, rx, ry: rx * 0.24, fill: '#f6f1e6', ...st2 }), S('ellipse', { cx: 0, cy: 0, rx: rx * 0.68, ry: rx * 0.15, fill: 'none', stroke: 'rgba(0,0,0,.14)', 'stroke-width': 1.5 }));
  D.glass = (wine = true) => S('g', null,
    S('ellipse', { cx: 0, cy: 0, rx: 10, ry: 3, fill: 'rgba(255,255,255,.35)', stroke: INK, 'stroke-width': 1.6 }),
    S('line', { x1: 0, y1: 0, x2: 0, y2: -24, stroke: INK, 'stroke-width': 2.4 }),
    wine ? S('path', { d: 'M-11 -40 C-10 -30 -6 -25 0 -25 C6 -25 10 -30 11 -40 Z', fill: '#7d1a2c' }) : null,
    S('path', { d: 'M-10 -56 C-13 -36 -8 -25 0 -25 C8 -25 13 -36 10 -56 Z', fill: 'rgba(255,255,255,.14)', stroke: INK, 'stroke-width': 2 }),
    S('path', { d: 'M-6 -52 C-8 -42 -6 -34 -4 -31', stroke: 'rgba(255,255,255,.6)', 'stroke-width': 2, fill: 'none' }));
  D.beer = () => S('g', null, S('rect', { x: -9, y: -30, width: 18, height: 30, rx: 3, fill: '#2f5fa0', ...st2 }), S('rect', { x: -9, y: -21, width: 18, height: 9, fill: '#f1e8d2' }), S('ellipse', { cx: 0, cy: -30, rx: 9, ry: 2.5, fill: '#c8c8c0', stroke: INK, 'stroke-width': 1.5 }));
  D.turkey = (refs) => {
    const g = S('g');
    g.appendChild(S('ellipse', { cx: 0, cy: 0, rx: 96, ry: 18, fill: '#ece5d6', ...st }));
    g.appendChild(S('ellipse', { cx: 0, cy: -2, rx: 80, ry: 12, fill: '#d9d0bd' }));
    [[-78, -4], [-60, 6], [70, 2], [84, -6], [40, 8], [-30, 9]].forEach(([x, y]) => g.appendChild(S('circle', { cx: x, cy: y, r: 7, fill: '#5f8a3a', stroke: INK, 'stroke-width': 1.2 })));
    [[-88, 2], [90, 4]].forEach(([x, y]) => g.appendChild(S('circle', { cx: x, cy: y, r: 7, fill: '#e89a3a', stroke: INK, 'stroke-width': 1.2 })));
    refs.popup = S('rect', { x: -3, y: -94, width: 6, height: 2, fill: '#d8322a', stroke: INK, 'stroke-width': 1.2 });
    refs.popupCap = S('rect', { x: -6, y: -96, width: 12, height: 5, rx: 2, fill: '#d8322a', stroke: INK, 'stroke-width': 1.2 });
    g.append(refs.popup);
    const legL = S('g', null, S('ellipse', { cx: -70, cy: -26, rx: 26, ry: 16, fill: '#a3561f', ...st, transform: 'rotate(-28 -70 -26)' }), S('rect', { x: -102, y: -52, width: 18, height: 8, rx: 3, fill: '#f1e8d2', stroke: INK, 'stroke-width': 1.6, transform: 'rotate(-40 -93 -48)' }), S('path', { d: 'M-106 -58 l4 -6 4 6 4 -6 4 6', stroke: INK, 'stroke-width': 1.5, fill: '#fff', transform: 'rotate(-40 -100 -58)' }));
    g.appendChild(legL);
    g.appendChild(S('path', { d: 'M-72 -6 C-80 -54 -42 -88 0 -88 C42 -88 80 -54 72 -6 C40 4 -40 4 -72 -6 Z', fill: '#b8692c', ...st }));
    g.appendChild(S('path', { d: 'M-50 -40 C-40 -70 -10 -80 14 -78 C-8 -70 -30 -58 -40 -30 Z', fill: '#dc9654', opacity: 0.75 }));
    g.appendChild(S('path', { d: 'M0 -86 C-4 -60 -4 -30 0 -4', stroke: 'rgba(60,25,5,.45)', 'stroke-width': 3, fill: 'none' }));
    const legR = S('g', { class: 'tb-leg' }, S('ellipse', { cx: 70, cy: -26, rx: 26, ry: 16, fill: '#a3561f', ...st, transform: 'rotate(28 70 -26)' }), S('rect', { x: 84, y: -52, width: 18, height: 8, rx: 3, fill: '#f1e8d2', stroke: INK, 'stroke-width': 1.6, transform: 'rotate(40 93 -48)' }), S('path', { d: 'M90 -64 l4 6 4 -6 4 6 4 -6', stroke: INK, 'stroke-width': 1.5, fill: '#fff', transform: 'rotate(40 98 -60)' }));
    refs.legR = legR;
    g.appendChild(legR);
    g.append(refs.popupCap);
    return g;
  };
  D.potatoes = () => S('g', null,
    S('path', { d: 'M-46 -34 C-44 6 44 6 46 -34 Z', fill: '#e4edf2', ...st }),
    S('path', { d: 'M-42 -20 C-30 -14 30 -14 42 -20', stroke: '#4f7aa8', 'stroke-width': 4, fill: 'none' }),
    S('path', { d: 'M-40 -34 C-40 -56 -20 -52 -16 -62 C-8 -74 10 -70 14 -60 C24 -60 40 -54 40 -34 Z', fill: '#fbf6ea', ...st2 }),
    S('rect', { x: -8, y: -70, width: 16, height: 9, rx: 2, fill: '#f7d65a', stroke: INK, 'stroke-width': 1.5, transform: 'rotate(-12)' }),
    S('rect', { x: 26, y: -90, width: 6, height: 52, rx: 3, fill: '#b9bab2', stroke: INK, 'stroke-width': 1.5, transform: 'rotate(24 29 -64)' }));
  D.gravy = (refs) => {
    const boat = S('g', { class: 'tb-gravy' },
      S('path', { d: 'M-36 -10 C-32 -36 24 -36 30 -24 L50 -36 L42 -18 C34 -4 -28 -2 -36 -10 Z', fill: '#f1e8d2', ...st }),
      S('ellipse', { cx: -4, cy: -28, rx: 28, ry: 5, fill: '#6b3f1d' }),
      S('path', { d: 'M-34 -24 C-50 -28 -50 -10 -36 -12', fill: 'none', ...st }));
    refs.gravy = boat;
    return S('g', null, S('ellipse', { cx: 0, cy: 0, rx: 44, ry: 8, fill: '#ece5d6', ...st2 }), boat);
  };
  D.cranberry = () => S('g', null, D.plate(36),
    S('rect', { x: -18, y: -48, width: 36, height: 44, rx: 5, fill: '#8e1428', ...st2 }),
    S('ellipse', { cx: 0, cy: -48, rx: 18, ry: 5, fill: '#b52c46', stroke: INK, 'stroke-width': 1.8 }),
    S('path', { d: 'M-18 -36 Q0 -32 18 -36 M-18 -24 Q0 -20 18 -24 M-18 -13 Q0 -9 18 -13', stroke: 'rgba(40,0,10,.5)', 'stroke-width': 1.6, fill: 'none' }),
    S('rect', { x: -11, y: -44, width: 5, height: 34, rx: 2, fill: 'rgba(255,255,255,.28)' }));
  D.casserole = () => {
    const g = S('g', null,
      S('ellipse', { cx: -54, cy: -18, rx: 8, ry: 5, fill: '#f1ede4', ...st2 }), S('ellipse', { cx: 54, cy: -18, rx: 8, ry: 5, fill: '#f1ede4', ...st2 }),
      S('path', { d: 'M-52 -32 L52 -32 L45 0 L-45 0 Z', fill: '#f1ede4', ...st }),
      S('rect', { x: -48, y: -40, width: 96, height: 12, rx: 6, fill: '#5d7d33', stroke: INK, 'stroke-width': 1.8 }));
    const r = U.seeded(55);
    for (let i = 0; i < 16; i++) g.appendChild(S('ellipse', { cx: -42 + r() * 84, cy: -38 + r() * 6, rx: 4 + r() * 4, ry: 2, fill: '#b9782d', transform: `rotate(${r() * 60 - 30} ${-42 + r() * 84} -36)` }));
    return g;
  };
  D.rolls = () => S('g', null,
    S('path', { d: 'M-44 -28 L44 -28 L36 0 L-36 0 Z', fill: '#a8783f', ...st }),
    S('path', { d: 'M-40 -18 H40 M-38 -9 H38 M-24 -28 V0 M0 -28 V0 M24 -28 V0', stroke: 'rgba(40,20,5,.4)', 'stroke-width': 1.8 }),
    S('path', { d: 'M-46 -30 L-20 -30 L-40 -6 Z', fill: '#b8243d', stroke: INK, 'stroke-width': 1.5 }),
    S('ellipse', { cx: -16, cy: -34, rx: 18, ry: 12, fill: '#d49a4e', ...st2 }), S('ellipse', { cx: 16, cy: -36, rx: 18, ry: 12, fill: '#d9a254', ...st2 }), S('ellipse', { cx: 0, cy: -44, rx: 18, ry: 12, fill: '#dba95c', ...st2 }),
    S('path', { d: 'M-6 -50 q6 -4 12 0', stroke: 'rgba(255,240,200,.7)', 'stroke-width': 2, fill: 'none' }));
  D.candle = (refs) => {
    const flame = S('g', { class: 'tb-flame' },
      S('circle', { cx: 0, cy: -122, r: 46, fill: 'url(#tb-candle)' }),
      S('path', { d: 'M0 -104 C-8 -112 -6 -126 0 -138 C6 -126 8 -112 0 -104 Z', fill: '#ffc65a' }),
      S('path', { d: 'M0 -107 C-4 -112 -3 -120 0 -126 C3 -120 4 -112 0 -107 Z', fill: '#fff6d0' }));
    (refs.flames = refs.flames || []).push(flame);
    return S('g', null,
      S('ellipse', { cx: 0, cy: 0, rx: 22, ry: 6, fill: 'url(#tb-pewter)', ...st2 }),
      S('path', { d: 'M-6 -2 L-4 -26 L-10 -30 L10 -30 L4 -26 L6 -2 Z', fill: 'url(#tb-pewter)', ...st2 }),
      S('rect', { x: -6, y: -102, width: 12, height: 72, rx: 2, fill: '#f0e6cc', ...st2 }),
      S('line', { x1: 0, y1: -102, x2: 0, y2: -108, stroke: INK, 'stroke-width': 2 }), flame);
  };
  D.pie = () => S('g', { class: 'tb-pie' },
    S('path', { d: 'M-60 -22 L60 -22 L50 0 L-50 0 Z', fill: '#c98a3a', ...st }),
    S('ellipse', { cx: 0, cy: -24, rx: 62, ry: 12, fill: '#d97a2a', ...st }),
    S('path', { d: 'M-60 -24 q7 -8 14 0 q7 -8 14 0 q7 -8 14 0 q7 -8 14 0 q7 -8 14 0 q7 -8 14 0 q7 -8 14 0 q7 -8 14 0 q7 -8 14 0', stroke: '#e8b05a', 'stroke-width': 6, fill: 'none' }),
    S('path', { d: 'M-14 -30 C-18 -46 4 -52 6 -40 C16 -46 24 -34 14 -28 Z', fill: '#fffaf0', ...st2 }));
  D.tofurkey = () => S('g', null, D.plate(34), S('path', { d: 'M-22 -4 C-24 -22 22 -24 24 -6 Z', fill: '#d6c59a', ...st2 }), S('path', { d: 'M-12 -16 l10 6 M0 -18 l10 6', stroke: '#8a6a3a', 'stroke-width': 2 }));
  D.joe = () => S('g', null, D.plate(34),
    S('path', { d: 'M-16 -6 L0 -26 L16 -6 Z', fill: '#efe6d2', ...st2 }),
    S('g', { transform: 'translate(-40,-2)' }, S('path', { d: 'M-12 0 L12 0 L8 -20 L-8 -20 Z', fill: '#f8f4ea', ...st2 }), S('text', { x: 0, y: -6, 'text-anchor': 'middle', 'font-family': 'Homemade Apple, cursive', 'font-size': 9, fill: '#24170e' }, 'Joe')));
  D.peas = () => {
    const g = S('g', null, D.plate(30));
    const r = U.seeded(4);
    for (let i = 0; i < 14; i++) g.appendChild(S('circle', { cx: -14 + r() * 28, cy: -3 + r() * 5, r: 3.4, fill: '#6aa84f', stroke: INK, 'stroke-width': 0.8 }));
    g.appendChild(S('g', { transform: 'translate(46,0)' }, S('rect', { x: -10, y: -30, width: 20, height: 30, rx: 6, fill: '#4f8ad0', ...st2 }), S('path', { d: 'M-6 -30 L-3 -40 L3 -40 L6 -30Z', fill: '#e8b93a', ...st2 })));
    return g;
  };
  D.you = () => {
    const g = S('g');
    g.appendChild(S('path', { d: 'M-190 18 L-160 -30', stroke: '#b9bab2', 'stroke-width': 7, 'stroke-linecap': 'round' }));
    g.appendChild(S('path', { d: 'M-166 -26 l-6 -16 M-160 -24 l-3 -17 M-154 -22 l0 -17', stroke: '#b9bab2', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    g.appendChild(S('path', { d: 'M180 20 L156 -34', stroke: '#b9bab2', 'stroke-width': 7, 'stroke-linecap': 'round' }));
    g.appendChild(S('ellipse', { cx: 0, cy: 0, rx: 132, ry: 32, fill: '#f6f1e6', ...st }));
    g.appendChild(S('ellipse', { cx: 0, cy: 0, rx: 96, ry: 22, fill: 'none', stroke: 'rgba(0,0,0,.12)', 'stroke-width': 2 }));
    g.appendChild(S('path', { d: 'M-78 2 C-82 -16 -40 -22 -30 -6 C-36 6 -70 10 -78 2 Z', fill: '#e9d6b4', ...st2 }));
    g.appendChild(S('path', { d: 'M-70 -4 C-74 -20 -36 -26 -24 -12', fill: 'none', stroke: 'rgba(120,70,20,.4)', 'stroke-width': 2 }));
    g.appendChild(S('path', { d: 'M-10 4 C-20 -26 30 -34 40 -6 C30 8 0 10 -10 4 Z', fill: '#fbf6ea', ...st2 }));
    g.appendChild(S('ellipse', { cx: 14, cy: -12, rx: 14, ry: 5, fill: '#6b3f1d' }));
    g.appendChild(S('ellipse', { cx: 70, cy: 0, rx: 22, ry: 8, fill: '#9e1a30', ...st2 }));
    g.appendChild(S('ellipse', { cx: 70, cy: -1, rx: 14, ry: 4, fill: 'none', stroke: 'rgba(40,0,10,.45)', 'stroke-width': 1.5 }));
    [[-50, 14], [-40, 16], [-30, 12]].forEach(([x, y], i) => g.appendChild(S('path', { d: `M${x} ${y} l26 ${-4 + i * 2}`, stroke: '#4f7a2c', 'stroke-width': 5, 'stroke-linecap': 'round' })));
    g.appendChild(S('g', { transform: 'translate(-236,2)' }, S('path', { d: 'M-34 0 L34 0 L28 -24 L-28 -24 Z', fill: '#f8f4ea', ...st2 }), S('text', { x: 0, y: -7, 'text-anchor': 'middle', 'font-family': 'Homemade Apple, cursive', 'font-size': 13, fill: '#24170e' }, 'You')));
    return g;
  };
  D.phone = (refs) => {
    refs.phoneScreen = S('rect', { x: -9, y: -34, width: 18, height: 30, rx: 2, fill: '#8fc0ff', class: 'tb-phone-screen' });
    refs.phoneGlow = S('ellipse', { cx: 0, cy: -30, rx: 40, ry: 50, fill: '#9cc8ff', opacity: 0.18, class: 'tb-phone-glow' });
    return S('g', null, refs.phoneGlow, S('rect', { x: -12, y: -38, width: 24, height: 38, rx: 4, fill: '#1a1a1e', ...st2 }), refs.phoneScreen);
  };

  /* =========================================================
     The chapter
     ========================================================= */
  LT.chapter({
    id: 'table', index: 3, numeral: 'III', course: 'Third Course', title: 'The Table',
    blurb: 'Survive dinner with the family.', music: 'table', transition: 'cloth',
    light: { darkness: 0.8, radius: 380 },
    mount(root, api) {
      root.classList.add('tb');
      LT.music.param('level', 0.001); // the polka waits for the lights

      const sceneBox = el('div', { class: 'tb-scene' });
      const layer = el('div', { class: 'tb-layer' });
      const hud = el('div', { class: 'tb-hud', 'aria-live': 'off' });
      const overlay = el('div', { class: 'tb-overlay' });
      root.append(sceneBox, layer, hud, overlay);

      /* ---------- build the scene for the current shape ---------- */
      let L, svg, refs, figs, dogApi, dogWrap, seatsById, liveRoot;
      function build() {
        const r = root.getBoundingClientRect();
        L = (r.width || innerWidth) / (r.height || innerHeight) > 1.12 ? WIDE : TALL;
        root.classList.toggle('tb-wide', L === WIDE);
        refs = {}; figs = {}; seatsById = {};
        svg = S('svg', { class: 'tb-svg', viewBox: L.vb.join(' '), preserveAspectRatio: 'xMidYMax meet', role: 'img', 'aria-label': 'The family around the Thanksgiving table' });
        svg.appendChild(defs());
        liveRoot = S('g', { class: 'tb-live' });
        svg.appendChild(liveRoot);
        liveRoot.appendChild(room(L, refs));
        liveRoot.appendChild(lamp(L, refs));
        LT.family.ensureDefs();
        L.bands.forEach((band, bi) => {
          const tables = Object.fromEntries(band.tables.map((t) => [t.id, t]));
          const chairs = S('g'), people = S('g'), tops = S('g'), dishes = S('g');
          band.seats.forEach((seat) => {
            const t = tables[seat.t], s = seat.s || 1;
            const y = t.top + 4;
            seatsById[seat.id] = Object.assign({}, seat, { y, s, table: t });
            if (seat.id === 'joe') {
              chairs.appendChild(chairBack(seat.x, y, s, true));
              const hit = S('rect', { x: seat.x - 60 * s, y: y - 190 * s, width: 120 * s, height: 190 * s, fill: 'transparent' });
              chairs.appendChild(hit);
              refs.joeSeat = { x: seat.x, y: y - 120 * s };
              dishes.appendChild(at(seat.x, t.front - 12, s, D.joe()));
              dishes.appendChild(at(seat.x + 48 * s, t.front - 14, s, D.glass(false)));
              return;
            }
            if (seat.id !== 'mom' && seat.id !== 'benji' && seat.id !== 'maya') chairs.appendChild(chairBack(seat.x, y, s * (seat.id === 'dale' ? 1.05 : 1), false));
            const f = LT.family.figure(seat.id, { scale: s });
            figs[seat.id] = f;
            let oy = y;
            const wrap = S('g', { transform: `translate(${seat.x},${oy})` });
            if (seat.stand) {
              oy = y - 44 * s;
              wrap.setAttribute('transform', `translate(${seat.x},${oy})`);
              wrap.appendChild(S('rect', { x: -46 * s, y: -10 * s, width: 92 * s, height: 70 * s, rx: 8, fill: '#3b3a48', stroke: INK, 'stroke-width': 3 }));
            }
            if (seat.booster) {
              oy = y - 26 * s;
              wrap.setAttribute('transform', `translate(${seat.x},${oy})`);
              ['#3a6fb0', '#e8b93a', '#b8243d'].forEach((col, i) => wrap.appendChild(S('rect', { x: -50 * s, y: (4 + i * 11) * s, width: 100 * s, height: 11 * s, rx: 2, fill: col, stroke: INK, 'stroke-width': 2 })));
            }
            wrap.appendChild(f.el);
            seatsById[seat.id].oy = oy;
            seatsById[seat.id].wrap = wrap;
            people.appendChild(wrap);
            // a plate and a glass for everyone who sits (Mom has one too; she will not use it)
            const front = t.front - 10;
            if (seat.id === 'skye') dishes.appendChild(at(seat.x, front, s, D.tofurkey()));
            else if (seat.id === 'benji') dishes.appendChild(at(seat.x, front, s * 0.9, D.peas()));
            else dishes.appendChild(at(seat.x, front, s * (bi === L.bands.length - 1 ? 1.1 : 1), D.plate(34)));
            if (seat.id === 'dale') dishes.appendChild(at(seat.x + 46 * s, front - 2, s, D.beer()));
            else if (seat.id === 'maya') { const ph = at(seat.x - 4 * s, t.top + 2, s, D.phone(refs)); refs.phone = { x: seat.x, y: t.top - 20 * s }; dishes.appendChild(ph); }
            else if (seat.id !== 'benji') {
              const gl = S('g', { transform: `translate(${seat.x + 46 * s},${front - 3}) scale(${s})` }, D.glass(true));
              if (seat.id === 'linda') { refs.spillGlass = S('g', { class: 'tb-spillglass' }, D.glass(true)); gl.innerHTML = ''; gl.appendChild(refs.spillGlass); refs.spill = { x: seat.x + 46 * s, y: front - 30 * s, table: t }; }
              dishes.appendChild(gl);
            }
          });
          band.dishes.forEach((d) => {
            const t = tables[d.t], s = d.s || 1;
            if (d.k === 'you') { refs.you = { x: d.x, y: t.front - 30 }; dishes.appendChild(at(d.x, t.front - 2, 1, D.you())); return; }
            const y = t.front - 12;
            const node = D[d.k](refs);
            const g = at(d.x, y, s, node);
            if (d.k === 'turkey') { refs.turkey = { x: d.x, y: y - 50 * s, s, top: t.top }; refs.turkeyG = g; }
            if (d.k === 'gravy') refs.gravyAt = { x: d.x, y: y - 22 * s, table: t };
            dishes.appendChild(g);
          });
          tops.append(...band.tables.map(tableTop));
          const mess = S('g', { class: 'tb-mess' });
          band.tables.forEach((t) => { if (t.cloth !== 'paper') refs['mess_' + t.id] = mess; });
          liveRoot.append(chairs, people, tops, mess, dishes);
          if (bi === L.bands.length - 1) refs.kids = band.tables[0];
        });
        // Biscuit, peeking up beside the kids' table
        dogApi = LT.family.dogFigure({ scale: L.dog.s, mood: 'beg' });
        dogWrap = S('g', { class: 'tb-dogmove' }, dogApi.el);
        refs.dogHome = { x: L.dog.x, y: L.dog.y };
        liveRoot.appendChild(S('g', { class: 'tb-dog', transform: `translate(${L.dog.x},${L.dog.y})` }, dogWrap));
        // the dimmer (candlelight) and the garish fluorescent cast
        refs.dim = S('rect', { x: -2000, y: -2000, width: L.vb[2] + 4000, height: L.vb[3] + 4000, fill: '#0b0704', opacity: 0.5, class: 'tb-dim' });
        refs.tint = S('rect', { x: -2000, y: -2000, width: L.vb[2] + 4000, height: L.vb[3] + 4000, fill: '#f3ffc8', opacity: 0, class: 'tb-tint' });
        refs.heat = S('rect', { x: -2000, y: -2000, width: L.vb[2] + 4000, height: L.vb[3] + 4000, fill: '#ff3a1a', opacity: 0, class: 'tb-heat' });
        liveRoot.append(refs.dim, refs.tint, refs.heat);
        // candle flames glow above the dimmer
        const flameLayer = S('g');
        (refs.flames || []).forEach((f) => { const m = f.parentNode.parentNode.getAttribute('transform'); f.remove(); flameLayer.appendChild(S('g', { transform: m }, f)); });
        liveRoot.appendChild(flameLayer);
        sceneBox.innerHTML = '';
        sceneBox.appendChild(svg);
        // keep the people consistent with the game state across rebuilds
        Object.values(figs).forEach((f) => f.mood('neutral'));
        if (lightsOn) setLights(true, true);
      }

      /* ---------- coordinate helpers ---------- */
      const pt = (x, y) => {
        const m = svg.getScreenCTM();
        if (!m) return { x: innerWidth / 2, y: innerHeight / 2 };
        const p = svg.createSVGPoint(); p.x = x; p.y = y;
        const q = p.matrixTransform(m);
        return { x: q.x, y: q.y };
      };
      const local = (x, y) => { const r = layer.getBoundingClientRect(); const p = pt(x, y); return { x: p.x - r.left, y: p.y - r.top }; };
      const svgScale = () => { const m = svg.getScreenCTM(); return m ? m.a : 1; };
      const headOf = (id) => {
        const s = seatsById[id];
        if (!s) return { x: L.vb[2] / 2, y: 300 };
        const def = LT.family.get(id);
        return { x: s.x, y: (s.oy ?? s.y) - 222 * s.s * (def && def.scale ? def.scale : 1) };
      };
      const hudBottom = () => { const r = hud.getBoundingClientRect(); return r.bottom - root.getBoundingClientRect().top + 6; };

      let lightsOn = false;
      function setLights(on, instant) {
        lightsOn = on;
        root.classList.toggle('tb-lit', on);
        const tr = instant ? 'none' : 'opacity 1.8s ease';
        [[refs.dim, on ? 0 : 0.5], [refs.tint, on ? 0.07 : 0], [refs.cone, on ? 0.1 : 0], [refs.bulb, on ? 1 : 0]].forEach(([n, v]) => { if (!n) return; n.style.transition = tr; n.style.opacity = v; });
        LT.light.set({ darkness: on ? 0.04 : 0.8, radius: on ? 1000 : 380, instant: !!instant });
      }

      build();
      let resizeT;
      api.on(window, 'resize', () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(() => {
          const r = root.getBoundingClientRect();
          const want = r.width / r.height > 1.12 ? WIDE : TALL;
          if (want !== L && G.state !== 'ending' && G.state !== 'toast') { clearBubbles(true); clearIncidents(true); build(); }
          else repositionAll();
        }, 200);
      });
      api.cleanup(() => { Object.values(figs).forEach((f) => f.destroy()); dogApi && dogApi.destroy(); });

      /* ---------- sound helpers ---------- */
      const A = LT.audio;
      function babble(who, n = 7) {
        if (!A.ready || A.muted) return;
        const base = VOICE[who] || 200, t0 = A.now();
        const h = headOf(who), p = pt(h.x, h.y);
        const pan = U.clamp((p.x / innerWidth) * 2 - 1, -0.8, 0.8);
        for (let i = 0; i < n; i++) {
          const f = base * U.rand(0.86, 1.3);
          A.tone({ t: t0 + i * U.rand(0.065, 0.1), f, f2: f * U.rand(0.8, 1.12), dur: 0.08, a: 0.006, type: who === 'grandma' || who === 'benji' ? 'triangle' : 'square', g: who === 'you' ? 0.05 : 0.04, filters: [{ type: 'bandpass', f: U.rand(700, 1500), q: 2.4 }], pan });
        }
      }
      function miniBoom(p) {
        if (!A.ready) return;
        const t = A.now();
        A.noise({ t, dur: 0.6, a: 0.003, g: 0.42, color: 'brown', filters: [{ type: 'lowpass', f: 2600, f2: 120 }] });
        A.tone({ t, f: 110, f2: 38, dur: 0.4, a: 0.004, g: 0.45 });
        A.sfx('crunch', { n: 5 });
      }
      let murmur = null, sizzle = null;

      /* ---------- HUD ---------- */
      const thermo = (() => {
        const dial = S('svg', { viewBox: '0 0 120 120', class: 'tb-dial', 'aria-hidden': 'true' });
        const ang = (T) => -135 + ((T - 40) / 140) * 270;
        const polar = (T, r) => { const a = ((ang(T) - 90) * Math.PI) / 180; return [60 + Math.cos(a) * r, 60 + Math.sin(a) * r]; };
        dial.appendChild(S('circle', { cx: 60, cy: 60, r: 55, fill: '#c9cbc4', stroke: INK, 'stroke-width': 3 }));
        dial.appendChild(S('circle', { cx: 60, cy: 60, r: 49, fill: '#f6f1e4', stroke: INK, 'stroke-width': 1.5 }));
        const [a0x, a0y] = polar(150, 42), [a1x, a1y] = polar(180, 42);
        dial.appendChild(S('path', { d: `M${a0x} ${a0y} A42 42 0 0 1 ${a1x} ${a1y}`, stroke: '#c8322a', 'stroke-width': 9, fill: 'none' }));
        for (let T = 40; T <= 180; T += 10) {
          const [x1, y1] = polar(T, 46), [x2, y2] = polar(T, T % 50 === 0 ? 36 : 40);
          dial.appendChild(S('line', { x1, y1, x2, y2, stroke: INK, 'stroke-width': T % 50 === 0 ? 2.4 : 1.2 }));
        }
        [[50, '50'], [100, '100'], [165, '165']].forEach(([T, s]) => { const [x, y] = polar(T, 28); dial.appendChild(S('text', { x, y: y + 3.5, 'text-anchor': 'middle', 'font-size': 10, 'font-family': 'Alegreya Sans, sans-serif', 'font-weight': 700, fill: T === 165 ? '#c8322a' : INK }, s)); });
        dial.appendChild(S('text', { x: 60, y: 86, 'text-anchor': 'middle', 'font-size': 8, 'letter-spacing': 1.5, 'font-family': 'Alegreya Sans, sans-serif', fill: '#5b4632' }, 'MEAT'));
        const needle = S('g', null, S('path', { d: 'M58.5 60 L60 18 L61.5 60 Z', fill: '#c8322a', stroke: INK, 'stroke-width': 1 }));
        dial.append(needle, S('circle', { cx: 60, cy: 60, r: 5, fill: INK }));
        const read = el('div', { class: 'tb-read' }, el('b', null, '40°'), el('span', null, 'F · done at 165'));
        const wrap = el('div', { class: 'tb-thermo', role: 'meter', 'aria-label': 'Family temperature', 'aria-valuemin': 40, 'aria-valuemax': 165, 'aria-valuenow': 40 }, dial, read);
        return { wrap, set(T) { needle.setAttribute('transform', `rotate(${ang(U.clamp(T, 30, 185)).toFixed(1)} 60 60)`); read.firstChild.textContent = Math.round(T) + '°'; wrap.setAttribute('aria-valuenow', Math.round(T)); wrap.classList.toggle('hot', T > 140); } };
      })();
      const clockEl = el('div', { class: 'tb-clock' }, el('b', null, '6:00'), el('span', null, 'PM · pie at 7:30'));
      const clockBar = el('i', { class: 'tb-clockbar' });
      clockEl.appendChild(clockBar);
      const bingoEl = el('div', { class: 'tb-bingo', 'aria-label': 'Family bingo' });
      const bingoCells = BINGO.map((label, i) => {
        const c = el('div', { class: 'tb-cell' + (i === 4 ? ' free on' : '') }, el('span', null, label));
        bingoEl.appendChild(c);
        return c;
      });
      const bingoWrap = el('div', { class: 'tb-bingowrap' }, el('div', { class: 'tb-bingo-k' }, 'Family Bingo'), bingoEl);
      const skipBtn = el('button', { class: 'tb-skip', type: 'button' }, 'Skip dinner');
      hud.append(el('div', { class: 'tb-hud-l' }, thermo.wrap, clockEl), skipBtn);
      root.appendChild(bingoWrap);
      hud.hidden = true; bingoWrap.hidden = true;

      /* ---------- game state ---------- */
      const G = { state: 'intro', g: 0, temp: T_START, maxTemp: T_START, spawnT: 1.2, bubbles: [], incidents: {}, defused: 0, exploded: 0, handled: 0, missed: 0, bingo: new Set([4]), dogClicks: 0, deck: [], dogBusy: false, musicT: 0, lastTens: 0 };
      try { (LT.state.bingo || []).length = 0; } catch (e) {}

      function markBingo(i) {
        if (i == null || G.bingo.has(i)) return;
        G.bingo.add(i);
        bingoCells[i].classList.add('on');
        bingoCells[i].animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        LT.state.bingo = [...G.bingo].map((k) => BINGO[k].replace(/[“”]/g, '"'));
        LT.save();
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        if (!G.hadBingo && lines.some((l) => l.every((k) => G.bingo.has(k)))) {
          G.hadBingo = true;
          const r = bingoEl.getBoundingClientRect();
          LT.fx.confetti(r.left + r.width / 2, r.top + r.height / 2, { count: 50 });
          LT.egg('bingo', 'Family Bingo', 'Three in a row. Every family is the same family.');
        }
      }

      function temp(delta) {
        G.temp = U.clamp(G.temp + delta, T_START, 200);
        G.maxTemp = Math.max(G.maxTemp, G.temp);
      }

      /* ---------- the cast reacts ---------- */
      function everyoneLooksAt(id) {
        const h = seatsById[id];
        Object.entries(figs).forEach(([k, f]) => { if (k === id) return; const s = seatsById[k]; if (!h || !s) return; f.lookAt(U.clamp((h.x - s.x) / 300, -1, 1) * 0.8); });
      }
      function moodFor(id) {
        const t = (G.temp - T_START) / (T_DONE - T_START);
        if (t > 0.78 && (id === 'dale' || id === 'linda' || id === 'grandma')) return 'mad';
        if (t > 0.6 && (id === 'mom' || id === 'skye')) return 'worried';
        if (id === 'maya') return 'neutral';
        return t > 0.45 ? 'worried' : 'neutral';
      }

      /* ---------- speech bubbles ---------- */
      function placeBubble(node, ax, ay) {
        const lr = layer.getBoundingClientRect();
        const w = node.offsetWidth, h = node.offsetHeight;
        const gut = 12;
        let x = U.clamp(ax, gut + w / 2, lr.width - gut - w / 2);
        let y = ay - 14;
        const minY = hudBottom() + h;
        if (y < minY) y = minY;
        node.style.left = x + 'px'; node.style.top = y + 'px';
        node.style.setProperty('--tail', U.clamp(ax - x, -w / 2 + 18, w / 2 - 18) + 'px');
        return { x, y, w, h };
      }
      function fusePath(W, H) {
        const r = Math.min(18, H / 2);
        return `M${W / 2} ${H} H${r} A${r} ${r} 0 0 1 0 ${H - r} V${r} A${r} ${r} 0 0 1 ${r} 0 H${W - r} A${r} ${r} 0 0 1 ${W} ${r} V${H - r} A${r} ${r} 0 0 1 ${W - r} ${H} Z`;
      }
      function say(who, text, o = {}) {
        // a non-interactive bubble (reactions, chaos, grandma's toast)
        const def = LT.family.get(who);
        const b = el('div', { class: 'tb-bubble tb-say' + (o.big ? ' big' : '') + (o.cls ? ' ' + o.cls : '') }, el('span', { class: 'tb-who' }, def ? def.short : who), el('span', { class: 'tb-text' }, text), el('span', { class: 'tb-tail', 'aria-hidden': 'true' }));
        layer.appendChild(b);
        const h = headOf(who), p = local(h.x, h.y);
        placeBubble(b, p.x + (o.dx || 0), p.y);
        b.animate([{ transform: 'translate(-50%,-100%) scale(.5)', opacity: 0 }, { transform: 'translate(-50%,-100%) scale(1)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        if (figs[who]) figs[who].talk(true);
        if (!o.silent) babble(who, Math.min(10, 3 + Math.round(text.length / 8)));
        const kill = () => { if (!b.isConnected) return; b.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%,-110%) scale(.9)' }], { duration: 250, fill: 'forwards' }).onfinish = () => b.remove(); if (figs[who] && !o.keepTalking) figs[who].talk(false); };
        if (o.ms !== 0) api.timeout(kill, o.ms || 1500);
        return { el: b, kill };
      }
      function youSay(text) {
        layer.querySelectorAll('.tb-you').forEach((n) => n.remove());
        const b = el('div', { class: 'tb-bubble tb-you' }, el('span', { class: 'tb-who' }, 'You'), el('span', { class: 'tb-text' }, text), el('span', { class: 'tb-tail', 'aria-hidden': 'true' }));
        layer.appendChild(b);
        const p = local(refs.you.x, refs.you.y - 40);
        placeBubble(b, p.x, p.y);
        b.animate([{ transform: 'translate(-50%,-100%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-100%) scale(1)', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        babble('you', Math.min(9, 3 + Math.round(text.length / 9)));
        api.timeout(() => { b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => b.remove(); }, 1700);
      }
      function slip(who, text, kind = 'boom') {
        const h = who ? headOf(who) : { x: L.vb[2] / 2, y: L.vb[3] * 0.4 };
        const p = local(h.x, h.y + 150);
        const s = el('div', { class: 'tb-slip tb-slip--' + kind }, el('b', null, kind === 'boom' ? 'Boom.' : kind === 'miss' ? 'Missed.' : 'Nice.'), ' ', text);
        layer.appendChild(s);
        const w = s.offsetWidth, lr = layer.getBoundingClientRect();
        s.style.left = U.clamp(p.x, 12 + w / 2, lr.width - 12 - w / 2) + 'px';
        s.style.top = Math.max(hudBottom() + 40, p.y) + 'px';
        api.timeout(() => { s.classList.add('out'); api.timeout(() => s.remove(), 500); }, 2800);
      }

      function spawnLandmine() {
        if (!G.deck.length) G.deck = U.shuffle(LANDMINES);
        const busy = new Set(G.bubbles.map((b) => b.lm.who));
        const lr = layer.getBoundingClientRect();
        for (let tries = 0; tries < G.deck.length; tries++) {
          const lm = G.deck[tries];
          if (busy.has(lm.who) || !seatsById[lm.who]) continue;
          const h = headOf(lm.who), p = local(h.x, h.y);
          const crowded = G.bubbles.some((b) => Math.abs(b.ax - p.x) < Math.min(230, lr.width * 0.44) && Math.abs(b.ay - p.y) < 120);
          if (crowded) continue;
          G.deck.splice(tries, 1);
          makeLandmine(lm, p);
          return true;
        }
        return false;
      }
      function makeLandmine(lm, p) {
        const def = LT.family.get(lm.who);
        const fuse = S('svg', { class: 'tb-fuse', 'aria-hidden': 'true' });
        const cord = S('path', { class: 'tb-cord' });
        const burnt = S('path', { class: 'tb-burnt' });
        const spark = S('circle', { r: 5, class: 'tb-spark' });
        fuse.append(burnt, cord, spark);
        const b = el('button', { class: 'tb-bubble tb-mine', type: 'button', 'aria-label': `${def.short} says: ${lm.say} Tap to change the subject.` },
          el('span', { class: 'tb-who' }, def.short), el('span', { class: 'tb-text' }, lm.say), el('span', { class: 'tb-tail', 'aria-hidden': 'true' }), fuse);
        layer.appendChild(b);
        const box = placeBubble(b, p.x, p.y);
        const W = b.offsetWidth + 10, H = b.offsetHeight + 10;
        fuse.setAttribute('viewBox', `0 0 ${W} ${H}`);
        fuse.setAttribute('width', W); fuse.setAttribute('height', H);
        const d = fusePath(W - 6, H - 6);
        cord.setAttribute('d', d); burnt.setAttribute('d', d);
        cord.setAttribute('transform', 'translate(3,3)'); burnt.setAttribute('transform', 'translate(3,3)');
        const len = cord.getTotalLength();
        cord.style.strokeDasharray = `${len} ${len}`;
        b.animate([{ transform: 'translate(-50%,-100%) scale(.3) rotate(-8deg)', opacity: 0 }, { transform: 'translate(-50%,-100%) scale(1)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        const k = G.g / DURATION;
        const item = { lm, el: b, cord, spark, len, t: 0, dur: U.lerp(6.2, 3.7, k) * (U.isTouch ? 1.12 : 1), ax: p.x, ay: p.y, sparkT: 0 };
        G.bubbles.push(item);
        b.addEventListener('click', () => defuse(item));
        const f = figs[lm.who];
        if (f) { f.talk(true); f.mood(lm.who === 'maya' ? 'neutral' : lm.who === 'grandma' ? 'smug' : 'neutral'); }
        if (lm.who === 'dale' || lm.who === 'linda') f && f.arms(null, -70);
        everyoneLooksAt(lm.who);
        babble(lm.who, Math.min(11, 4 + Math.round(lm.say.length / 7)));
        if (lm.bingo != null) markBingo(lm.bingo);
      }
      function updateLandmine(b, dt) {
        b.t += dt;
        const k = U.clamp(b.t / b.dur, 0, 1);
        const burned = b.len * k;
        b.cord.style.strokeDashoffset = (-burned).toFixed(1);
        const P = b.cord.getPointAtLength(Math.min(b.len - 0.01, burned));
        b.spark.setAttribute('cx', P.x + 3); b.spark.setAttribute('cy', P.y + 3);
        b.el.classList.toggle('danger', k > 0.72);
        b.sparkT -= dt;
        if (b.sparkT <= 0 && !U.reducedMotion) {
          b.sparkT = 0.12;
          const r = b.el.getBoundingClientRect();
          LT.fx.sparks(r.left - 5 + P.x + 3, r.top - 5 + P.y + 3, 2, { speed: [40, 160], life: [0.15, 0.4] });
        }
        if (k >= 1) explode(b);
      }
      function removeBubble(b) {
        const i = G.bubbles.indexOf(b);
        if (i >= 0) G.bubbles.splice(i, 1);
        const f = figs[b.lm.who];
        if (f) { f.talk(false); if (b.lm.who === 'dale' || b.lm.who === 'linda') f.rest(); }
      }
      function defuse(b) {
        if (G.state !== 'play' || !G.bubbles.includes(b)) return;
        removeBubble(b);
        G.defused++;
        LT.stats.inc('fusesDefused');
        if (/potato/i.test(b.lm.you)) LT.stats.inc('potatoesPassed');
        temp(-2.5);
        const r = b.el.getBoundingClientRect();
        A.sfx('pop', { f: 1200, g: 0.22 });
        A.sfx('pluck', { n: U.pick([72, 76, 79, 84]), g: 0.18 });
        LT.fx.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 16, colors: ['#f2c14e', '#efe6d2', '#8b9467'], speed: [80, 260], gravity: 300, size: [2, 4], life: [0.3, 0.7] });
        b.el.style.pointerEvents = 'none';
        b.el.animate([{ transform: 'translate(-50%,-100%) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-100%) scale(.2) rotate(10deg)', opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' }).onfinish = () => b.el.remove();
        youSay(b.lm.you);
        const f = figs[b.lm.who];
        if (f) { f.mood('happy'); api.timeout(() => G.state === 'play' && f.mood(moodFor(b.lm.who)), 1600); }
        if (Math.random() < 0.4) api.timeout(() => { if (G.state === 'play' && !G.bubbles.some((x) => x.lm.who === b.lm.who)) say(b.lm.who, U.pick(REACT[b.lm.who] || ['Okay.']), { ms: 1200 }); }, 900);
      }
      function explode(b) {
        removeBubble(b);
        G.exploded++;
        LT.stats.inc('landminesExploded');
        temp(13);
        const r = b.el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        miniBoom();
        LT.fx.burst(cx, cy, { count: 40, colors: ['#ffb347', '#ff8a3c', '#f2c14e', '#b8243d'], speed: [120, 520], gravity: 420, size: [2, 5], life: [0.4, 1] });
        LT.fx.sparks(cx, cy, 20);
        LT.fx.smoke(cx, cy, { count: 8, color: 'rgba(60,50,40,.35)' });
        LT.fx.shake(7, 0.35);
        b.el.style.pointerEvents = 'none';
        b.el.animate([{ transform: 'translate(-50%,-100%) scale(1)', opacity: 1, filter: 'brightness(1)' }, { transform: 'translate(-50%,-100%) scale(1.5)', opacity: 0, filter: 'brightness(3)' }], { duration: 300, fill: 'forwards' }).onfinish = () => b.el.remove();
        slip(b.lm.who, b.lm.boom, 'boom');
        const f = figs[b.lm.who];
        if (f) { f.mood(b.lm.who === 'maya' ? 'smug' : 'mad'); api.timeout(() => G.state === 'play' && f.mood(moodFor(b.lm.who)), 2600); }
        if (b.lm.also && figs[b.lm.also]) { const o = figs[b.lm.also]; o.mood(b.lm.also === 'skye' ? 'shock' : 'mad'); api.timeout(() => G.state === 'play' && o.mood(moodFor(b.lm.also)), 2600); }
        if (b.lm.then === 'alarm') api.timeout(() => G.state === 'play' && startIncident('alarm'), 600);
      }
      function clearBubbles(instant) {
        G.bubbles.forEach((b) => { const f = figs[b.lm.who]; f && f.talk(false); instant ? b.el.remove() : b.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).onfinish = () => b.el.remove(); });
        G.bubbles = [];
      }

      /* ---------- incidents ---------- */
      const INCIDENTS = {
        dog: {
          label: 'Stop Biscuit', anchor: () => ({ x: refs.dogHome.x, y: refs.dogHome.y - 150 * L.dog.s }),
          start(i) { G.dogBusy = true; dogApi.mood('beg'); dogApi.wag(2.2); moveDog(0, -60 * L.dog.s, 0.5); A.sfx('bark', { n: 1 }); },
          handled() { dogApi.mood('guilty'); moveDog(0, 0, 0.4); api.timeout(() => dogApi.mood('beg'), 1800); G.dogBusy = false; return 'BISCUIT. NO.'; },
          failed() { A.sfx('bark'); dogApi.mood('happy'); moveDog(-40, -90 * L.dog.s, 0.25); api.timeout(() => moveDog(0, 0, 0.6), 500); api.timeout(() => { dogApi.mood('beg'); G.dogBusy = false; }, 2200); markBingo(2); return 'Biscuit got a roll. Biscuit regrets nothing.'; },
        },
        peas: {
          label: 'Stop the peas', anchor: () => { const h = headOf('benji'); return { x: h.x, y: h.y + 70 }; },
          start() { figs.benji && figs.benji.mood('smug').arms(null, -140); A.sfx('boing'); },
          handled() { figs.benji && figs.benji.mood('sad').rest(); api.timeout(() => figs.benji && figs.benji.mood('neutral'), 1500); api.timeout(() => G.state === 'play' && say('benji', U.pick(['Stegosaurus had a brain the size of a walnut.', 'Okay but raptors could.', 'Fine. RAWR.']), { ms: 1600 }), 500); return 'Peas stay on the plate.'; },
          failed() {
            const from = pt(headOf('benji').x + 40, headOf('benji').y + 40);
            const target = U.pick(['dale', 'grandma', 'linda', 'dad'].filter((k) => seatsById[k]));
            const to = pt(headOf(target).x, headOf(target).y + 20), T = 0.75;
            for (let n = 0; n < (U.reducedMotion ? 5 : 14); n++) {
              const tx = to.x + U.rand(-30, 30), ty = to.y + U.rand(-20, 20), g = 900;
              LT.fx.add({ x: from.x, y: from.y, vx: (tx - from.x) / T, vy: (ty - from.y - 0.5 * g * T * T) / T, ay: g, drag: 1, size: 4.5, size2: 4.5, color: '#6aa84f', shape: 'circle', max: T + 0.05, keep: true });
            }
            figs.benji && figs.benji.mood('grin').rest();
            A.sfx('whoosh', { dur: 0.4 });
            api.timeout(() => { A.sfx('splat', { g: 0.25 }); figs[target] && figs[target].mood('shock'); pea(target); api.timeout(() => figs[target] && G.state === 'play' && figs[target].mood(moodFor(target)), 2200); }, T * 1000);
            markBingo(8);
            return `Peas, airborne. ${LT.family.get(target).short} took a direct hit.`;
          },
        },
        gravy: {
          label: 'Catch the gravy', anchor: () => refs.gravyAt,
          start(i) { i.wob = 0; A.sfx('squish'); },
          tick(i, k, dt) { i.wob += dt; refs.gravy.setAttribute('transform', `rotate(${(Math.sin(i.wob * (10 + k * 14)) * (3 + k * 26)).toFixed(1)})`); },
          handled() { refs.gravy.setAttribute('transform', ''); return 'Gravy: saved.'; },
          failed() {
            refs.gravy.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-80deg)' }], { duration: 250, fill: 'forwards' });
            const p = pt(refs.gravyAt.x, refs.gravyAt.y);
            A.sfx('splat');
            for (let n = 0; n < 3; n++) api.timeout(() => LT.fx.splat(p.x + U.rand(-160, 160), p.y + U.rand(-220, 60), { color: '#6b3f1d', size: U.rand(90, 170) }), n * 140);
            stain(refs.gravyAt.x, refs.gravyAt.table, '#6b3f1d');
            api.timeout(() => { refs.gravy.getAnimations().forEach((a) => a.cancel()); refs.gravy.setAttribute('transform', ''); }, 1600);
            markBingo(8);
            return 'Gravy everywhere. On the tablecloth. On the glass. On you.';
          },
        },
        alarm: {
          label: 'Fan the alarm', anchor: () => refs.alarm, minG: 6,
          start(i) { i.loop = api.sound(A.sfx('alarm', { g: 0.09 })); refs.alarmLed.classList.add('on'); i.smokeT = 0; markBingo(3); },
          tick(i, k, dt) { i.smokeT -= dt; if (i.smokeT <= 0) { i.smokeT = 0.25; const p = pt(refs.door.x, refs.door.y); LT.fx.smoke(p.x, p.y, { count: 3, color: 'rgba(70,64,58,.4)', scale: 1.4, wind: 30 }); } },
          end(i) { i.loop && i.loop.stop(0.1); refs.alarmLed.classList.remove('on'); },
          handled() { A.sfx('whoosh', { dur: 0.35 }); api.timeout(() => G.state === 'play' && say('mom', U.pick(['The rolls are FINE.', "It's just the rolls!", 'Nobody panic.']), { ms: 1500 }), 300); return 'Fanned it with a dish towel.'; },
          failed() { figs.mom && figs.mom.mood('worried'); return 'The alarm went off for four minutes. Nobody knew the code.'; },
        },
        phone: {
          label: 'Silence the phone', anchor: () => refs.phone,
          start(i) { i.loop = api.sound(A.sfx('ringtone', { g: 0.09 })); refs.phoneScreen.classList.add('blare'); refs.phoneGlow.classList.add('blare'); figs.maya && figs.maya.mood('grin'); markBingo(5); },
          end(i) { i.loop && i.loop.stop(0.05); refs.phoneScreen.classList.remove('blare'); refs.phoneGlow.classList.remove('blare'); figs.maya && figs.maya.mood('neutral'); },
          handled() { api.timeout(() => G.state === 'play' && say('maya', U.pick(['ok ok', 'it was ONE video', 'fine.']), { ms: 1300 }), 300); return 'Phones away. For now.'; },
          failed() { return 'Everyone has now watched the whole video. Twice.'; },
        },
        spill: {
          label: 'Catch the glass', anchor: () => refs.spill,
          start(i) { i.wob = 0; figs.linda && figs.linda.talk(true).arms(null, -110); },
          tick(i, k, dt) { i.wob += dt; refs.spillGlass.setAttribute('transform', `rotate(${(k * 38 + Math.sin(i.wob * 18) * 6).toFixed(1)})`); },
          end() { figs.linda && figs.linda.talk(false).rest(); },
          handled() { refs.spillGlass.setAttribute('transform', ''); return 'Nice catch.'; },
          failed() {
            refs.spillGlass.setAttribute('transform', 'rotate(95)');
            A.sfx('clink', { f: 1500 }); A.sfx('splat', { g: 0.3 });
            stain(refs.spill.x + 20, refs.spill.table, '#7d1a2c');
            figs.grandma && figs.grandma.mood('shock');
            api.timeout(() => G.state === 'play' && say('grandma', 'MY GOOD TABLECLOTH.', { ms: 1600 }), 400);
            markBingo(8);
            return "Red wine on Grandma's good tablecloth.";
          },
        },
        fryer: {
          label: 'Stop Dale', anchor: () => { const h = headOf('dale'); return { x: h.x, y: h.y + 140 }; }, minG: 14,
          start(i) { const s = seatsById.dale; s.wrap.animate([{ transform: `translate(${s.x}px,${s.oy}px)` }, { transform: `translate(${s.x}px,${s.oy - 40}px)` }], { duration: 400, fill: 'forwards', easing: 'ease-out' }); figs.dale.mood('smug').lookAt(0.8); refs.fryerGlow.classList.add('hot'); say('dale', U.pick(["I'm just gonna check the fryer.", "Who wants to see a turkey FRY?", 'Back in five.']), { ms: 1700 }); },
          end() { const s = seatsById.dale; s.wrap.getAnimations().forEach((a) => a.cancel()); refs.fryerGlow.classList.remove('hot'); },
          handled() { figs.dale.mood('sad'); api.timeout(() => G.state === 'play' && figs.dale.mood(moodFor('dale')), 1500); return 'Dale. Sit.'; },
          failed() {
            const p = pt(refs.fryer.x, refs.fryer.y);
            refs.fryerFire.classList.add('boom');
            A.sfx('boom', { g: 0.6 }); LT.fx.flash('#ffb060', 0.4); LT.fx.shake(12, 0.6);
            LT.fx.sparks(p.x, p.y, 40); LT.fx.burst(p.x, p.y, { count: 30, colors: ['#ffb03a', '#ff6a1a', '#ffd27a'], speed: [100, 400], gravity: 200, life: [0.5, 1.2], blend: 'lighter' });
            api.timeout(() => refs.fryerFire.classList.remove('boom'), 1800);
            figs.dale.mood('shock');
            soot('dale');
            api.timeout(() => G.state === 'play' && startIncident('alarm'), 900);
            return "FWOOMP. Dale's eyebrows are gone.";
          },
        },
      };

      function moveDog(dx, dy, s, sc = 1) {
        dogWrap.style.transition = `transform ${s}s cubic-bezier(.34,1.56,.64,1)`;
        dogWrap.style.transform = `translate(${dx}px,${dy}px) scale(${sc})`;
      }
      function stain(x, table, color) {
        const mess = refs['mess_' + table.id] || liveRoot;
        const g = S('g', { opacity: 0.85 });
        const rx = U.rand(40, 70);
        g.appendChild(S('ellipse', { cx: x, cy: (table.top + table.front) / 2 + 6, rx, ry: (table.front - table.top) * 0.35, fill: color, opacity: 0.75 }));
        g.appendChild(S('path', { d: `M${x - rx * 0.6} ${table.front} q${rx * 0.2} 30 ${rx * 0.1} 60 q8 10 12 -4 l4 -56 q10 40 20 30 l4 -30 Z`, fill: color, opacity: 0.7 }));
        mess.appendChild(g);
        g.animate([{ transform: `translate(${x}px, ${table.front}px) scale(.2) translate(${-x}px, ${-table.front}px)` }, { transform: 'none' }], { duration: 400, easing: 'ease-out' });
      }
      function pea(who) {
        const f = figs[who];
        if (!f) return;
        const head = f.el.querySelector('.fam-head');
        if (!head) return;
        for (let i = 0; i < 4; i++) head.appendChild(S('circle', { cx: U.rand(-28, 28), cy: U.rand(-40, 24), r: 4, fill: '#6aa84f', stroke: INK, 'stroke-width': 1 }));
      }
      function soot(who) {
        const f = figs[who];
        const head = f && f.el.querySelector('.fam-head');
        if (!head) return;
        head.appendChild(S('g', { opacity: 0.6 }, S('ellipse', { cx: -14, cy: -14, rx: 13, ry: 6, fill: '#2a2a2a' }), S('ellipse', { cx: 14, cy: -14, rx: 13, ry: 6, fill: '#2a2a2a' }), S('ellipse', { cx: 20, cy: 10, rx: 8, ry: 5, fill: '#2a2a2a' })));
      }

      function startIncident(type) {
        if (G.state !== 'play' || G.incidents[type]) return false;
        const def = INCIDENTS[type];
        if (type === 'dog' && G.dogBusy) return false;
        if ((type === 'phone' && !refs.phone) || (type === 'spill' && !refs.spill) || (type === 'gravy' && !refs.gravyAt) || (type === 'fryer' && !seatsById.dale) || (type === 'peas' && !seatsById.benji)) return false;
        const k = G.g / DURATION;
        const ring = S('svg', { viewBox: '0 0 60 60', class: 'tb-ring', 'aria-hidden': 'true' }, S('circle', { cx: 30, cy: 30, r: 26, class: 'bg' }), S('circle', { cx: 30, cy: 30, r: 26, class: 'fg', pathLength: 100 }));
        const btn = el('button', { class: 'tb-target tb-target--' + type, type: 'button', 'aria-label': def.label }, ring, el('span', { class: 'tb-bang', 'aria-hidden': 'true' }, '!'), el('span', { class: 'tb-tlabel' }, def.label));
        layer.appendChild(btn);
        const i = { type, def, el: btn, fg: ring.querySelector('.fg'), t: 0, dur: U.lerp(5.4, 3.6, k) * (U.isTouch ? 1.12 : 1) };
        positionTarget(i);
        btn.animate([{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 360, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        G.incidents[type] = i;
        btn.addEventListener('click', (e) => { e.stopPropagation(); handleIncident(i); });
        def.start && def.start(i);
        A.sfx('ting', { f: 2200, g: 0.08 });
        return true;
      }
      function positionTarget(i) {
        const a = i.def.anchor(); if (!a) return;
        const p = local(a.x, a.y);
        const lr = layer.getBoundingClientRect();
        i.el.style.left = U.clamp(p.x, 40, lr.width - 40) + 'px';
        i.el.style.top = U.clamp(p.y, hudBottom() + 30, lr.height - 40) + 'px';
      }
      function endIncident(i) {
        delete G.incidents[i.type];
        i.def.end && i.def.end(i);
        i.el.style.pointerEvents = 'none';
        i.el.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0 }], { duration: 260, fill: 'forwards' }).onfinish = () => i.el.remove();
      }
      function handleIncident(i) {
        if (G.state !== 'play' || G.incidents[i.type] !== i) return;
        endIncident(i);
        G.handled++;
        LT.stats.inc('incidentsHandled');
        temp(-1);
        const msg = i.def.handled(i);
        const r = i.el.getBoundingClientRect();
        A.sfx('pop', { f: 1000, g: 0.2 }); A.sfx('pluck', { n: 79, g: 0.16 });
        LT.fx.float(r.left + r.width / 2, r.top - 6, msg, { size: U.isTouch ? 22 : 28, color: '#f2c14e' });
        if (i.type === 'dog') dogClick(true);
      }
      function failIncident(i) {
        endIncident(i);
        G.missed++;
        LT.stats.inc('incidentsMissed');
        temp(10.5);
        const msg = i.def.failed(i);
        const who = { dog: 'maya', peas: 'benji', gravy: 'linda', alarm: 'mom', phone: 'maya', spill: 'linda', fryer: 'dale' }[i.type];
        slip(who, msg, 'miss');
      }
      function clearIncidents(instant) {
        Object.values(G.incidents).forEach((i) => { i.def.end && i.def.end(i); instant ? i.el.remove() : endIncident(i); });
        G.incidents = {};
        G.dogBusy = false;
      }
      function repositionAll() {
        Object.values(G.incidents).forEach(positionTarget);
        G.bubbles.forEach((b) => { const h = headOf(b.lm.who), p = local(h.x, h.y); b.ax = p.x; b.ay = p.y; placeBubble(b.el, p.x, p.y); });
        placeStatic();
      }

      /* ---------- Biscuit, always clickable ---------- */
      const dogBtn = el('button', { class: 'tb-hit tb-hit--dog', type: 'button', 'aria-label': 'Pet Biscuit' });
      const joeBtn = el('button', { class: 'tb-hit tb-hit--joe', type: 'button', 'aria-label': "Grandpa Joe's place" });
      layer.append(dogBtn, joeBtn);
      function placeStatic() {
        const s = svgScale();
        const d = local(refs.dogHome.x, refs.dogHome.y - 110 * L.dog.s);
        const ds = Math.max(56, 130 * L.dog.s * s);
        Object.assign(dogBtn.style, { left: d.x + 'px', top: d.y + 'px', width: ds + 'px', height: ds + 'px' });
        if (refs.joeSeat) {
          const j = local(refs.joeSeat.x, refs.joeSeat.y);
          const js = Math.max(44, 110 * s);
          Object.assign(joeBtn.style, { left: j.x + 'px', top: j.y + 'px', width: js + 'px', height: js * 1.4 + 'px' });
        }
      }
      placeStatic();
      function dogClick(fromIncident) {
        G.dogClicks++;
        if (!fromIncident) {
          if (G.incidents.dog) { handleIncident(G.incidents.dog); return; }
          dogApi.bark(); dogApi.mood('happy');
          api.timeout(() => dogApi.mood('beg'), 900);
          const r = dogBtn.getBoundingClientRect();
          LT.fx.float(r.left + r.width / 2, r.top, U.pick(['woof', 'boof', 'wrf!', '*wag*']), { size: 22, color: '#efe6d2' });
        }
        if (G.dogClicks === 7 && !G.gotLeg) giveLeg();
      }
      function giveLeg() {
        G.gotLeg = true;
        if (!refs.legR) return;
        const from = pt(refs.turkey.x + 70 * refs.turkey.s, refs.turkey.y + 20 * refs.turkey.s);
        const to = dogBtn.getBoundingClientRect();
        refs.legR.style.opacity = 0;
        const leg = el('div', { class: 'tb-flyleg', 'aria-hidden': 'true', html: '<svg viewBox="-60 -30 120 60" width="84" height="42"><ellipse cx="-14" cy="0" rx="34" ry="21" fill="#a3561f" stroke="#1c130c" stroke-width="4"/><rect x="16" y="-6" width="30" height="12" rx="4" fill="#f1e8d2" stroke="#1c130c" stroke-width="3"/><path d="M44 -12 l8 4 -6 4 6 4 -6 4 6 4 -8 4" fill="#fff" stroke="#1c130c" stroke-width="2.5"/><path d="M-36 -8 q14 -12 30 -10" stroke="#dc9654" stroke-width="5" fill="none" stroke-linecap="round"/></svg>' });
        leg.style.left = from.x + 'px'; leg.style.top = from.y + 'px';
        document.body.appendChild(leg);
        api.cleanup(() => leg.remove());
        const tx = to.left + to.width / 2, ty = to.top + to.height * 0.4;
        A.sfx('whoosh', { dur: 0.5 });
        U.tween({ from: 0, to: 1, dur: 0.75, ease: 'inOutSine', onUpdate: (k) => { leg.style.left = U.lerp(from.x, tx, k) + 'px'; leg.style.top = U.lerp(from.y, ty, k) - Math.sin(k * Math.PI) * 160 + 'px'; leg.style.transform = `translate(-50%,-50%) rotate(${k * 540}deg)`; } }).done.then(() => {
          leg.remove();
          dogApi.mood('happy'); dogApi.wag(3); A.sfx('bark'); A.sfx('chime');
          LT.fx.confetti(tx, ty, { count: 40, shapes: ['leaf'] });
          markBingo(2);
          LT.stats.inc('dogBribes');
          LT.egg('goodboy', 'Good boy', 'Biscuit got the turkey leg. Nobody saw anything.');
        });
      }
      api.on(dogBtn, 'click', () => dogClick(false));
      api.on(joeBtn, 'click', () => {
        const fl = refs.flames && refs.flames[0];
        A.sfx('chime', { n: 72 });
        LT.light.pulse();
        const j = pt(refs.joeSeat.x, refs.joeSeat.y);
        LT.fx.glow(j.x, j.y, { size: 70, life: 1.2, color: 'rgba(255,220,150,.6)' });
        const note = el('div', { class: 'tb-joe-note' }, U.pick(['He always told the fryer story. Every year. Same story.', 'He took the drumstick. Nobody else was allowed.', 'He said grace in about four words. Everyone loved that.']));
        layer.appendChild(note);
        const p = local(refs.joeSeat.x, refs.joeSeat.y - 80);
        note.style.left = U.clamp(p.x, 120, layer.clientWidth - 120) + 'px';
        note.style.top = Math.max(hudBottom() + 30, p.y) + 'px';
        api.timeout(() => { note.classList.add('out'); api.timeout(() => note.remove(), 900); }, 3600);
        LT.egg('joeschair', "Grandpa Joe's place", 'Someone still sets it every year.');
      });

      /* ---------- the intro card ---------- */
      function introCard() {
        const go = el('button', { class: 'lt-btn lt-btn--ink', type: 'button' }, 'Sit down');
        const skip = el('button', { class: 'lt-btn lt-btn--ghost tb-skip2', type: 'button' }, 'Just watch it fall apart');
        const verb = U.isTouch ? 'Tap' : 'Click';
        const card = el('div', { class: 'tb-intro lt-card', role: 'dialog', 'aria-label': 'Survive dinner' },
          el('div', { class: 'tb-stamp' }, 'Survive', el('br'), el('i', null, 'Dinner')),
          el('ul', null,
            el('li', null, el('b', null, 'Landmines. '), `${verb} a speech bubble before its fuse burns down and you'll change the subject.`),
            el('li', null, el('b', null, 'Incidents. '), `The dog, the peas, the gravy, the smoke alarm. ${verb} them fast.`),
            el('li', null, el('b', null, 'The goal. '), 'Keep the family under 165°F until pie at 7:30.')),
          el('div', { class: 'tb-intro-btns' }, go, skip));
        overlay.appendChild(card);
        card.animate([{ transform: 'scale(1.6) rotate(6deg)', opacity: 0 }, { transform: 'scale(1) rotate(-1.5deg)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' });
        A.sfx('thud');
        go.focus({ preventScroll: true });
        return new Promise((res) => {
          go.addEventListener('click', () => { A.sfx('clink'); card.remove(); res('play'); });
          skip.addEventListener('click', () => { card.remove(); res('skip'); });
        });
      }

      /* ---------- the run ---------- */
      async function coldOpen() {
        const cap = el('div', { class: 'tb-caption' }, 'Third course. Everyone is here.');
        overlay.appendChild(cap);
        murmur = api.sound(A.sfx('murmur', { g: 0.32 }));
        murmur.set && murmur.set(0.35);
        Object.values(figs).forEach((f, i) => api.timeout(() => f.talk(true), 200 + i * 130));
        await api.wait(2300);
        cap.classList.add('out');
        // someone hits the switch
        A.sfx('tick', { f: 1400, g: 0.16 });
        const flick = U.reducedMotion ? [[true, 0]] : [[true, 70], [false, 90], [true, 45], [false, 170], [true, 60], [false, 50], [true, 0]];
        for (const [on, ms] of flick) { setLights(on, true); if (on) A.sfx('tick', { f: 2200, g: 0.06 }); if (ms) await api.wait(ms); }
        if (A.ready) A.tone({ f: 120, type: 'sawtooth', dur: 1.6, a: 0.02, r: 0.6, g: 0.025, filter: { type: 'lowpass', f: 500 } });
        LT.music.param('level', 1);
        murmur.set && murmur.set(0.6);
        Object.values(figs).forEach((f) => { f.talk(false); });
        figs.dale && figs.dale.mood('shock'); figs.grandma && figs.grandma.mood('mad'); figs.maya && figs.maya.mood('sad');
        api.timeout(() => { say('grandma', 'WHO turned on the BIG light?', { ms: 1700 }); }, 200);
        api.timeout(() => { say('mom', 'So we can SEE, Mother.', { ms: 1500 }); Object.values(figs).forEach((f) => f.mood('neutral')); }, 1300);
        cap.remove();
        await api.wait(2600);
        return introCard();
      }

      function startGame() {
        G.state = 'play';
        hud.hidden = false; bingoWrap.hidden = false;
        hud.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 500 });
        bingoWrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
        sizzle = api.sound(A.sfx('sizzle', { g: 0.18 }));
        sizzle.set && sizzle.set(0);
        G.spawnT = 0.8;
        api.timeout(() => startIncident('dog'), 9000);
      }

      function spawn() {
        const k = G.g / DURATION;
        const maxB = (U.isTouch ? 3 : 4) * (k < 0.25 ? 0.5 : k < 0.55 ? 0.75 : 1);
        const incP = 0.24 + 0.2 * k;
        const nInc = Object.keys(G.incidents).length;
        if (Math.random() < incP && nInc < (k < 0.5 ? 1 : 2)) {
          const types = U.shuffle(Object.keys(INCIDENTS)).filter((t) => !G.incidents[t] && (INCIDENTS[t].minG || 0) <= G.g);
          for (const t of types) if (startIncident(t)) return;
        }
        if (G.bubbles.length < Math.max(1, Math.round(maxB))) spawnLandmine();
      }

      api.frame((dt) => {
        if (G.state !== 'play') return;
        G.g += dt;
        temp(dt * 0.3);
        // landmines and incidents
        for (const b of G.bubbles.slice()) updateLandmine(b, dt);
        for (const i of Object.values(G.incidents)) {
          i.t += dt;
          const k = U.clamp(i.t / i.dur, 0, 1);
          i.fg.style.strokeDashoffset = (k * 100).toFixed(1);
          i.def.tick && i.def.tick(i, k, dt);
          if (k >= 1) failIncident(i);
        }
        G.spawnT -= dt;
        if (G.spawnT <= 0) { spawn(); const k = G.g / DURATION; G.spawnT = U.lerp(2.9, 1.35, k) * U.rand(0.75, 1.25); }
        // the room heats up
        const tens = U.clamp((G.temp - T_START) / (T_DONE - T_START), 0, 1);
        thermo.set(G.temp);
        if (refs.popup) { const h = 2 + tens * 16; refs.popup.setAttribute('height', h); refs.popup.setAttribute('y', -94 - h + 2); refs.popupCap.setAttribute('y', -96 - h + 2); }
        if (refs.heat) refs.heat.setAttribute('opacity', (Math.max(0, tens - 0.55) * 0.22).toFixed(3));
        G.musicT -= dt;
        if (G.musicT <= 0) {
          G.musicT = 0.25;
          LT.music.param('tension', tens);
          murmur && murmur.set && murmur.set(0.5 + tens * 1.3);
          sizzle && sizzle.set && sizzle.set(Math.min(1, G.bubbles.length * 0.4));
          if (tens > 0.7 && seatsById.dale && !U.reducedMotion && Math.random() < 0.5) { const h = headOf('dale'); const p = pt(h.x, h.y - 10); LT.fx.steam(p.x, p.y, { count: 2, color: 'rgba(255,255,255,.25)' }); }
          if (Math.floor(tens * 10) !== G.lastTens) {
            G.lastTens = Math.floor(tens * 10);
            Object.entries(figs).forEach(([id, f]) => { if (!G.bubbles.some((b) => b.lm.who === id)) f.mood(moodFor(id)); });
            if (G.temp > 145) A.sfx('heartbeat');
          }
        }
        // the clock
        const mins = 1080 + (G.g / DURATION) * 90;
        const hh = Math.floor(mins / 60), mm = Math.floor(mins % 60);
        clockEl.firstChild.textContent = `${hh - 12}:${String(mm).padStart(2, '0')}`;
        clockBar.style.transform = `scaleX(${U.clamp(G.g / DURATION, 0, 1).toFixed(3)})`;
        if (refs.hourHand) {
          const c = refs.clock;
          refs.hourHand.setAttribute('transform', `rotate(${(((hh % 12) + mm / 60) * 30).toFixed(1)} ${c.x} ${c.y})`);
          refs.minHand.setAttribute('transform', `rotate(${(mm * 6).toFixed(1)} ${c.x} ${c.y})`);
        }
        if (G.temp >= T_DONE) chaosEnding();
        else if (G.g >= DURATION) surviveEnding();
      });

      /* ---------- endings ---------- */
      function stopGame() {
        G.state = 'ending';
        clearBubbles(false);
        clearIncidents(false);
        sizzle && sizzle.stop && sizzle.stop(0.2);
        skipBtn.hidden = true;
        LT.stats.set('tableHighTemp', Math.max(LT.stats.get('tableHighTemp'), Math.round(G.maxTemp)));
      }

      async function chaosEnding(skipped) {
        if (G.state === 'ending' || G.state === 'toast') return;
        stopGame();
        LT.state.tableOutcome = 'chaos'; LT.save();
        LT.stats.inc('dinnersExploded');
        G.temp = T_DONE; thermo.set(T_DONE);
        if (refs.popup) { refs.popup.setAttribute('height', 24); refs.popup.setAttribute('y', -116); refs.popupCap.setAttribute('y', -118); }
        const tp = pt(refs.turkey.x, refs.turkey.y - 60);
        A.sfx('boing'); A.sfx('pop', { f: 700, g: 0.4 });
        LT.fx.float(tp.x, tp.y - 20, skipped ? 'You left. It went like this.' : '165°F. DONE.', { size: 34, color: '#ff6a3a', life: 2 });
        await api.wait(450);
        // TOTAL CHAOS
        G.state = 'ending';
        root.classList.add('tb-chaos');
        LT.music.param('tension', 1);
        A.sfx('boom', { g: 0.7 });
        LT.fx.flash('#ffd0a0', 0.4);
        const alarm = api.sound(A.sfx('alarm', { g: 0.09 }));
        const ring = api.sound(A.sfx('ringtone', { g: 0.07 }));
        murmur && murmur.set && murmur.set(2.4);
        refs.alarmLed && refs.alarmLed.classList.add('on');
        refs.phoneScreen && refs.phoneScreen.classList.add('blare');
        Object.entries(figs).forEach(([id, f]) => { f.talk(true); f.mood(U.pick(['mad', 'shock', 'mad', 'grin'])); if (id !== 'benji') f.arms(U.rand(20, 80), U.rand(-140, -60)); });
        figs.benji && figs.benji.mood('grin').arms(null, -160);
        // Biscuit seizes the moment
        const tk = refs.turkey;
        moveDog(tk.x + 10 - refs.dogHome.x, tk.top + 30 - refs.dogHome.y, 0.7, 0.8);
        dogApi.mood('happy'); dogApi.wag(3); A.sfx('bark');
        const seats = Object.keys(figs);
        const t0 = performance.now();
        let n = 0;
        while (performance.now() - t0 < 3600 && api.alive) {
          const who = U.pick(seats);
          say(who, U.pick(CHAOS_LINES), { ms: 900, cls: 'chaos', silent: n % 2 === 1, keepTalking: true });
          if (n % 3 === 0) { const p = pt(U.rand(L.vb[2] * 0.1, L.vb[2] * 0.9), U.rand(L.vb[3] * 0.25, L.vb[3] * 0.8)); LT.fx.splat(p.x, p.y, { color: U.pick(['#6b3f1d', '#7d1a2c', '#5d7d33', '#e9d6b4']), size: U.rand(70, 150), life: 6 }); A.sfx('splat', { g: 0.3 }); }
          if (n % 4 === 1) { LT.fx.shake(10, 0.4); const p = pt(refs.door.x, refs.door.y); LT.fx.smoke(p.x, p.y, { count: 6, color: 'rgba(70,64,58,.45)', scale: 1.6 }); }
          if (n % 5 === 2) { const b = pt(headOf('benji').x, headOf('benji').y); LT.fx.burst(b.x, b.y, { count: 14, colors: ['#6aa84f'], speed: [200, 500], gravity: 700, size: [3, 4.5], shrink: false, angle: -Math.PI / 2, spread: 1.2 }); }
          if (n === 6) { A.sfx('crack'); stain(refs.spill ? refs.spill.x : L.vb[2] / 2, refs.spill ? refs.spill.table : L.bands[0].tables[0], '#7d1a2c'); }
          n++;
          await api.wait(U.reducedMotion ? 450 : 240);
        }
        if (!api.alive) return;
        // ...record scratch.
        A.sfx('scratch', { g: 0.4 });
        alarm && alarm.stop && alarm.stop(0.03);
        ring && ring.stop && ring.stop(0.03);
        murmur && murmur.stop && murmur.stop(0.05);
        LT.music.stop(0.06);
        refs.alarmLed && refs.alarmLed.classList.remove('on');
        // freeze frame: swap in a dead copy of the room
        const frozen = svg.cloneNode(true);
        frozen.classList.add('tb-frozen');
        sceneBox.appendChild(frozen);
        svg.style.visibility = 'hidden';
        layer.classList.add('frozen');
        root.classList.remove('tb-chaos');
        LT.fx.flash('#ffffff', 0.25);
        const cap = el('div', { class: 'tb-freeze-cap' }, el('span', { class: 'y' }, 'Yep.'), el('span', { class: 'u' }, 'That’s us.'));
        overlay.appendChild(cap);
        await api.wait(3200);
        cap.classList.add('out');
        layer.querySelectorAll('.tb-bubble').forEach((n) => n.remove());
        layer.classList.remove('frozen');
        frozen.remove();
        svg.style.visibility = '';
        await api.wait(300);
        cap.remove();
        aftermath('chaos');
      }

      async function surviveEnding() {
        if (G.state === 'ending' || G.state === 'toast') return;
        stopGame();
        LT.state.tableOutcome = 'survived'; LT.save();
        LT.stats.inc('dinnersSurvived');
        clockEl.firstChild.textContent = '7:30';
        A.sfx('ding');
        LT.music.param('tension', 0.15);
        say('mom', 'PIE!', { ms: 1600, big: true });
        // the pie arrives
        const tk = refs.turkey;
        const pieIn = S('g', null, D.pie());
        const pie = at(tk.x + (L === WIDE ? 165 : -175), tk.top + 44, tk.s, pieIn);
        refs.turkeyG.parentNode.appendChild(pie);
        pieIn.animate([{ transform: 'translateY(-420px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        Object.values(figs).forEach((f) => f.mood('grin'));
        dogApi.mood('happy');
        A.sfx('cheer', { dur: 2.6 }); A.sfx('tada');
        const W = innerWidth;
        [0.2, 0.5, 0.8].forEach((x, i) => api.timeout(() => LT.fx.confetti(W * x, innerHeight * 0.75, { count: 70 }), i * 180));
        await api.wait(1500);
        // a certificate, signed in Grandma's hand
        const ok = el('button', { class: 'lt-btn lt-btn--ink', type: 'button' }, 'Accept the promotion');
        const cert = el('div', { class: 'tb-cert lt-card', role: 'dialog', 'aria-label': 'Certificate of promotion' },
          el('div', { class: 'k' }, 'Certificate of Promotion'),
          el('h2', null, 'Kids’ Table ', el('i', null, 'Graduate')),
          el('p', null, `This certifies that you survived Thanksgiving dinner with this family. You changed the subject ${G.defused} time${G.defused === 1 ? '' : 's'}, handled ${G.handled} incident${G.handled === 1 ? '' : 's'}, and kept the room at ${Math.round(G.maxTemp)}°F.`),
          el('p', { class: 'big' }, 'You are hereby promoted from the kids’ table. Effective next year. Bring a dish.'),
          el('div', { class: 'sig' }, el('span', { class: 'lt-script' }, 'Ruth'), el('small', null, 'Grandma Ruth · Head of the Table')),
          el('div', { class: 'seal', 'aria-hidden': 'true' }, 'R'),
          miniBingo(),
          ok);
        overlay.appendChild(cert);
        cert.animate([{ transform: 'translateY(40px) rotate(4deg) scale(.9)', opacity: 0 }, { transform: 'rotate(-1deg)', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' });
        A.sfx('paper');
        ok.focus({ preventScroll: true });
        await new Promise((res) => ok.addEventListener('click', res, { once: true }));
        A.sfx('clink');
        cert.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-30px) rotate(-3deg)' }], { duration: 400, fill: 'forwards' }).onfinish = () => cert.remove();
        aftermath('survived');
      }
      function miniBingo() {
        const g = el('div', { class: 'tb-minibingo', 'aria-label': 'Family bingo results' });
        BINGO.forEach((lab, i) => g.appendChild(el('div', { class: 'c' + (G.bingo.has(i) ? ' on' : '') }, el('span', null, lab))));
        return el('div', { class: 'tb-minibingo-wrap' }, el('div', { class: 'k' }, 'Family Bingo'), g);
      }

      /* ---------- after it all: the glass ---------- */
      async function aftermath(outcome) {
        G.state = 'toast';
        [hud, bingoWrap].forEach((n) => { n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' }).onfinish = () => { n.hidden = true; }; });
        murmur && murmur.stop && murmur.stop(1.8);
        LT.music.stop(2.5);
        layer.querySelectorAll('.tb-slip, .tb-you').forEach((n) => n.remove());
        Object.values(figs).forEach((f) => { f.talk(false); f.rest(); f.mood('neutral'); });
        if (outcome === 'chaos') { dogApi.mood('guilty'); dogApi.wag(0.3); } else { dogApi.mood('beg'); dogApi.wag(1); }
        // candlelight again
        await api.wait(400);
        setLights(false);
        LT.light.set({ darkness: 0.74, radius: 460 });
        const gh = headOf('grandma'), gp = pt(gh.x, gh.y + 120);
        if (!LT.pointer.active || U.isTouch) { LT.light.follow(false); LT.light.moveTo(gp.x, gp.y); }
        await api.wait(1800);
        // Grandma lifts her glass
        const g = figs.grandma;
        if (g) {
          const armR = g.el.querySelectorAll('.fam-arm')[1];
          armR && armR.appendChild(S('g', { transform: 'translate(4,90) rotate(128)' }, D.glass(true)));
          g.arms(null, -128).mood('tender');
          everyoneLooksAt('grandma');
          Object.entries(figs).forEach(([id, f]) => { if (id !== 'grandma') f.mood(id === 'maya' ? 'neutral' : 'tender'); });
        }
        await api.wait(700);
        const gs = seatsById.grandma, gsc = gs ? gs.s * LT.family.get('grandma').scale : 1;
        for (let i = 0; i < 3; i++) {
          A.sfx('ting', { f: 2280 + i * 8, g: 0.16 });
          const p = gs ? pt(gs.x + 118 * gsc, gs.oy - 205 * gsc) : pt(gh.x, gh.y);
          LT.fx.glow(p.x, p.y, { size: 18, size2: 40, life: 0.4 });
          await api.wait(420);
        }
        await api.wait(700);
        const b = say('grandma', '', { ms: 0, big: true, silent: true, keepTalking: true });
        const text = b.el.querySelector('.tb-text');
        await U.type(text, 'Before pie...', 22, () => {});
        babble('grandma', 4);
        await api.wait(900);
        const rest = el('span', null);
        text.appendChild(document.createTextNode(' '));
        text.appendChild(rest);
        babble('grandma', 10);
        await U.type(rest, "let's go around the table and say what we're thankful for.", 30);
        g && g.talk(false);
        await api.wait(1300);
        if (!api.alive) return;
        say('maya', 'every year.', { ms: 1500, dx: 0 });
        await api.wait(1400);
        g && g.talk(true);
        const rep = say('grandma', 'Every year.', { ms: 1800 });
        await api.wait(1700);
        b.kill();
        if (!api.alive) return;
        LT.light.follow(true);
        const replay = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button', on: { click: () => LT.go('table', { transition: 'cut' }) } }, outcome === 'chaos' ? 'Try dinner again' : 'Play dinner again');
        const fin = el('div', { class: 'tb-final' }, api.nextButton('Go around the table'), replay);
        overlay.appendChild(fin);
        fin.animate([{ opacity: 0, transform: 'translate(-50%, 16px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
        fin.querySelector('.lt-next').focus({ preventScroll: true });
      }

      api.on(skipBtn, 'click', () => { if (G.state === 'play') chaosEnding(true); });

      // and... action.
      (async () => {
        await api.wait(350);
        const choice = await coldOpen();
        if (!api.alive) return;
        if (choice === 'skip') { G.state = 'play'; hud.hidden = false; bingoWrap.hidden = false; G.g = 0; chaosEnding(true); return; }
        startGame();
      })();
    },
  });
})();
