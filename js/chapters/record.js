/* Course I — The Record. What actually happened in 1621, and in the 405 years after. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el, A = LT.audio;
  const VB_W = 1200, VB_H = 760;
  const INK = '#3b2414', RED = '#a3271f';
  const FELL = "'IM Fell Double Pica', Georgia, serif";
  const FELLSC = "'IM Fell English SC', Georgia, serif";
  const HAND = "Caveat, 'Segoe Print', cursive";

  LT.defineEgg('franksgiving', 'Franksgiving', 'Argue with the 1939 calendars.');
  LT.defineEgg('little-lamb', 'Mary had a little lamb', 'Someone on Sarah Hale’s desk wants attention.');

  /* Small sounds made from the core primitives. */
  const snd = {
    ok: () => A.ready && !A.muted,
    pen() { if (!snd.ok()) return; A.noise({ dur: 0.035, a: 0.002, g: 0.045, filters: [{ type: 'bandpass', f: U.rand(2800, 4200), q: 2.5 }] }); },
    tick() { if (!snd.ok()) return; A.tone({ f: U.rand(1650, 1850), dur: 0.02, a: 0.001, g: 0.022, type: 'triangle' }); },
    breath() { if (!snd.ok()) return; A.noise({ dur: 0.3, a: 0.04, g: 0.022, color: 'pink', filters: [{ type: 'bandpass', f: 800, q: 0.7 }] }); },
    note(n, g = 0.1, dur = 1.6) { if (!snd.ok()) return; const f = A.mtof(n); A.tone({ f, dur, a: 0.003, g, rev: 0.45 }); A.tone({ f: f * 3, dur: dur * 0.3, a: 0.002, g: g * 0.12, rev: 0.4 }); },
  };

  /* ================================================================
     THE POSTCARD
     ================================================================ */
  const NOTES = [
    { x: 460, y: 296, k: 'No buckles', t: 'Buckles weren’t fashionable until later in the 1600s. The buckled hats and shoes came from 19th-century illustrators.' },
    { x: 740, y: 440, k: 'They wore color', t: 'Their belongings list russet, green, red, even violet clothes. Black dye was expensive, saved for Sunday best.' },
    { x: 1080, y: 600, k: 'The guests outnumbered the hosts', t: 'The postcard puts two guests at the edge. Massasoit came with about ninety men. There were about fifty English.' },
    { x: 600, y: 495, k: 'Fowl, and five deer', t: 'Four men went fowling and brought back enough birds to feed everyone for almost a week. Maybe turkey; Winslow just says fowl. The Wampanoag went out and killed five deer, and gave them to the governor and others.' },
    { x: 420, y: 532, k: 'No pie', t: 'No ovens, no butter, little wheat flour. Pumpkins, maybe. Pie, no.' },
    { x: 600, y: 112, k: 'Nobody called it Thanksgiving', t: 'To the English, a day of thanksgiving meant prayer and church, not a feast. This was a harvest celebration. The name came much later.' },
    { x: 905, y: 430, k: 'Invited?', t: 'Winslow never says the Wampanoag were invited. He does say the English were “exercising their arms.” One theory: Massasoit heard the guns and came to see what was going on.' },
    { x: 960, y: 262, k: 'Three days', t: 'Not an afternoon. Three days, sometime in the fall of 1621. Nobody wrote down the date.' },
  ];

  function mythSVG() {
    const C = { x: 960, y: 250 };
    let rays = '';
    for (let i = 0; i < 28; i += 2) {
      const a0 = (i / 28) * Math.PI * 2, a1 = ((i + 1) / 28) * Math.PI * 2, R = 1600;
      rays += `<path d="M${C.x} ${C.y}L${(C.x + Math.cos(a0) * R) | 0} ${(C.y + Math.sin(a0) * R) | 0}L${(C.x + Math.cos(a1) * R) | 0} ${(C.y + Math.sin(a1) * R) | 0}Z"/>`;
    }
    const tree = (x, y, r, c) => `<rect x="${x - 5}" y="${y}" width="10" height="${(r * 1.3) | 0}" fill="#5a3418"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r * 0.45}" cy="${y + r * 0.2}" r="${r * 0.62}" fill="${c}"/><circle cx="${x + r * 0.5}" cy="${y + r * 0.15}" r="${r * 0.58}" fill="${c}"/><circle cx="${x - r * 0.2}" cy="${y - r * 0.35}" r="${r * 0.45}" fill="#fff" opacity=".16"/>`;
    const SK = '#f6c7a0';
    const face = (x, y) => `<circle cx="${x}" cy="${y}" r="24" fill="${SK}"/><circle cx="${x - 12}" cy="${y + 8}" r="6" fill="#ff6b5a" opacity=".45"/><circle cx="${x + 12}" cy="${y + 8}" r="6" fill="#ff6b5a" opacity=".45"/><circle cx="${x - 8}" cy="${y - 2}" r="2.8" fill="#2a1a10"/><circle cx="${x + 8}" cy="${y - 2}" r="2.8" fill="#2a1a10"/><path d="M${x - 10} ${y + 9}Q${x} ${y + 19} ${x + 10} ${y + 9}" stroke="#8a2a1a" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
    const hat = (x, y) => `<ellipse cx="${x}" cy="${y - 19}" rx="42" ry="9" fill="#121014"/><path d="M${x - 22} ${y - 20}L${x - 18} ${y - 78}Q${x} ${y - 84} ${x + 18} ${y - 78}L${x + 22} ${y - 20}Z" fill="#1d1a20"/><rect x="${x - 21}" y="${y - 36}" width="42" height="11" fill="#3b3442"/><rect x="${x - 11}" y="${y - 40}" width="22" height="18" rx="2" fill="#f5c542" stroke="#a87412" stroke-width="2.4"/><rect x="${x - 5}" y="${y - 34}" width="10" height="7" fill="#3b3442"/><path d="M${x - 15} ${y - 70}Q${x - 13} ${y - 52} ${x - 14} ${y - 40}" stroke="#fff" stroke-width="3" opacity=".14" fill="none"/>`;
    const man = (x, y, o = {}) => {
      const coat = o.coat || '#1d1a21';
      const armR = o.reach
        ? `<path d="M${x + 26} ${y + 50}Q${x + 70} ${y + 64} ${x + 106} ${y + 72}" stroke="${coat}" stroke-width="18" fill="none" stroke-linecap="round"/><rect x="${x + 96}" y="${y + 62}" width="12" height="20" rx="3" fill="#fffaf0"/><circle cx="${x + 116}" cy="${y + 72}" r="10" fill="${SK}"/>`
        : `<path d="M${x + 28} ${y + 50}Q${x + 46} ${y + 110} ${x + 30} ${y + 158}" stroke="${coat}" stroke-width="18" fill="none" stroke-linecap="round"/><circle cx="${x + 28}" cy="${y + 166}" r="10" fill="${SK}"/>`;
      return `<g><path d="M${x - 38} 545L${x - 30} ${y + 40}Q${x} ${y + 28} ${x + 30} ${y + 40}L${x + 38} 545Z" fill="${coat}"/>
        <path d="M${x - 28} ${y + 50}Q${x - 46} ${y + 110} ${x - 30} ${y + 158}" stroke="${coat}" stroke-width="18" fill="none" stroke-linecap="round"/><circle cx="${x - 28}" cy="${y + 166}" r="10" fill="${SK}"/>
        ${armR}
        <circle cx="${x}" cy="${y + 96}" r="3.2" fill="#c9a24a"/><circle cx="${x}" cy="${y + 116}" r="3.2" fill="#c9a24a"/><circle cx="${x}" cy="${y + 136}" r="3.2" fill="#c9a24a"/>
        <rect x="${x - 8}" y="${y + 18}" width="16" height="16" fill="#e8b48e"/>
        <path d="M${x - 36} ${y + 38}Q${x} ${y + 28} ${x + 36} ${y + 38}Q${x + 28} ${y + 72} ${x} ${y + 76}Q${x - 28} ${y + 72} ${x - 36} ${y + 38}Z" fill="#fffaf0" stroke="#d9cfbc" stroke-width="1.5"/>
        ${face(x, y)}
        <path d="M${x - 24} ${y - 4}Q${x - 30} ${y + 14} ${x - 20} ${y + 22}M${x + 24} ${y - 4}Q${x + 30} ${y + 14} ${x + 20} ${y + 22}" stroke="${o.hair || '#6b3e1f'}" stroke-width="7" fill="none" stroke-linecap="round"/>
        ${hat(x, y)}</g>`;
    };
    const woman = (x, y) => `<g><path d="M${x - 36} 545L${x - 28} ${y + 40}Q${x} ${y + 30} ${x + 28} ${y + 40}L${x + 36} 545Z" fill="#4a4652"/>
      <path d="M${x - 22} ${y + 60}L${x + 22} ${y + 60}L${x + 28} 545L${x - 28} 545Z" fill="#fffaf0"/>
      <path d="M${x - 30} ${y + 38}Q${x} ${y + 28} ${x + 30} ${y + 38}L${x + 18} ${y + 62}L${x - 18} ${y + 62}Z" fill="#fffaf0" stroke="#d9cfbc"/>
      <rect x="${x - 8}" y="${y + 18}" width="16" height="16" fill="#e8b48e"/>
      ${face(x, y)}
      <path d="M${x - 26} ${y + 8}Q${x - 31} ${y - 31} ${x} ${y - 31}Q${x + 31} ${y - 31} ${x + 26} ${y + 8}Q${x + 20} ${y - 13} ${x} ${y - 15}Q${x - 20} ${y - 13} ${x - 26} ${y + 8}Z" fill="#fffaf0" stroke="#d9cfbc" stroke-width="1.5"/>
      <path d="M${x - 30} ${y + 52}Q${x - 22} ${y + 102} ${x - 6} ${y + 110}M${x + 30} ${y + 52}Q${x + 22} ${y + 102} ${x + 6} ${y + 110}" stroke="#4a4652" stroke-width="16" fill="none" stroke-linecap="round"/>
      <ellipse cx="${x}" cy="${y + 112}" rx="42" ry="12" fill="#d39a52"/><ellipse cx="${x}" cy="${y + 110}" rx="35" ry="8" fill="#e0661c"/><circle cx="${x - 8}" cy="${y + 104}" r="7" fill="#fffaf0"/>
      <circle cx="${x - 20}" cy="${y + 116}" r="9" fill="${SK}"/><circle cx="${x + 20}" cy="${y + 116}" r="9" fill="${SK}"/></g>`;
    const guest = (x, y, s, basket) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="30" ry="9" fill="#5e3820"/><path d="M-18 0Q-24 -40 -10 -64L12 -64Q24 -40 20 0Z" fill="#7b4a2b"/><circle cx="0" cy="-80" r="15" fill="#8a5634"/><path d="M-14 -88Q-20 -64 -14 -50M14 -88Q20 -64 14 -50" stroke="#20140c" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-15 -86Q0 -100 15 -86" stroke="#20140c" stroke-width="8" fill="none"/>${basket ? `<path d="M-46 -34L-14 -34L-18 -8L-42 -8Z" fill="#c99a4a" stroke="#7a5420" stroke-width="2"/><ellipse cx="-38" cy="-38" rx="5" ry="10" fill="#f2c94c" transform="rotate(-20 -38 -38)"/><ellipse cx="-26" cy="-40" rx="5" ry="10" fill="#f2c94c" transform="rotate(15 -26 -40)"/>` : ''}</g>`;
    let drape = 'M260 548L940 548L940 610';
    for (let x = 940; x > 260; x -= 40) drape += `Q${x - 20} 636 ${x - 40} 610`;
    drape += 'Z';
    let folds = '';
    for (let x = 300; x < 940; x += 40) folds += `<path d="M${x} 552L${x} 612" stroke="#e7dcc4" stroke-width="2"/>`;
    const pie = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="44" ry="14" fill="#c98b45"/><ellipse cx="${x}" cy="${y - 2}" rx="37" ry="9" fill="#e0661c"/><path d="M${x - 37} ${y - 2}Q${x} ${y + 10} ${x + 37} ${y - 2}" stroke="#a8541a" stroke-width="2" fill="none"/><circle cx="${x + 6}" cy="${y - 6}" r="7" fill="#fffaf0"/>`;
    return `<svg viewBox="0 0 1200 760" class="rec-pc-svg" aria-hidden="true">
      <defs>
        <linearGradient id="rec-m-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6f2a"/><stop offset=".5" stop-color="#ffb43c"/><stop offset="1" stop-color="#ffe49a"/></linearGradient>
        <linearGradient id="rec-m-field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b13e"/><stop offset="1" stop-color="#8a6a1e"/></linearGradient>
        <linearGradient id="rec-m-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7dc7a"/><stop offset=".3" stop-color="#b8862a"/><stop offset=".55" stop-color="#fbe9a8"/><stop offset=".8" stop-color="#a5741c"/><stop offset="1" stop-color="#f3d777"/></linearGradient>
        <radialGradient id="rec-m-turkey" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#d98a3a"/><stop offset=".6" stop-color="#a5521c"/><stop offset="1" stop-color="#6b2f0e"/></radialGradient>
        <radialGradient id="rec-m-sun"><stop offset="0" stop-color="#fffbe0"/><stop offset=".55" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffb43c" stop-opacity="0"/></radialGradient>
        <pattern id="rec-m-dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.2" fill="#6a1c00" opacity=".16"/></pattern>
        <clipPath id="rec-m-clip"><rect x="34" y="34" width="1132" height="692" rx="14"/></clipPath>
      </defs>
      <rect width="1200" height="760" fill="#f6ecd6"/>
      <rect x="18" y="18" width="1164" height="724" rx="22" fill="url(#rec-m-gold)"/>
      <g clip-path="url(#rec-m-clip)">
        <rect x="34" y="34" width="1132" height="692" fill="url(#rec-m-sky)"/>
        <g fill="#fff" opacity=".17">${rays}</g>
        <circle cx="960" cy="250" r="150" fill="url(#rec-m-sun)"/>
        <circle cx="960" cy="250" r="64" fill="#fff3b8"/>
        <path d="M34 450C200 384 380 412 520 402C700 388 900 352 1166 412L1166 470L34 470Z" fill="#8ea13c"/>
        <path d="M34 470C260 420 520 446 760 430C900 420 1040 430 1166 446L1166 480L34 480Z" fill="#a9b84a"/>
        ${tree(250, 404, 36, '#d9541e')}${tree(212, 418, 26, '#e8a21c')}${tree(1062, 398, 40, '#c8401e')}${tree(1124, 412, 30, '#e8b21c')}${tree(1010, 418, 24, '#d97a1c')}
        <g>
          <path d="M100 360L150 318L200 360Z" fill="#6b3a1e"/>
          <rect x="96" y="358" width="108" height="78" fill="#8a5428"/>
          <g stroke="#5a3418" stroke-width="3">${[372, 386, 400, 414, 428].map((y) => `<path d="M96 ${y}H204"/>`).join('')}</g>
          <rect x="140" y="392" width="22" height="44" fill="#4a2a14"/><rect x="170" y="374" width="20" height="16" fill="#ffd27a"/>
          <rect x="176" y="326" width="14" height="30" fill="#6b4a3a"/>
          <circle cx="186" cy="312" r="10" fill="#efe6d2" opacity=".75"/><circle cx="196" cy="296" r="13" fill="#efe6d2" opacity=".6"/><circle cx="212" cy="276" r="16" fill="#efe6d2" opacity=".45"/>
        </g>
        <rect x="34" y="470" width="1132" height="256" fill="url(#rec-m-field)"/>
        ${woman(330, 342)}
        ${man(460, 328)}
        ${man(740, 330, { coat: '#211d24', hair: '#3a2414' })}
        ${man(860, 336, { reach: true })}
        <rect x="300" y="600" width="16" height="100" fill="#5a3418"/><rect x="884" y="600" width="16" height="100" fill="#5a3418"/>
        <path d="M280 520L920 520L940 548L260 548Z" fill="#fffdf6" stroke="#e1d6bd" stroke-width="2"/>
        <path d="${drape}" fill="#fffaf0" stroke="#e1d6bd" stroke-width="2"/>${folds}
        <ellipse cx="600" cy="534" rx="118" ry="20" fill="#d4d8dc" stroke="#9aa0a6" stroke-width="2"/>
        <ellipse cx="600" cy="498" rx="80" ry="46" fill="url(#rec-m-turkey)"/>
        <ellipse cx="578" cy="478" rx="30" ry="12" fill="#fff" opacity=".25"/>
        <ellipse cx="530" cy="512" rx="26" ry="15" fill="#9a4a1a" transform="rotate(-25 530 512)"/><circle cx="510" cy="500" r="7" fill="#fffaf0"/>
        <ellipse cx="670" cy="512" rx="26" ry="15" fill="#9a4a1a" transform="rotate(25 670 512)"/><circle cx="690" cy="500" r="7" fill="#fffaf0"/>
        <g fill="#3f8a2e">${[[500, 530], [516, 538], [684, 538], [700, 530], [600, 548]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8"/>`).join('')}</g>
        ${pie(420, 532)}${pie(790, 532)}
        <g><circle cx="318" cy="512" r="22" fill="#e0661c"/><circle cx="338" cy="510" r="24" fill="#f07a26"/><circle cx="356" cy="514" r="20" fill="#e0661c"/><rect x="334" y="482" width="7" height="12" rx="2" fill="#4a6a22"/></g>
        <g><ellipse cx="868" cy="524" rx="30" ry="9" fill="#f2c94c" transform="rotate(-12 868 524)"/><path d="M840 532Q860 512 886 520" stroke="#6a8a2a" stroke-width="7" fill="none"/></g>
        ${guest(1060, 650, 1.05, true)}${guest(1126, 662, 0.92, false)}
        <rect x="34" y="34" width="1132" height="692" fill="url(#rec-m-dots)"/>
      </g>
      <g opacity=".55" fill="none" stroke="#3a2260" stroke-width="2.4">
        <circle cx="140" cy="128" r="56"/><circle cx="140" cy="128" r="44"/>
        <path d="M206 108q22 -14 44 0t44 0t44 0M206 128q22 -14 44 0t44 0t44 0M206 148q22 -14 44 0t44 0t44 0"/>
        <text x="140" y="120" text-anchor="middle" font-family="${FELLSC}" font-size="15" fill="#3a2260" stroke="none" letter-spacing="2">PLYMOUTH</text>
        <text x="140" y="146" text-anchor="middle" font-family="${FELL}" font-size="22" fill="#3a2260" stroke="none">1621</text>
      </g>
      <g>
        <path d="M250 72L300 60L900 60L950 72L930 116L950 162L900 152L300 152L250 162L270 116Z" fill="#b8102e" stroke="#f7dc7a" stroke-width="5" stroke-linejoin="round"/>
        <text x="600" y="96" text-anchor="middle" font-family="${FELL}" font-style="italic" font-size="28" fill="#f9e7a1">Greetings from the</text>
        <text x="600" y="142" text-anchor="middle" font-family="${FELL}" font-size="54" fill="#fff6dc" stroke="#5a0a14" stroke-width="7" paint-order="stroke" stroke-linejoin="round">First Thanksgiving!</text>
      </g>
    </svg>`;
  }

  function recordSVG() {
    const I = INK, R = RED;
    const hand = (x, y, size, txt, o = {}) => `<text x="${x}" y="${y}" font-family="${HAND}" font-weight="700" font-size="${size}" fill="${o.c || R}" text-anchor="${o.a || 'middle'}" stroke="#eadcbf" stroke-width="6" paint-order="stroke" stroke-linejoin="round"${o.r ? ` transform="rotate(${o.r} ${x} ${y})"` : ''}>${txt}</text>`;
    const fig = (x, y, s, wash, eng) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${I}" stroke-width="${(2 / s).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"><path d="M-12 0L-10 -42Q0 -48 10 -42L12 0Z" fill="${wash}" fill-opacity=".62"/><circle cx="0" cy="-54" r="8.5" fill="#eadcbf"/>${eng ? '<path d="M-13 -60H13M-8 -60L-7 -74H7L8 -60" fill="#eadcbf"/>' : '<path d="M-7 -60Q0 -66 7 -60M0 -63L3 -70" fill="none"/>'}<path d="M-6 0V13M6 0V13" fill="none"/></g>`;
    const deer = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${I}" stroke="${I}" stroke-width="1.4" stroke-linecap="round"><ellipse cx="0" cy="0" rx="16" ry="7.5"/><path d="M11 -4L19 -15L24 -15L26 -11L20 -9L16 0Z"/><path d="M-12 4L-14 17M-6 6V17M8 6L9 17M13 4L15 17M20 -15L17 -25M21 -15L26 -24M18 -21L14 -23M-16 -2L-21 -6" fill="none" stroke-width="2.2"/></g>`;
    const sun = (x, y) => `<g stroke="${I}" stroke-width="2" fill="none"><circle cx="${x}" cy="${y}" r="13"/>${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<path d="M${(x + Math.cos(a) * 18).toFixed(1)} ${(y + Math.sin(a) * 18).toFixed(1)}L${(x + Math.cos(a) * 25).toFixed(1)} ${(y + Math.sin(a) * 25).toFixed(1)}"/>`; }).join('')}</g>`;
    const rnd = U.seeded(90);
    let crowd = '';
    for (let i = 0; i < 30; i++) {
      const row = i % 4, x = 868 + rnd() * 290, y = 520 + row * 44 + rnd() * 18;
      crowd += fig(x.toFixed(0), y.toFixed(0), (0.85 + row * 0.1).toFixed(2), rnd() < 0.5 ? '#a77a4f' : '#8a5a33', false);
    }
    const english = [[280, 515, '#9b4a24'], [305, 500, '#4e6b35'], [332, 516, '#6b4a7a'], [356, 503, '#7a5a3a'], [515, 510, '#a3271f'], [540, 500, '#4e6b35'], [690, 512, '#7a5a3a'], [800, 505, '#6b4a7a']].map(([x, y, c]) => fig(x, y, 1.05, c, true)).join('');
    let rules = '';
    for (let y = 70; y < 740; y += 38) rules += `<path d="M30 ${y}H1170"/>`;
    return `<svg viewBox="0 0 1200 760" class="rec-pc-svg" aria-hidden="true">
      <defs>
        <pattern id="rec-r-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V8" stroke="${I}" stroke-width="1" opacity=".3"/></pattern>
      </defs>
      <rect width="1200" height="760" fill="#eadcbf"/>
      <g stroke="#7a5a3a" stroke-width="1" opacity=".13">${rules}</g>
      <g fill="#8a5a2a" opacity=".08"><circle cx="210" cy="640" r="40"/><circle cx="1040" cy="120" r="56"/><circle cx="700" cy="700" r="28"/></g>
      <rect x="18" y="18" width="1164" height="724" fill="none" stroke="${I}" stroke-width="2"/><rect x="26" y="26" width="1148" height="708" fill="none" stroke="${I}" stroke-width="1" opacity=".6"/>
      ${hand(60, 78, 24, 'the record · after Winslow’s letter, Dec. 1621', { a: 'start', c: I })}
      <path d="M40 440C140 432 220 446 320 438S540 430 700 440S1000 428 1160 438" stroke="${I}" stroke-width="2" fill="none"/>
      <path d="M40 440q14 -22 28 0q12 -26 26 0q16 -20 30 0q12 -18 24 0M980 438q14 -24 28 0q14 -18 26 0q12 -26 26 0q14 -20 28 0q12 -16 24 0" stroke="${I}" stroke-width="1.6" fill="url(#rec-r-hatch)"/>
      <path d="M1084 438Q1110 396 1140 438Z" fill="url(#rec-r-hatch)" stroke="${I}" stroke-width="1.8"/>
      <g stroke="${I}" stroke-width="2" fill="none"><path d="M96 436V384H204V436"/><path d="M86 386L150 330L214 386Z" fill="url(#rec-r-hatch)"/><path d="M120 384V436M180 384V436M96 410H204"/><rect x="140" y="406" width="18" height="30"/></g>
      ${hand(150, 316, 22, 'timber & thatch — not log cabins', { c: I })}
      <g>
        <path d="M250 72L300 60L900 60L950 72L930 116L950 162L900 152L300 152L250 162L270 116Z" fill="none" stroke="${I}" stroke-width="1.6" stroke-dasharray="6 5" opacity=".55"/>
        <text x="600" y="132" text-anchor="middle" font-family="${FELL}" font-size="52" fill="none" stroke="${I}" stroke-width="1.3" opacity=".55">First Thanksgiving!</text>
        <path d="M318 122Q600 110 884 116" stroke="${R}" stroke-width="5" fill="none" stroke-linecap="round"/>
        ${hand(600, 190, 30, 'nobody called it that — a harvest celebration')}
      </g>
      ${sun(900, 262)}${sun(960, 262)}${sun(1020, 262)}
      <g font-family="${FELL}" font-size="18" fill="${I}" text-anchor="middle"><text x="900" y="306">I</text><text x="960" y="306">II</text><text x="1020" y="306">III</text></g>
      ${hand(960, 226, 32, 'three days')}
      ${hand(960, 336, 20, 'autumn 1621 · no date recorded', { c: I })}
      <circle cx="460" cy="290" r="48" fill="#eadcbf" stroke="${I}" stroke-width="2"/>
      <g stroke="${I}" stroke-width="2.4" fill="url(#rec-r-hatch)"><ellipse cx="452" cy="306" rx="34" ry="7"/><path d="M434 305L438 266Q452 260 466 266L470 305Z"/></g>
      <g stroke="${R}" stroke-width="2.4" fill="none"><rect x="486" y="276" width="16" height="13" rx="2"/><path d="M480 270L508 296M508 270L480 296"/></g>
      <path d="M422 334Q412 362 430 392" stroke="${I}" stroke-width="1.6" fill="none" stroke-dasharray="4 4"/>
      ${hand(460, 232, 30, 'no buckles')}
      ${english}
      ${fig(460, 520, 1.7, '#7a5a3a', true)}
      ${fig(740, 520, 1.7, '#9b4a24', true)}
      <g stroke="${I}" stroke-width="1.5">${[['#9b4a24', 0], ['#4e6b35', 1], ['#6b4a7a', 2], ['#a3271f', 3]].map(([c, i]) => `<rect x="${704 + i * 28}" y="360" width="22" height="22" fill="${c}" fill-opacity=".75"/>`).join('')}</g>
      ${hand(756, 348, 30, 'they wore color')}
      ${hand(756, 404, 19, 'russet · green · violet · red', { c: I })}
      ${hand(345, 452, 24, '≈ 50 English')}
      <g stroke="${I}" stroke-width="2" fill="none"><path d="M330 548H520M330 556H520M346 556V590M504 556V590M340 590L352 560M510 590L498 560"/></g>
      <g stroke="${I}" stroke-width="2"><ellipse cx="420" cy="542" rx="30" ry="8" fill="#e8c890"/><path d="M386 524L454 560M454 524L386 560" stroke="${R}" stroke-width="3.6"/></g>
      ${hand(420, 514, 30, 'no pie')}
      ${hand(420, 610, 19, 'no ovens · no butter · little flour', { c: I })}
      <g stroke="${I}" stroke-width="2.2" fill="none" stroke-linecap="round">
        <path d="M548 548V452M652 548V452M542 444L548 456L554 444M646 444L652 456L658 444M540 458H662"/>
        <path d="M572 548L628 530M572 530L628 548"/>
        <path d="M584 530Q590 506 600 520Q606 498 614 524" fill="#e0661c" fill-opacity=".45"/>
        ${[576, 600, 624].map((x) => `<path d="M${x} 458V466"/><ellipse cx="${x}" cy="474" rx="7" ry="9" fill="#c98a5a" fill-opacity=".6"/>`).join('')}
      </g>
      ${hand(600, 446, 25, 'fowl — enough for a week')}
      ${[0, 1, 2, 3, 4].map((i) => deer(548 + i * 26, 592, 0.75)).join('')}
      ${hand(600, 640, 24, '5 deer, from the Wampanoag')}
      ${crowd}
      ${hand(1004, 698, 30, '≈ 90 Wampanoag men')}${hand(1004, 724, 21, 'with Massasoit', { c: I })}
      <g stroke="${I}" stroke-width="2.2" fill="none" stroke-linecap="round">
        ${fig(900, 478, 1.15, '#7a5a3a', true)}${fig(946, 472, 1.15, '#4e6b35', true)}
        <path d="M904 432L932 404M950 426L982 398"/>
        <circle cx="938" cy="398" r="7" fill="#eadcbf"/><circle cx="946" cy="390" r="9" fill="#eadcbf"/><circle cx="988" cy="392" r="7" fill="#eadcbf"/><circle cx="998" cy="382" r="10" fill="#eadcbf"/>
      </g>
      ${hand(990, 366, 22, '“we exercised our arms”', { c: I })}
      ${hand(900, 512, 28, 'invited? he never says')}
    </svg>`;
  }

  function buildPostcard(api) {
    const sec = el('section', { class: 'rec-pc', 'aria-label': 'The postcard and the record' });
    const frame = el('div', { class: 'rec-pc-frame' });
    const myth = el('div', { class: 'rec-pc-layer rec-pc-myth', html: mythSVG() });
    const rec = el('div', { class: 'rec-pc-layer rec-pc-rec', html: recordSVG() });
    const lens = el('div', { class: 'rec-lens', 'aria-hidden': 'true' });
    const marks = el('div', { class: 'rec-marks' });
    const flash = el('div', { class: 'rec-pc-flash', 'aria-hidden': 'true' });
    frame.append(myth, rec, lens, marks, flash);
    const card = el('div', { class: 'rec-pc-card' }, frame);

    const count = el('p', { class: 'rec-pc-count', 'aria-live': 'polite' });
    const hint = el('p', { class: 'rec-pc-hint' }, U.isTouch ? 'Drag a finger across the card. Or tap the gold sparks.' : 'Move your candle across the card. The record is underneath.');
    const revealAll = el('button', { class: 'lt-btn lt-btn--ghost rec-pc-all', type: 'button' }, 'Reveal everything');
    const flip = el('button', { class: 'lt-btn lt-btn--ghost', type: 'button', hidden: true }, 'Show the postcard again');
    const ledger = el('ol', { class: 'rec-ledger' });
    const items = NOTES.map((n, i) => {
      const li = el('li', { class: 'rec-note' }, el('span', { class: 'n', 'aria-hidden': 'true' }, String(i + 1)),
        el('div', { class: 'body' }, el('b', null, n.k), el('p', null, n.t)),
        el('span', { class: 'locked' }, 'still hidden'));
      ledger.appendChild(li);
      return li;
    });
    const btns = NOTES.map((n, i) => {
      const b = el('button', { class: 'rec-mark', type: 'button', style: { left: (n.x / VB_W) * 100 + '%', top: (n.y / VB_H) * 100 + '%' }, 'aria-label': `Look closer, clue ${i + 1} of ${NOTES.length}` }, el('span', null, String(i + 1)));
      marks.appendChild(b);
      return b;
    });
    const done = el('div', { class: 'rec-pc-done', hidden: true },
      el('p', { class: 'lt-display' }, 'All eight. ', el('i', null, 'You now know more than the postcard.')),
      el('p', { class: 'rec-pc-donesub' }, 'The record goes on. Keep scrolling.'),
      el('div', { class: 'rec-arrow', 'aria-hidden': 'true' }, '↓'));
    const side = el('div', { class: 'rec-pc-side' }, count, hint, ledger, el('div', { class: 'rec-pc-btns' }, revealAll, flip), done);
    sec.append(card, side);

    const st = { x: 0, y: 0, r: 0, tr: 0, R: 80, W: 1, H: 1, auto: true, found: new Set(), t: 0, complete: false, down: false, visible: true, flashT: 0 };
    function measure() {
      const r = frame.getBoundingClientRect();
      st.W = r.width || 1; st.H = r.height || 1;
      st.R = U.clamp(st.W * 0.11, 56, 132);
      if (!st.x) { st.x = st.W * 0.5; st.y = st.H * 0.55; }
    }
    measure();
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(measure); ro.observe(frame); api.cleanup(() => ro.disconnect()); }
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((es) => es.forEach((e) => (st.visible = e.isIntersecting)), { root: api.root });
      io.observe(frame); api.cleanup(() => io.disconnect());
    }
    function updateCount() {
      count.textContent = `${st.found.size} of ${NOTES.length} myths corrected`;
      count.classList.toggle('some', st.found.size > 0);
    }
    updateCount();

    function showFlash(i) {
      flash.textContent = `${i + 1}. ${NOTES[i].k}`;
      flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on');
      st.flashT = 2.6;
    }
    function reveal(i) {
      if (st.found.has(i)) return;
      st.found.add(i);
      items[i].classList.add('on');
      btns[i].classList.add('on');
      btns[i].setAttribute('aria-label', `Clue ${i + 1}: ${NOTES[i].k}`);
      LT.stats.inc('mythsCorrected');
      snd.note([62, 65, 67, 69, 72, 74, 77, 81][st.found.size - 1] || 74, 0.09);
      A.sfx('paper', { dur: 0.25, g: 0.6 });
      showFlash(i);
      updateCount();
      hint.classList.add('dim');
      if (st.found.size === NOTES.length) complete();
    }
    function aimAt(i) {
      st.auto = false;
      st.x = (NOTES[i].x / VB_W) * st.W; st.y = (NOTES[i].y / VB_H) * st.H; st.tr = st.R;
    }
    btns.forEach((b, i) => api.on(b, 'click', (e) => { e.stopPropagation(); aimAt(i); reveal(i); }));
    async function complete() {
      st.complete = true;
      revealAll.hidden = true;
      await api.wait(650);
      A.sfx('chime', { n: 74 });
      LT.music.param('cello', 1);
      frame.classList.add('complete');
      const from = st.r;
      U.tween({ from, to: Math.hypot(st.W, st.H) * 1.1, dur: 1.8, ease: 'inOutCubic', onUpdate: (v) => { st.r = v; st.tr = v; } }).done.then(() => {
        if (!api.alive) return;
        rec.classList.add('full');
        flip.hidden = false;
        done.hidden = false;
        requestAnimationFrame(() => done.classList.add('on'));
      });
      LT.fx.leaves(1.2);
      api.timeout(() => LT.fx.leaves(0), 4000);
    }
    api.on(revealAll, 'click', async () => {
      revealAll.disabled = true;
      for (let i = 0; i < NOTES.length; i++) {
        if (st.found.has(i)) continue;
        aimAt(i);
        await api.wait(U.reducedMotion ? 80 : 480);
        reveal(i);
      }
    });
    api.on(flip, 'click', () => {
      const showingMyth = rec.classList.toggle('hide');
      flip.textContent = showingMyth ? 'Show the record' : 'Show the postcard again';
      A.sfx('paper', { dur: 0.3 });
    });

    const local = (e) => { const r = frame.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    api.on(frame, 'pointermove', (e) => {
      if (st.complete) return;
      if (e.pointerType !== 'mouse' && !st.down) return;
      [st.x, st.y] = local(e); st.auto = false; st.tr = st.R;
    });
    api.on(frame, 'pointerdown', (e) => {
      if (st.complete) return;
      st.down = true; [st.x, st.y] = local(e); st.auto = false; st.tr = st.R;
      if (e.pointerType !== 'mouse') { try { frame.setPointerCapture(e.pointerId); } catch (_) {} }
    });
    api.on(frame, 'pointerup', () => { st.down = false; });
    api.on(frame, 'pointercancel', () => { st.down = false; });
    api.on(frame, 'pointerleave', (e) => { if (e.pointerType === 'mouse' && !st.complete) st.tr = 0; });

    api.frame((dt) => {
      if (!st.visible) return;
      st.t += dt;
      if (st.auto && !st.complete) {
        const a = st.t * 0.42;
        st.x = st.W * (0.5 + 0.36 * Math.sin(a));
        st.y = st.H * (0.52 + 0.26 * Math.sin(a * 1.63 + 1));
        st.tr = st.R * 0.85;
      }
      if (!st.complete) st.r += (st.tr - st.r) * Math.min(1, dt * 9);
      const fl = U.reducedMotion ? 0 : U.noise(st.t * 7) * 0.03;
      const r = st.r * (1 + fl);
      rec.style.setProperty('--mx', st.x.toFixed(1) + 'px');
      rec.style.setProperty('--my', st.y.toFixed(1) + 'px');
      rec.style.setProperty('--mr', Math.max(0, r).toFixed(1) + 'px');
      lens.style.transform = `translate(${(st.x - r).toFixed(1)}px, ${(st.y - r).toFixed(1)}px)`;
      lens.style.width = lens.style.height = Math.max(0, 2 * r).toFixed(1) + 'px';
      lens.style.opacity = st.complete ? 0 : r > 8 ? 1 : 0;
      if (!st.auto && !st.complete && st.r > st.R * 0.6) {
        for (let i = 0; i < NOTES.length; i++) {
          if (st.found.has(i)) continue;
          const ax = (NOTES[i].x / VB_W) * st.W, ay = (NOTES[i].y / VB_H) * st.H;
          if (Math.hypot(ax - st.x, ay - st.y) < st.r * 0.55) reveal(i);
        }
      }
      if (st.flashT > 0) { st.flashT -= dt; if (st.flashT <= 0) flash.classList.remove('on'); }
    });
    return sec;
  }

  /* ================================================================
     THE REEL — art for each stop
     ================================================================ */
  const svgBox = (box, html) => { box.innerHTML = html; return box.firstElementChild; };

  function artDawn(box) {
    const rnd = U.seeded(7);
    let shim = '';
    for (let i = 0; i < 30; i++) {
      const y = 246 + rnd() * 66, spread = 40 + (y - 246) * 2.6, x = 400 + (rnd() - 0.5) * spread, w = 6 + rnd() * 26;
      shim += `<line x1="${(x - w / 2).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + w / 2).toFixed(1)}" y2="${y.toFixed(1)}" style="animation-delay:${(rnd() * 3).toFixed(2)}s"/>`;
    }
    svgBox(box, `<svg viewBox="0 0 600 320" class="rec-svg" role="img" aria-label="Dawn over the water. A canoe on the horizon.">
      <defs>
        <linearGradient id="rec-d1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121220"/><stop offset=".6" stop-color="#352638"/><stop offset="1" stop-color="#6e3a34"/></linearGradient>
        <linearGradient id="rec-d2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3552"/><stop offset=".55" stop-color="#c06a46"/><stop offset="1" stop-color="#ffcf7a"/></linearGradient>
        <radialGradient id="rec-d3"><stop offset="0" stop-color="#fff3c4"/><stop offset=".4" stop-color="#ffc85a" stop-opacity=".8"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
        <clipPath id="rec-d4"><rect width="600" height="242"/></clipPath>
      </defs>
      <rect width="600" height="320" fill="url(#rec-d1)"/>
      <rect class="rd-day" width="600" height="242" fill="url(#rec-d2)" opacity="0"/>
      <g clip-path="url(#rec-d4)"><circle class="rd-glow" cx="400" cy="262" r="150" fill="url(#rec-d3)" opacity=".4"/><circle class="rd-sun" cx="400" cy="268" r="34" fill="#ffe9a8"/></g>
      <rect y="242" width="600" height="78" fill="#161824"/>
      <g class="rec-shimmer" stroke="#ffcf7a" stroke-width="2" stroke-linecap="round">${shim}</g>
      <g fill="#0b0b12"><path d="M126 248Q190 262 262 248L256 255Q192 268 132 255Z"/><circle cx="200" cy="228" r="6.5"/><path d="M194 236L206 236L208 252L192 252Z"/><path d="M204 238L226 226" stroke="#0b0b12" stroke-width="3" stroke-linecap="round"/><path d="M226 226L236 258" stroke="#0b0b12" stroke-width="2.5"/></g>
    </svg>`);
    const sun = box.querySelector('.rd-sun'), glow = box.querySelector('.rd-glow'), day = box.querySelector('.rd-day');
    return {
      progress(p) {
        const y = 268 - p * 84;
        sun.setAttribute('cy', y.toFixed(1)); glow.setAttribute('cy', y.toFixed(1));
        day.setAttribute('opacity', (p * 0.9).toFixed(3)); glow.setAttribute('opacity', (0.35 + p * 0.65).toFixed(3));
      },
    };
  }

  function artRoute(box) {
    const D = 'M136 176C250 236 400 300 506 270C552 252 552 196 528 160C508 130 498 116 490 104C400 54 240 76 142 168';
    svgBox(box, `<svg viewBox="0 0 600 320" class="rec-svg" role="img" aria-label="Map: from Patuxet to Málaga, Spain, then England, and home again in 1619.">
      <defs>
        <pattern id="rec-mh" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="7" stroke="${INK}" stroke-width="1.1" opacity=".4"/></pattern>
        <mask id="rec-route-m"><path class="rr-m" d="${D}" fill="none" stroke="#fff" stroke-width="10"/></mask>
      </defs>
      <rect width="600" height="320" fill="#e4d6b6"/>
      <g stroke="${INK}" stroke-width="1" opacity=".12">${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${30 + i * 34}Q300 ${22 + i * 34} 600 ${30 + i * 34}"/>`).join('')}</g>
      <g stroke="${INK}" stroke-width="1.6" fill="url(#rec-mh)">
        <path d="M0 0L66 0C70 30 92 48 88 76C84 100 108 112 104 136C102 152 124 160 132 166C140 170 146 160 140 152C152 158 152 178 136 186C122 192 110 186 112 206C116 234 94 252 98 282L92 320L0 320Z"/>
        <path d="M468 34C482 22 500 28 504 44C512 54 500 64 508 76C516 92 504 108 488 106C474 112 462 102 466 88C452 80 462 64 456 54C452 44 458 38 468 34Z"/>
        <path d="M600 140L560 150C540 156 548 170 532 178C512 186 524 206 508 214C492 222 500 244 512 258C526 276 556 270 572 282C586 292 600 286 600 286Z"/>
      </g>
      <g font-family="${FELLSC}" font-size="15" fill="${INK}" letter-spacing="1">
        <text x="150" y="204">Patuxet</text><text x="430" y="128">England</text><text x="454" y="306">Málaga</text>
        <text x="258" y="40" font-size="12" opacity=".6" letter-spacing="4">THE ATLANTIC</text>
      </g>
      <path d="${D}" fill="none" stroke="${RED}" stroke-width="3" stroke-dasharray="8 6" mask="url(#rec-route-m)"/>
      <g class="rr-ship"><circle r="7" fill="${RED}"/><circle r="12" fill="none" stroke="${RED}" stroke-width="1.5" opacity=".5"/></g>
      <g font-family="${HAND}" font-weight="700" font-size="22" fill="${RED}"><text class="rr-y1" x="168" y="238" opacity="0">1614, taken</text><text class="rr-y2" x="186" y="124" opacity="0">1619, home</text></g>
    </svg>`);
    const m = box.querySelector('.rr-m'), ship = box.querySelector('.rr-ship'), y1 = box.querySelector('.rr-y1'), y2 = box.querySelector('.rr-y2');
    let len = 0;
    return {
      progress(p) {
        if (!len) { try { len = m.getTotalLength(); } catch (e) { len = 900; } m.style.strokeDasharray = len; }
        const k = U.clamp((p - 0.05) / 0.85, 0, 1);
        m.style.strokeDashoffset = (len * (1 - k)).toFixed(1);
        try { const pt = m.getPointAtLength(len * k); ship.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`); } catch (e) {}
        y1.setAttribute('opacity', k > 0.02 ? 1 : 0);
        y2.setAttribute('opacity', k > 0.97 ? 1 : 0);
      },
    };
  }

  function artLights(box) {
    const cv = el('canvas', { class: 'rec-canvas' });
    const num = el('div', { class: 'rec-lights-num', 'aria-hidden': 'true' }, '100');
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'One hundred small lights. As you scroll, ninety go out.');
    box.append(cv, num);
    const ctx = cv.getContext('2d');
    const rnd = U.seeded(1616);
    const pts = [];
    for (let i = 0; i < 100; i++) {
      let best = null, bd = -1;
      for (let k = 0; k < 16; k++) {
        const c = [0.05 + rnd() * 0.9, 0.1 + rnd() * 0.8];
        let d = Infinity;
        for (const p of pts) d = Math.min(d, Math.hypot((p[0] - c[0]) * 1.85, p[1] - c[1]));
        if (d > bd) { bd = d; best = c; }
      }
      pts.push(best);
    }
    const L = pts.map(([u, v]) => ({ u, v, lv: 1, outAt: -1, seed: rnd() * 100 }));
    const order = Array.from({ length: 100 }, (_, i) => i);
    for (let i = 99; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let W = 1, H = 1, DPR = 1, outN = 0, t = 0, lastSnd = -1;
    function size() {
      const r = box.getBoundingClientRect();
      DPR = Math.min(2, devicePixelRatio || 1); W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    }
    size();
    return {
      resize: size,
      progress(p) {
        const target = Math.round(U.clamp((p - 0.12) / 0.7, 0, 1) * 90);
        while (outN < target) {
          L[order[outN++]].outAt = t;
          if (t - lastSnd > 0.12) { snd.breath(); lastSnd = t; }
        }
        num.textContent = String(100 - outN);
        num.classList.toggle('last', outN >= 90);
      },
      frame(dt) {
        t += dt;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const s = U.clamp(W / 600, 0.6, 1.2);
        for (const l of L) {
          const x = l.u * W, y = l.v * H;
          if (l.outAt >= 0) l.lv = Math.max(0, l.lv - dt * 1.8);
          const fl = U.reducedMotion ? 1 : 1 + U.noise(t * 6 + l.seed) * 0.2;
          if (l.lv > 0.01) {
            const r = 16 * s * l.lv * fl;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, `rgba(255,214,140,${(0.55 * l.lv).toFixed(3)})`); g.addColorStop(1, 'rgba(255,150,60,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
            ctx.fillStyle = `rgba(255,242,205,${l.lv.toFixed(3)})`;
            ctx.beginPath(); ctx.ellipse(x, y - 2 * s, 1.8 * s * l.lv, 3.8 * s * l.lv * fl, 0, 0, 6.283); ctx.fill();
          } else {
            ctx.fillStyle = 'rgba(140,120,100,.28)'; ctx.beginPath(); ctx.arc(x, y, 1.3 * s, 0, 6.283); ctx.fill();
          }
          if (l.outAt >= 0 && t - l.outAt < 2.6) {
            const k = (t - l.outAt) / 2.6;
            ctx.fillStyle = `rgba(190,180,165,${(0.2 * (1 - k)).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(x + Math.sin(k * 6 + l.seed) * 4 * s, y - k * 34 * s, (2 + k * 8) * s, 0, 6.283); ctx.fill();
          }
        }
      },
    };
  }

  function artShip(box, api) {
    const cv = el('canvas', { class: 'rec-canvas' });
    const day = el('div', { class: 'rec-ship-day' }, 'Day 1 of 66');
    const note = el('div', { class: 'rec-ship-note' }, 'Mid-ocean, a main beam cracks. They force it back into place with a great iron screw.');
    const ends = el('div', { class: 'rec-ship-ends', 'aria-hidden': 'true' }, el('span', null, '← Cape Cod'), el('span', null, 'Plymouth, England'));
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'The Mayflower crossing the Atlantic on rough water.');
    box.append(cv, day, note, ends);
    const ctx = cv.getContext('2d');
    let W = 1, H = 1, DPR = 1, p = 0, t = 0, wind = null, lastDay = 1;
    const rnd = U.seeded(1620);
    const stars = Array.from({ length: 40 }, () => [rnd(), rnd() * 0.45, rnd()]);
    function size() {
      const r = box.getBoundingClientRect();
      DPR = Math.min(2, devicePixelRatio || 1); W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    }
    size();
    const sc = () => W / 600;
    function wave(x, layer) {
      const k = [0.011, 0.017, 0.024][layer], s = sc(), storm = 1 + 0.9 * Math.max(0, 1 - Math.abs(p - 0.52) / 0.22);
      return (Math.sin(x * k / s + t * (0.9 + layer * 0.35)) * (9 - layer * 2) + Math.sin(x * k * 2.3 / s - t * 1.5 + layer) * 4) * s * storm;
    }
    function drawWave(layer, base, color) {
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, base + wave(x, layer));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      ctx.beginPath();
      for (let x = 0; x <= W + 8; x += 8) { const y = base + wave(x, layer); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = 'rgba(225,225,215,.18)'; ctx.lineWidth = 1.4; ctx.stroke();
    }
    function drawShip(x, y, ang, s) {
      const c = ctx;
      c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
      c.strokeStyle = '#1e140c'; c.lineWidth = 2.4;
      [[-36, -96], [2, -114], [42, -78]].forEach(([mx, top]) => { c.beginPath(); c.moveTo(mx, -14); c.lineTo(mx, top); c.stroke(); });
      c.beginPath(); c.moveTo(-76, -16); c.lineTo(-110, -34); c.stroke();
      const b = 6 + Math.sin(t * 1.3) * 2;
      const sail = (cx, top, w, h) => {
        c.beginPath(); c.moveTo(cx - w / 2, top); c.lineTo(cx + w / 2, top);
        c.quadraticCurveTo(cx + w / 2 + b * 0.3, top + h / 2, cx + w / 2 - 2, top + h);
        c.lineTo(cx - w / 2 + 2, top + h);
        c.quadraticCurveTo(cx - w / 2 - b, top + h / 2, cx - w / 2, top);
        c.closePath(); c.fill(); c.stroke();
      };
      c.fillStyle = '#e3d6b8'; c.lineWidth = 1.2;
      sail(-36, -90, 40, 30); sail(-36, -56, 48, 34); sail(2, -108, 44, 32); sail(2, -72, 54, 42);
      c.beginPath(); c.moveTo(42, -82); c.lineTo(70, -20); c.lineTo(28, -24); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-100, -30); c.lineTo(-82, -26); c.lineTo(-86, -8); c.lineTo(-102, -12); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#efe6d2'; c.fillRect(3, -128, 15, 10);
      c.fillStyle = '#a3271f'; c.fillRect(9, -128, 3, 10); c.fillRect(3, -124.5, 15, 3);
      c.fillStyle = '#3a2416'; c.strokeStyle = '#1e140c'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(-84, -18); c.lineTo(36, -16); c.lineTo(42, -38); c.lineTo(72, -40); c.lineTo(74, -8); c.quadraticCurveTo(24, 22, -56, 12); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#b8862a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-76, -10); c.quadraticCurveTo(0, -2, 72, -20); c.stroke();
      c.fillStyle = 'rgba(255,200,110,.9)'; c.fillRect(52, -33, 5, 5); c.fillRect(61, -33, 5, 5);
      c.restore();
    }
    return {
      resize: size,
      enter() { if (!wind) { wind = A.sfx('wind', { g: 0.16 }); api.sound(wind); } },
      leave() { if (wind) { wind.stop(1.2); wind = null; } },
      progress(pp) {
        p = U.clamp((pp - 0.05) / 0.85, 0, 1);
        const d = 1 + Math.round(p * 65);
        if (d !== lastDay) { day.textContent = `Day ${d} of 66`; lastDay = d; }
        note.classList.toggle('on', p > 0.4 && p < 0.72);
        day.classList.toggle('land', d >= 66);
      },
      frame(dt) {
        t += dt * (U.reducedMotion ? 0.3 : 1);
        const c = ctx, s = sc();
        c.setTransform(DPR, 0, 0, DPR, 0, 0);
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#1b2030'); g.addColorStop(0.7, '#4c5162'); g.addColorStop(1, '#6a6a70');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        stars.forEach(([u, v, k]) => { c.fillStyle = `rgba(240,230,210,${(0.25 + 0.3 * Math.sin(t * 2 + k * 9)).toFixed(2)})`; c.fillRect(u * W, v * H, 1.4, 1.4); });
        const storm = Math.max(0, 1 - Math.abs(p - 0.52) / 0.2);
        if (storm > 0) {
          c.strokeStyle = `rgba(200,210,225,${(0.28 * storm).toFixed(2)})`; c.lineWidth = 1;
          c.beginPath();
          for (let i = 0; i < 70; i++) { const x = ((i * 97.3 + t * 260) % (W + 60)) - 30, y = ((i * 53.1 + t * 520) % H); c.moveTo(x, y); c.lineTo(x - 8, y + 18); }
          c.stroke();
        }
        drawWave(0, H * 0.6, '#273445');
        const sx = W * (0.86 - 0.72 * p), base = H * 0.7;
        const sy = base + wave(sx, 1) - 2 * s;
        const ang = Math.atan2(wave(sx + 14, 1) - wave(sx - 14, 1), 28) * 0.9;
        drawShip(sx, sy, ang, s * 0.95);
        drawWave(1, base + 6 * s, '#1f2b39');
        drawWave(2, H * 0.84, '#18222e');
      },
    };
  }

  function artSamoset(box) {
    svgBox(box, `<svg viewBox="0 0 600 300" class="rec-svg" role="img" aria-label="A man walks into the English settlement and says: Welcome, Englishmen!">
      <defs><linearGradient id="rec-sm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232838"/><stop offset="1" stop-color="#6a6a62"/></linearGradient></defs>
      <rect width="600" height="300" fill="url(#rec-sm)"/>
      <path d="M0 250Q300 236 600 252L600 300L0 300Z" fill="#2a2a22"/>
      <g fill="#14110d">${Array.from({ length: 13 }, (_, i) => { const x = 14 + i * 15, h = 118 + (i % 3) * 8; return `<path d="M${x} 252V${252 - h}L${x + 6} ${244 - h}L${x + 12} ${252 - h}V252Z"/>`; }).join('')}</g>
      <g fill="#14110d"><path d="M70 120L104 94L138 120Z"/><path d="M128 118L160 90L192 118Z"/></g>
      ${[218, 244, 268].map((x, i) => `<g fill="#18140f" transform="translate(${x} 252)"><path d="M-9 0L-8 -38Q0 -42 8 -38L9 0Z"/><circle cy="-48" r="8"/><path d="M-12 -54H12M-7 -54L-6 -66H6L7 -54"/></g>`).join('')}
      <g class="rs-walker">
        <g class="rs-bob" fill="#0f0c0a">
          <circle cx="0" cy="-94" r="9.5"/>
          <path d="M-5 -102Q-12 -84 -9 -74" stroke="#0f0c0a" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M-10 -82Q0 -86 10 -82L12 -40L-12 -40Z"/>
          <path class="rs-legl" d="M-5 -42L-8 0" stroke="#0f0c0a" stroke-width="7" stroke-linecap="round"/>
          <path class="rs-legr" d="M5 -42L8 0" stroke="#0f0c0a" stroke-width="7" stroke-linecap="round"/>
          <path d="M-9 -78L-18 -52M9 -78L17 -54" stroke="#0f0c0a" stroke-width="6" stroke-linecap="round"/>
        </g>
        <g class="rs-bubble" opacity="0">
          <path d="M-96 -186H82Q92 -186 92 -176V-140Q92 -130 82 -130H6L-4 -116L-10 -130H-96Q-106 -130 -106 -140V-176Q-106 -186 -96 -186Z" fill="#efe6d2" stroke="#1c130c" stroke-width="2"/>
          <text x="-7" y="-150" text-anchor="middle" font-family="${HAND}" font-weight="700" font-size="25" fill="#24170e">Welcome, Englishmen!</text>
        </g>
      </g>
      <text x="588" y="26" text-anchor="end" font-family="${FELLSC}" font-size="14" fill="#cfc3a9" letter-spacing="2">MARCH 1621</text>
    </svg>`);
    const w = box.querySelector('.rs-walker'), bob = box.querySelector('.rs-bob'), bub = box.querySelector('.rs-bubble');
    const ll = box.querySelector('.rs-legl'), lr = box.querySelector('.rs-legr');
    let said = false;
    return {
      progress(p) {
        const k = U.clamp(p / 0.55, 0, 1), X = 560 - U.ease.outQuad(k) * 230;
        w.setAttribute('transform', `translate(${X.toFixed(1)} 252)`);
        const ph = X * 0.09, sw = k < 1 ? Math.sin(ph) * 18 : 0;
        ll.setAttribute('transform', `rotate(${sw.toFixed(1)} -5 -42)`); lr.setAttribute('transform', `rotate(${(-sw).toFixed(1)} 5 -42)`);
        bob.setAttribute('transform', `translate(0 ${k < 1 ? (-Math.abs(Math.cos(ph)) * 3).toFixed(1) : 0})`);
        const on = p > 0.5;
        bub.setAttribute('opacity', on ? 1 : 0);
        if (on && !said) { said = true; A.sfx('pop', { g: 0.14, f: 700 }); }
        if (!on) said = false;
      },
    };
  }

  function inkCard(box, opts) {
    const textEl = el('p', { class: 'rec-ink' });
    const spans = [];
    for (const ch of opts.text) { const s = document.createElement('span'); s.textContent = ch; spans.push(s); textEl.appendChild(s); }
    const card = el('figure', { class: 'rec-letter lt-card' + (opts.cls ? ' ' + opts.cls : '') },
      opts.head ? el('div', { class: 'rec-letter-head' }, opts.head) : null,
      textEl,
      el('figcaption', null, el('span', { class: 'sig' }, opts.sig), opts.cite ? el('span', { class: 'cite' }, opts.cite) : null));
    box.classList.add('rec-art--letter');
    box.appendChild(card);
    let shown = 0, acc = 0;
    return {
      progress(p) {
        const n = Math.round(U.clamp((p - 0.04) / 0.72, 0, 1) * spans.length);
        if (n === shown) return;
        if (n > shown) { for (let i = shown; i < n; i++) spans[i].className = 'on'; acc += n - shown; if (acc > 4) { snd.pen(); acc = 0; } }
        else for (let i = n; i < shown; i++) spans[i].className = '';
        shown = n;
        card.classList.toggle('done', n >= spans.length);
      },
    };
  }

  function artFour(box) {
    const plates = [];
    for (let i = 0; i < 140; i++) {
      const a = i * 2.39996, r = 62 + Math.sqrt(i) * 19;
      plates.push([300 + Math.cos(a) * r, 162 + Math.sin(a) * r * 0.5]);
    }
    const woman = (x, c) => `<g transform="translate(${x} 182)"><path d="M-11 0L-9 -32Q0 -36 9 -32L11 0Z" fill="${c}"/><path d="M-7 0L-5 -24H5L7 0Z" fill="#e8dcc1" opacity=".9"/><circle cy="-42" r="7.5" fill="#d9b08c"/><path d="M-8.5 -41Q-9 -52 0 -52Q9 -52 8.5 -41L8.5 -37H-8.5Z" fill="#f4ecdc"/></g>`;
    svgBox(box, `<svg viewBox="0 0 600 320" class="rec-svg" role="img" aria-label="Four women surrounded by one hundred and forty plates.">
      <rect width="600" height="320" fill="#1b1611"/>
      <g class="rf-plates">${plates.map(([x, y], i) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="3.6" fill="#e8dcc1" stroke="#8a7a62" stroke-width="1" data-i="${i}"/>`).join('')}</g>
      <ellipse cx="300" cy="186" rx="64" ry="14" fill="#000" opacity=".35"/>
      ${woman(258, '#9b4a24')}${woman(286, '#4e6b35')}${woman(314, '#6b4a7a')}${woman(342, '#7a5a3a')}
      <g font-family="${FELLSC}" fill="#cfc3a9" font-size="15" letter-spacing="2"><text x="18" y="300" class="rf-count">0 OF 140 PLATES</text></g>
      <g class="rf-days" font-family="${FELL}" font-size="18" fill="#cfc3a9" text-anchor="end">${[1, 2, 3].map((d) => `<text x="${520 + d * 24}" y="34" data-d="${d}" opacity=".18">${['I', 'II', 'III'][d - 1]}</text>`).join('')}<text x="582" y="58" font-size="13" font-family="${FELLSC}" letter-spacing="2" opacity=".7">DAYS</text></g>
    </svg>`);
    const els = Array.from(box.querySelectorAll('.rf-plates ellipse')), cnt = box.querySelector('.rf-count'), days = Array.from(box.querySelectorAll('.rf-days [data-d]'));
    let shown = -1;
    return {
      progress(p) {
        const n = Math.round(U.clamp((p - 0.05) / 0.7, 0, 1) * 140);
        if (n !== shown) {
          els.forEach((e, i) => e.classList.toggle('on', i < n));
          cnt.textContent = `${n} OF 140 PLATES`;
          shown = n;
        }
        days.forEach((d, i) => d.setAttribute('opacity', p > 0.2 + i * 0.25 ? 1 : 0.18));
      },
    };
  }

  function artBroadside1637(box) {
    const reasons = ['the Harvest', 'Rain after a Drought', 'Ships safely arrived', 'Victory over the Pequot'];
    const reason = el('span', { class: 'bs-reason' }, reasons[0]);
    const card = el('div', { class: 'rec-broadside lt-card' },
      el('div', { class: 'bs-k' }, 'Appointed by the Authorities'),
      el('div', { class: 'bs-t' }, 'A Day of ', el('i', null, 'Publick'), ' Thanksgiving'),
      el('div', { class: 'bs-for' }, 'for ', reason),
      el('div', { class: 'bs-small' }, 'An illustration of the form, not a real document'));
    box.classList.add('rec-art--letter');
    box.appendChild(card);
    let cur = 0;
    return {
      progress(p) {
        const i = Math.min(3, Math.floor(U.clamp((p - 0.05) / 0.7, 0, 0.999) * 4));
        if (i === cur) return;
        cur = i;
        reason.classList.remove('in'); void reason.offsetWidth;
        reason.textContent = reasons[i];
        reason.classList.add('in');
        reason.classList.toggle('war', i === 3);
        A.sfx('paper', { dur: 0.2, g: 0.4 });
      },
    };
  }

  function artSplit(box) {
    let plates = '';
    for (let x = 60; x <= 540; x += 40) plates += `<circle cx="${x}" cy="92" r="9" class="${x < 300 ? 'l' : 'r'}"/><circle cx="${x + 20}" cy="128" r="9" class="${x + 20 < 300 ? 'l' : 'r'}"/>`;
    svgBox(box, `<svg viewBox="0 0 600 220" class="rec-svg rec-split" role="img" aria-label="A long table splits in two.">
      <rect width="600" height="220" fill="#16120d"/>
      <g class="rk-l"><path d="M40 110H300" stroke="#cfc3a9" stroke-width="6" stroke-linecap="round"/><g fill="none" stroke="#cfc3a9" stroke-width="1.6">${plates.replace(/class="r"/g, 'style="display:none"')}</g></g>
      <g class="rk-r"><path d="M300 110H560" stroke="#cfc3a9" stroke-width="6" stroke-linecap="round"/><g fill="none" stroke="#cfc3a9" stroke-width="1.6">${plates.replace(/class="l"/g, 'style="display:none"')}</g></g>
      <path class="rk-crack" d="M300 96L294 104L304 110L296 118L302 126" stroke="#a3271f" stroke-width="2.5" fill="none" opacity="0"/>
      <g font-family="${FELL}" font-style="italic" font-size="20" fill="#9d927c"><text x="40" y="180">1621</text><text x="560" y="180" text-anchor="end">1675</text></g>
    </svg>`);
    box.style.aspectRatio = '600 / 220';
    const l = box.querySelector('.rk-l'), r = box.querySelector('.rk-r'), crack = box.querySelector('.rk-crack');
    return {
      progress(p) {
        const k = U.ease.inOutSine(U.clamp((p - 0.15) / 0.6, 0, 1));
        crack.setAttribute('opacity', U.clamp((p - 0.08) * 6, 0, 1) * (1 - k));
        l.setAttribute('transform', `translate(${(-k * 34).toFixed(1)} ${(k * 10).toFixed(1)}) rotate(${(-k * 4).toFixed(2)} 300 110)`);
        r.setAttribute('transform', `translate(${(k * 34).toFixed(1)} ${(k * 16).toFixed(1)}) rotate(${(k * 5).toFixed(2)} 300 110)`);
        l.style.opacity = r.style.opacity = (1 - k * 0.55).toFixed(2);
      },
    };
  }

  function artWashington(box) {
    const t = U.today();
    const match = t.getMonth() === 10 && t.getDate() === 26;
    const mark = el('mark', null, 'Thursday the 26th day of November');
    const card = el('div', { class: 'rec-broadside rec-broadside--wash lt-card' },
      el('div', { class: 'bs-k' }, 'By the President of the United States of America'),
      el('div', { class: 'bs-t' }, 'A ', el('i', null, 'Proclamation')),
      el('p', { class: 'bs-body' }, '…Now therefore I do recommend and assign ', mark, ' next to be devoted by the People of these States to the service of that great and glorious Being, who is the beneficent Author of all the good that was, that is, or that will be…'),
      el('div', { class: 'bs-sig' }, 'G. Washington · City of New York, October 3, 1789'));
    box.classList.add('rec-art--letter');
    box.appendChild(card);
    if (match) {
      box.appendChild(el('div', { class: 'rec-match' },
        el('span', { class: 'a' }, el('b', null, '26'), el('small', null, 'Nov 1789')),
        el('span', { class: 'eq', 'aria-hidden': 'true' }, '='),
        el('span', { class: 'a now' }, el('b', null, '26'), el('small', null, 'Nov ' + t.getFullYear())),
        el('span', { class: 'cap' }, `Today. Same date, ${t.getFullYear() - 1789} years later.`)));
    }
    return {
      progress(p) { mark.style.backgroundSize = `${(U.clamp((p - 0.1) / 0.4, 0, 1) * 100).toFixed(1)}% 100%`; },
    };
  }

  function artHale(box, api) {
    const pres = ['Taylor', 'Fillmore', 'Pierce', 'Buchanan', 'Lincoln'];
    const fx = (i) => 304 + i * 58;
    svgBox(box, `<svg viewBox="0 0 600 320" class="rec-svg rec-hale" role="img" aria-label="Sarah Josepha Hale at her desk, sending letters to five presidents. Four never answer. Lincoln does.">
      <rect width="600" height="320" fill="#1b1611"/>
      <g class="rh-frames">${pres.map((n, i) => `<g data-i="${i}"><rect x="${fx(i)}" y="64" width="46" height="66" rx="3" fill="#241d15" stroke="#9d927c" stroke-width="2"/><rect x="${fx(i) + 6}" y="70" width="34" height="54" fill="#2c241a" stroke="#5b4632" stroke-width="1"/><circle cx="${fx(i) + 23}" cy="88" r="8" fill="#3b3024"/><path d="M${fx(i) + 11} 120Q${fx(i) + 23} 98 ${fx(i) + 35} 120Z" fill="#3b3024"/><text x="${fx(i) + 23}" y="150" text-anchor="middle" font-family="${FELLSC}" font-size="12" fill="#cfc3a9" letter-spacing="1">${n}</text><text class="rh-st" x="${fx(i) + 23}" y="52" text-anchor="middle" font-family="${HAND}" font-weight="700" font-size="18" fill="${i === 4 ? '#f2c14e' : '#9d927c'}" opacity="0">${i === 4 ? 'yes' : 'no reply'}</text></g>`).join('')}</g>
      <g class="rh-stack" fill="#e8dcc1" stroke="#8a7a62" stroke-width="1">${Array.from({ length: 14 }, (_, i) => `<rect x="${52 + (i % 2) * 3}" y="${200 - i * 4}" width="44" height="5" opacity="0"/>`).join('')}</g>
      <rect x="40" y="206" width="170" height="10" fill="#5a3a1e"/><rect x="48" y="216" width="8" height="70" fill="#4a2e16"/><rect x="194" y="216" width="8" height="70" fill="#4a2e16"/>
      <g><path d="M112 206L104 166Q124 156 144 166L136 206Z" fill="#4a2a3e"/><circle cx="124" cy="150" r="13" fill="#e3bb98"/><path d="M111 146Q112 132 124 132Q136 132 137 146" fill="#3a2418"/>${[[108, 150], [106, 160], [140, 150], [142, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#3a2418"/>`).join('')}<path d="M146 200L170 170" stroke="#e8dcc1" stroke-width="2"/><path d="M170 170Q182 160 178 152Q168 160 166 172Z" fill="#e8dcc1"/></g>
      <g class="rh-lamb" tabindex="0" role="button" aria-label="A little lamb">
        <rect x="214" y="250" width="70" height="50" fill="transparent"/>
        ${[[236, 268], [248, 262], [260, 266], [252, 274], [240, 276], [264, 276]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#f4efe4"/>`).join('')}
        <ellipse cx="272" cy="262" rx="7" ry="8" fill="#2a2420"/><circle cx="274" cy="260" r="1.4" fill="#fff"/>
        <path d="M238 282V296M246 284V296M258 284V296M266 282V296" stroke="#2a2420" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g class="rh-envs">${pres.map((_, i) => `<g data-i="${i}" opacity="0"><rect x="-10" y="-7" width="20" height="14" fill="#efe6d2" stroke="#8a7a62"/><path d="M-10 -7L0 1L10 -7" fill="none" stroke="#8a7a62"/></g>`).join('')}</g>
      <text class="rh-cap" x="22" y="32" text-anchor="start" font-family="${FELL}" font-style="italic" font-size="17" fill="#cfc3a9"></text>
    </svg>`);
    const stack = Array.from(box.querySelectorAll('.rh-stack rect'));
    const envs = Array.from(box.querySelectorAll('.rh-envs g'));
    const frames = Array.from(box.querySelectorAll('.rh-frames > g'));
    const sts = Array.from(box.querySelectorAll('.rh-st'));
    const cap = box.querySelector('.rh-cap');
    const lamb = box.querySelector('.rh-lamb');
    const starts = [0.6, 0.67, 0.74, 0.81, 0.88];
    const arrived = [false, false, false, false, false];
    let lastCap = '';
    const playLamb = () => {
      lamb.classList.remove('bounce'); void lamb.getBoundingClientRect(); lamb.classList.add('bounce');
      const tune = [[64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 2], [62, 1], [62, 1], [62, 2], [64, 1], [67, 1], [67, 2]];
      let tt = 0;
      tune.forEach(([n, d]) => { api.timeout(() => snd.note(n + 12, 0.09, 0.9), tt * 300); tt += d; });
      LT.egg('little-lamb', 'Mary had a little lamb', 'Sarah Josepha Hale wrote it in 1830, while she was campaigning for Thanksgiving.');
    };
    api.on(lamb, 'click', playLamb);
    api.on(lamb, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playLamb(); } });
    return {
      progress(p) {
        const nStack = Math.round(U.clamp(p / 0.6, 0, 1) * 14);
        stack.forEach((s, i) => s.setAttribute('opacity', i < nStack ? 1 : 0));
        const c = p < 0.22 ? '1827: her novel Northwood makes the case' : p < 0.45 ? '1837: editor of Godey’s Lady’s Book' : p < 0.58 ? '1846: the editorials begin, every year' : p < 0.95 ? 'Letters to five presidents' : '1863';
        if (c !== lastCap) { cap.textContent = c; lastCap = c; }
        envs.forEach((e, i) => {
          const s0 = starts[i], fly = 0.05, tx = fx(i) + 23, ty = 97;
          if (p < s0) { e.setAttribute('opacity', 0); arrived[i] = false; return; }
          let x, y, o = 1;
          if (p < s0 + fly) {
            const k = (p - s0) / fly;
            x = U.lerp(150, tx, k); y = U.lerp(186, ty, k) - Math.sin(k * Math.PI) * 60;
            arrived[i] = false;
          } else {
            x = tx; y = ty;
            if (!arrived[i]) { arrived[i] = true; if (i === 4) snd.note(79, 0.1); else A.sfx('thud', { g: 0.15 }); }
            if (i < 4) { const k2 = U.clamp((p - s0 - fly) / 0.04, 0, 1); y = ty + k2 * 150; o = 1 - k2; }
          }
          e.setAttribute('opacity', o.toFixed(2));
          e.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          sts[i].setAttribute('opacity', p >= s0 + fly ? 1 : 0);
          frames[i].classList.toggle('yes', i === 4 && p >= s0 + fly);
        });
      },
    };
  }

  function artBalloons(box, api) {
    const rnd = U.seeded(1928);
    let city = '';
    for (let x = 0; x < 600;) {
      const w = 26 + rnd() * 40, h = 40 + rnd() * 70;
      city += `<rect x="${x.toFixed(0)}" y="${(300 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#14161f"/>`;
      for (let wy = 300 - h + 8; wy < 292; wy += 11) for (let wx = x + 5; wx < x + w - 6; wx += 9) if (rnd() < 0.35) city += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="3" height="4" fill="#f2c14e" opacity=".7"/>`;
      x += w + 2;
    }
    const handlers = (x) => [-14, 0, 14].map((d) => `<g fill="#0c0d12" transform="translate(${x + d} 296)"><circle cy="-22" r="4"/><path d="M-4 -17H4L5 0H-5Z"/></g>`).join('');
    const B = [
      { x: 120, y: 112, label: 'turkey', shape: `<g>${['#b8243d', '#e0662f', '#f2c14e', '#e0662f', '#b8243d'].map((c, i) => `<ellipse cx="120" cy="96" rx="13" ry="38" fill="${c}" transform="rotate(${-56 + i * 28} 120 128)"/>`).join('')}<ellipse cx="120" cy="128" rx="34" ry="30" fill="#8a4a22"/><circle cx="120" cy="94" r="13" fill="#a8652e"/><path d="M118 98L126 104L118 106Z" fill="#f2c14e"/><path d="M114 100Q110 112 116 114" stroke="#b8243d" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="116" cy="90" r="2.4" fill="#fff"/></g>` },
      { x: 300, y: 92, label: 'dog', shape: `<g><ellipse cx="292" cy="96" rx="62" ry="17" fill="#3b6ea5"/><circle cx="356" cy="82" r="17" fill="#3b6ea5"/><ellipse cx="350" cy="72" rx="7" ry="14" fill="#2a5585" transform="rotate(-30 350 72)"/><circle cx="371" cy="86" r="4" fill="#111"/><circle cx="360" cy="78" r="2.4" fill="#fff"/><path d="M246 110V124M266 110V124M316 110V124M334 110V124" stroke="#2a5585" stroke-width="7" stroke-linecap="round"/><path d="M232 92Q218 84 222 74" stroke="#3b6ea5" stroke-width="6" fill="none" stroke-linecap="round"/></g>` },
      { x: 470, y: 104, label: 'star', shape: `<g><path d="${(() => { let d = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 42, a = -Math.PI / 2 + (i / 10) * Math.PI * 2; d += (i ? 'L' : 'M') + (470 + Math.cos(a) * r).toFixed(1) + ' ' + (104 + Math.sin(a) * r).toFixed(1); } return d + 'Z'; })()}" fill="#f2c14e" stroke="#b8862a" stroke-width="2"/><circle cx="463" cy="100" r="2.6" fill="#2a1a10"/><circle cx="477" cy="100" r="2.6" fill="#2a1a10"/><path d="M462 110Q470 117 478 110" stroke="#2a1a10" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>` },
    ];
    svgBox(box, `<svg viewBox="0 0 600 320" class="rec-svg rec-balloons" role="group" aria-label="Parade balloons over the city. Tap one to let it go.">
      <defs><linearGradient id="rec-bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25324c"/><stop offset="1" stop-color="#6f86a8"/></linearGradient></defs>
      <rect width="600" height="320" fill="url(#rec-bk)"/>
      ${city}
      <g class="rb-parade">${B.map((b, i) => `<g class="rb" data-i="${i}" tabindex="0" role="button" aria-label="Let the ${b.label} balloon go"><g class="rb-rise"><g class="rb-float" style="animation-delay:${i * -1.1}s"><circle cx="${b.x}" cy="${b.y + 6}" r="62" fill="transparent"/><path d="M${b.x} ${b.y + 34}Q${b.x + 8} ${b.y + 110} ${b.x} 274" stroke="#efe6d2" stroke-width="1.2" fill="none" opacity=".55"/>${b.shape}</g></g>${handlers(b.x)}</g>`).join('')}</g>
    </svg>`);
    const parade = box.querySelector('.rb-parade');
    const bs = Array.from(box.querySelectorAll('.rb'));
    let freed = 0;
    const release = (g) => {
      if (g.classList.contains('free')) return;
      g.classList.add('free');
      const rise = g.querySelector('.rb-rise');
      rise.style.setProperty('--dx', U.rand(-60, 60).toFixed(0) + 'px');
      rise.style.setProperty('--rot', U.rand(-25, 25).toFixed(0) + 'deg');
      A.sfx('whoosh', { dur: 1.2, low: 300, high: 1400, g: 0.12 });
      api.timeout(() => A.sfx('pop', { g: 0.2, f: 1200 }), 3800);
      LT.stats.inc('balloonsReleased');
      freed++;
      if (freed === bs.length) api.timeout(() => LT.toast('1928: just like that, over Manhattan.', { title: 'Balloons released', ms: 3600 }), 1200);
    };
    bs.forEach((g) => {
      api.on(g, 'click', () => release(g));
      api.on(g, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); release(g); } });
    });
    return { progress(p) { parade.setAttribute('transform', `translate(${(30 - p * 60).toFixed(1)} 0)`); } };
  }

  function artCalendars(box, api) {
    const quips = ['Franksgiving!', 'Stores want a longer shopping season.', 'My state says the 23rd.', 'Mine says the 30th.', 'The football schedules were already printed.', 'Families split across two Thursdays.', 'Texas: why not both?'];
    const cal = (d, who) => el('button', { class: 'rec-cal', type: 'button', 'data-d': d, 'aria-label': `${who}: Thursday, November ${d}, 1939` },
      el('span', { class: 'm' }, 'November 1939'), el('span', { class: 'd' }, d), el('span', { class: 'w' }, 'Thursday'), el('span', { class: 'who' }, who));
    const a = cal('23', 'Roosevelt’s'), b = cal('30', 'Tradition’s');
    const quip = el('p', { class: 'rec-cal-quip', 'aria-live': 'polite' }, 'Two Thanksgivings. Pick a side.');
    const wrap = el('div', { class: 'rec-cals' }, el('div', { class: 'rec-cal-row' }, a, el('span', { class: 'vs', 'aria-hidden': 'true' }, 'vs.'), b), quip);
    box.classList.add('rec-art--letter');
    box.appendChild(wrap);
    let n = 0, done = false;
    const hit = (btn) => {
      btn.classList.remove('flip'); void btn.offsetWidth; btn.classList.add('flip');
      A.sfx('paper', { dur: 0.25 });
      if (done) { quip.textContent = U.pick(['Texas: why not both?', 'Fourth Thursday. Since 1941.', 'Settled. Mostly.']); return; }
      quip.textContent = quips[n % quips.length];
      n++;
      if (n >= 7) {
        done = true;
        wrap.classList.add('both');
        a.querySelector('.d').textContent = '23'; b.querySelector('.d').textContent = '30';
        quip.textContent = 'Texas took both days off.';
        LT.egg('franksgiving', 'Franksgiving', 'In 1939 Texas observed both Thanksgivings.');
        LT.fx.leaves(2); api.timeout(() => LT.fx.leaves(0), 2500);
      }
    };
    api.on(a, 'click', () => hit(a));
    api.on(b, 'click', () => hit(b));
    return {};
  }

  function artMourning(box) {
    const rnd = U.seeded(1970);
    let leaves = '';
    for (let i = 0; i < 9; i++) leaves += `<path class="rm-leaf" d="M0 0q4 -6 8 0q-4 6 -8 0Z" fill="${U.pick(['#8a3a1c', '#b8571f', '#6d3b1a'])}" style="animation-delay:${(rnd() * 9).toFixed(2)}s;animation-duration:${(7 + rnd() * 5).toFixed(2)}s;--y:${(40 + rnd() * 160).toFixed(0)}px"/>`;
    let shim = '';
    for (let i = 0; i < 18; i++) { const y = 222 + rnd() * 70, x = 330 + rnd() * 260; shim += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x + 8 + rnd() * 20).toFixed(0)}" y2="${y.toFixed(0)}" style="animation-delay:${(rnd() * 3).toFixed(2)}s"/>`; }
    svgBox(box, `<svg viewBox="0 0 600 300" class="rec-svg" role="img" aria-label="Dusk on Cole's Hill above Plymouth Harbor. One person stands near the statue of Massasoit.">
      <defs><linearGradient id="rec-dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14141f"/><stop offset=".62" stop-color="#433043"/><stop offset="1" stop-color="#a05f40"/></linearGradient></defs>
      <rect width="600" height="300" fill="url(#rec-dk)"/>
      <rect y="214" width="600" height="86" fill="#121822"/>
      <g class="rec-shimmer" stroke="#d99a6a" stroke-width="1.4" stroke-linecap="round" opacity=".6">${shim}</g>
      <g fill="#0b0c10" transform="translate(486 214)"><path d="M-40 0Q0 12 38 -2L34 6Q0 16 -36 8Z"/><path d="M-20 0V-46M2 2V-56M22 0V-38" stroke="#0b0c10" stroke-width="2"/><path d="M-30 -36H-10L-12 -14H-28ZM-10 -46H14L12 -20H-8ZM14 -30H30L28 -12H16Z" opacity=".85"/></g>
      <path d="M0 300V156C70 134 150 124 236 142C300 156 332 190 362 232L380 300Z" fill="#0b0a0d"/>
      <g fill="#0b0a0d"><rect x="146" y="112" width="24" height="28"/><rect x="140" y="136" width="36" height="8"/><path d="M152 112L150 80Q158 72 166 80L164 112Z"/><circle cx="158" cy="68" r="7"/><path d="M164 84L186 70" stroke="#0b0a0d" stroke-width="5" stroke-linecap="round"/></g>
      <g fill="#0b0a0d"><circle cx="246" cy="124" r="5"/><path d="M241 130H251L253 152H239Z"/></g>
      <g class="rm-leaves">${leaves}</g>
    </svg>`);
    return {};
  }

  /* ================================================================
     THE STOPS
     ================================================================ */
  const STOPS = [
    { id: 'before', year: null, label: 'Long before', when: 'Before 1614', title: 'People of the First Light', art: artDawn,
      body: ['The Wampanoag had lived along this coast for about 12,000 years. Their name means People of the First Light: they live where the sun comes up first.',
        'Giving thanks wasn’t a once-a-year event. Ceremonies marked the seasons: the first strawberries, the green corn, the cranberry harvest. The Aquinnah Wampanoag still celebrate Cranberry Day every October.'] },
    { id: 'taken', year: 1614, label: 'Taken', when: '1614', title: 'Tisquantum', art: artRoute,
      body: ['An English captain named Thomas Hunt lured more than twenty men aboard his ship at Patuxet and Nauset, then sold them as slaves in Málaga, Spain.',
        'One of them, Tisquantum, the man the English called Squanto, got free, reached England, learned English, and spent years trying to get home. In 1619 he finally stood at Patuxet again.',
        '<strong>There was no one there.</strong>'] },
    { id: 'dying', year: 1616, label: 'The Great Dying', when: '1616–1619', title: 'The Great Dying', art: artLights, tall: 1.9,
      mood: { level: 0.06, cello: 0, dark: 0.62, radius: 520 }, enterSfx: 'bell',
      body: ['Between 1616 and 1619 an epidemic tore through the coastal nations, most likely carried by European sailors and traders. Historians still argue about what it was. In some communities it killed as many as nine people in ten.',
        'Here are a hundred lights.',
        'When the Mayflower arrived, the fields of Patuxet were already cleared, and empty. The English called the place Plymouth.'] },
    { id: 'mayflower', year: 1620, label: 'The Mayflower', when: '1620', title: '102 passengers, 66 days', art: artShip, tall: 1.6,
      body: ['They landed on Cape Cod in November, far north of where they had permission to settle.',
        'Exploring, they found corn buried in Native storage pits and took it. They dug into graves, too. Then they built their town on the empty fields of Patuxet.',
        '<strong>By spring, about half of them were dead.</strong>'] },
    { id: 'samoset', year: 1621, label: 'Massasoit', when: 'March 1621', title: '“Welcome, Englishmen”', art: artSamoset,
      body: ['In March, a man named Samoset walked into the settlement and greeted them in English he’d picked up from fishermen. He came back with Tisquantum.',
        'Then came Massasoit, also called Ousamequin, leader of the Wampanoag. His people had been shattered by the epidemic and were under pressure from the powerful Narragansett. The English had guns. Both sides needed an ally, and they agreed to defend each other.',
        'Tisquantum stayed to translate, and to show them how to plant corn.'] },
    { id: 'feast', year: 1621, label: 'The harvest', when: 'Autumn 1621', title: 'The harvest', tall: 1.6,
      art: (box) => inkCard(box, {
        head: 'From a letter home',
        text: 'Our harvest being gotten in, our governor sent four men on fowling, that so we might after a special manner rejoice together, after we had gathered the fruit of our labors. They four in one day killed as much fowl as, with a little help beside, served the company almost a week. At which time, amongst other recreations, we exercised our arms, many of the Indians coming amongst us, and among the rest their greatest king Massasoit, with some ninety men, whom for three days we entertained and feasted, and they went out and killed five deer, which they brought to the plantation and bestowed on our governor, and upon the captain and others.',
        sig: 'Edward Winslow, December 11, 1621', cite: 'Printed in Mourt’s Relation, London, 1622' }),
      body: ['Almost everything we know about the feast comes from this one letter.',
        'Read what it says, and what it doesn’t. No turkey by name. No pie. No invitation. Not one use of the word thanksgiving.'] },
    { id: 'four', year: 1621, label: 'Four women', when: '1621', title: 'Four women', art: artFour, tall: 1.4,
      body: ['Eighteen adult women sailed on the Mayflower. Four survived the first winter.',
        'Historians think they did much of the cooking, with whatever help they had, for about 140 people. <strong>For three days.</strong>'] },
    { id: 'pequot', year: 1637, label: 'Days of thanksgiving', when: '1637', title: 'Days of thanksgiving', art: artBroadside1637, tall: 1.4,
      mood: { level: 0.55 },
      body: ['The colonies proclaimed days of thanksgiving often: for a harvest, for rain after a drought, for ships arriving safely.',
        'And for victories. In 1637, during the war against the Pequot, English soldiers and their Narragansett and Mohegan allies burned a fortified Pequot village at Mystic. Hundreds of people died inside. Days of thanksgiving were declared for victories like that one.'] },
    { id: 'philip', year: 1675, label: 'King Philip’s War', when: '1675–1676', title: 'Fifty-four years later', art: artSplit, tall: 1.4,
      mood: { level: 0.28, cello: 0, dark: 0.55 }, enterSfx: 'bell',
      body: ['Massasoit’s son Metacom, whom the English called King Philip, led a war against the colonies as English settlement pushed deeper into Native land.',
        'Per capita, it was one of the deadliest wars in American history. Thousands died. Many Native survivors were sold into slavery in the Caribbean.',
        'Metacom was killed in 1676. The colonists displayed his head on a pike at Plymouth for about twenty years.'] },
    { id: 'washington', year: 1789, label: 'Washington', when: '1789', title: 'A national day', art: artWashington,
      body: ['George Washington proclaimed a day of thanksgiving for Thursday, November 26, 1789.',
        'It didn’t become a yearly holiday. Some presidents declared one; some didn’t.'] },
    { id: 'hale', year: 1827, end: 1863, label: 'Sarah Josepha Hale', when: '1827–1863', title: 'Sarah Josepha Hale', art: artHale, tall: 2.1,
      body: ['Novelist, magazine editor, and author of “Mary Had a Little Lamb.” For 36 years she campaigned for a national Thanksgiving.',
        'She wrote editorials. She wrote to five presidents.',
        '<strong>Four of them did nothing.</strong>'] },
    { id: 'lincoln', year: 1863, label: 'Lincoln', when: '1863', title: 'In the middle of a war', tall: 1.6,
      art: (box) => inkCard(box, {
        head: 'A Proclamation',
        text: '…with humble penitence for our national perverseness and disobedience, commend to His tender care all those who have become widows, orphans, mourners or sufferers in the lamentable civil strife in which we are unavoidably engaged, and fervently implore the interposition of the Almighty Hand to heal the wounds of the nation…',
        sig: 'Abraham Lincoln, October 3, 1863', cls: 'rec-letter--lincoln' }),
      body: ['Lincoln answered in October 1863, three months after Gettysburg, and set aside the last Thursday of November.',
        'He asked the country for thanks and, in the same breath, for care for the grieving. Thanksgiving became a national holiday in the middle of the deadliest war in American history.',
        'He signed it on October 3, the same date Washington had issued his, 74 years earlier.'] },
    { id: 'macys', year: 1924, label: 'The parade', when: '1924–1928', title: 'Let them go', art: artBalloons,
      body: ['1924: the first Macy’s parade marched with animals borrowed from the Central Park Zoo. 1927: the first giant balloons.',
        '1928: at the end of the parade, they simply let the balloons go. They floated over the city until they burst.',
        '<em>Tap a balloon.</em>'] },
    { id: 'franks', year: 1939, label: 'Franksgiving', when: '1939', title: 'Franksgiving', art: artCalendars,
      body: ['November 1939 had five Thursdays, and the Depression dragged on. Roosevelt moved Thanksgiving up a week to give stores a longer shopping season. People called it Franksgiving.',
        'About half the states went along. The rest refused.',
        'In 1941, Congress settled it: the fourth Thursday of November.'] },
    { id: 'mourning', year: 1970, label: 'Day of Mourning', when: '1970', title: 'National Day of Mourning', art: artMourning, tall: 1.3,
      mood: { level: 0.32, dark: 0.55 }, enterSfx: 'bell',
      body: ['For the 350th anniversary of the Pilgrims’ landing, Massachusetts invited Wamsutta Frank James, an Aquinnah Wampanoag man, to speak. Organizers read his speech first, and wouldn’t let him give it.',
        'So he gave it on Cole’s Hill, above Plymouth Harbor, near the statue of Massasoit. People have gathered there every Thanksgiving since.',
        '<q>It is with a heavy heart that I look back upon what happened to my People.</q> <span class="lt-cite">Wamsutta Frank James, 1970</span>'] },
    { id: 'now', year: null, label: 'Now', when: '', title: '', now: true },
  ];

  function buildNow(api) {
    const y = U.today().getFullYear();
    const sources = el('details', { class: 'rec-sources' },
      el('summary', null, 'Sources'),
      el('ul', null,
        el('li', null, 'Edward Winslow, letter of December 11, 1621, printed in ', el('i', null, 'Mourt’s Relation'), ' (1622)'),
        el('li', null, 'William Bradford, ', el('i', null, 'Of Plymouth Plantation')),
        el('li', null, 'George Washington, Thanksgiving Proclamation, October 3, 1789'),
        el('li', null, 'Abraham Lincoln, Proclamation of Thanksgiving, October 3, 1863'),
        el('li', null, 'Plimoth Patuxet Museums; the Mashpee and Aquinnah Wampanoag tribes'),
        el('li', null, 'Wamsutta Frank James, suppressed speech of 1970, published by United American Indians of New England')));
    return el('div', { class: 'rec-now' },
      el('p', { class: 'lt-eyebrow' }, String(y)),
      el('h2', { class: 'lt-display rec-now-t' }, 'Both things are ', el('i', null, 'true'), ' at once.'),
      el('p', { class: 'rec-now-sub' }, 'A harvest meal shared by wary allies, and the beginning of a catastrophe. A holiday can hold more than one story. So can a family.'),
      el('p', { class: 'lt-prose rec-now-p' }, 'And the Wampanoag are still here. The Mashpee and Aquinnah Wampanoag are federally recognized tribes, and Wampanoag people still live where their ancestors did, where the sun comes up first.'),
      el('div', { class: 'rec-now-next' }, api.nextButton()),
      sources);
  }

  function buildReel(api) {
    const reel = el('div', { class: 'rec-reel' });
    const odo = el('div', { class: 'rec-odo', 'aria-hidden': 'true' });
    const strips = [];
    for (let i = 0; i < 4; i++) {
      const strip = el('span', { class: 'rec-strip' });
      for (let d = 0; d <= 10; d++) strip.appendChild(el('span', null, String(d % 10)));
      odo.appendChild(el('span', { class: 'rec-digit' }, strip));
      strips.push(strip);
    }
    const label = el('div', { class: 'rec-odo-label' });
    const sr = el('p', { class: 'sr-only', 'aria-live': 'polite' });
    const rail = el('ol', { class: 'rec-rail', 'aria-label': 'Jump to a year' });
    const counter = el('aside', { class: 'rec-counter blank' }, el('div', { class: 'rec-odo-wrap' }, odo, label), rail, sr);
    const list = el('div', { class: 'rec-stops' });
    reel.append(counter, list);

    const stops = STOPS.map((s) => {
      const sec = el('section', { class: 'rec-stop' + (s.now ? ' rec-stop--now' : ''), 'data-id': s.id, 'aria-label': s.when || 'Now' });
      if (s.tall) sec.style.minHeight = `${(s.tall * 100).toFixed(0)}vh`;
      const inner = el('div', { class: 'rec-inner' });
      sec.appendChild(inner);
      list.appendChild(sec);
      const o = { def: s, sec, inner, inst: null, top: 0, h: 1, visible: false, entered: false };
      if (s.now) { inner.appendChild(buildNow(api)); return o; }
      const art = el('div', { class: 'rec-art' });
      const copy = el('div', { class: 'rec-copy' },
        el('p', { class: 'rec-when' }, s.when),
        el('h3', { class: 'rec-h' }, s.title),
        ...s.body.map((html) => el('p', { html })));
      inner.append(art, copy);
      try { o.inst = s.art ? s.art(art, api) : null; } catch (e) { console.error('record art', s.id, e); }
      if (s.year) {
        const b = el('button', { type: 'button', class: 'rec-rail-b' }, s.when.replace('Autumn ', '').replace('March ', ''));
        api.on(b, 'click', () => {
          const r = sec.getBoundingClientRect(), rr = api.root.getBoundingClientRect();
          api.root.scrollTo({ top: api.root.scrollTop + r.top - rr.top + 1, behavior: U.reducedMotion ? 'auto' : 'smooth' });
        });
        o.rail = el('li', null, b);
        if (!(s.id === 'feast' || s.id === 'four')) rail.appendChild(o.rail);
      }
      return o;
    });

    let cell = 0;
    const measureCell = () => { cell = strips[0].firstChild.getBoundingClientRect().height || 1; };
    let disp = null, target = null, lastInt = null, lastTick = 0, active = -1, lastLabel = '';

    function renderOdo(Y) {
      if (!cell) measureCell();
      for (let k = 0; k < 4; k++) {
        const unit = Math.pow(10, k);
        let pos;
        if (k === 0) pos = ((Y % 10) + 10) % 10;
        else {
          const val = Math.floor(Y / unit) % 10, lower = Y % unit;
          pos = val + (lower > unit - 1 ? lower - (unit - 1) : 0);
        }
        strips[3 - k].style.transform = `translateY(${(-pos * cell).toFixed(2)}px)`;
      }
    }

    function applyMood(s) {
      const m = Object.assign({ level: 1, cello: 1, dark: 0.4, radius: 640 }, (s && s.def.mood) || {});
      LT.music.param('level', m.level);
      LT.music.param('cello', m.cello);
      LT.light.set({ darkness: m.dark, radius: m.radius });
    }

    function update(dt) {
      const root = api.root, rr = root.getBoundingClientRect(), vh = rr.height || innerHeight;
      const c = vh * 0.5;
      let newActive = -1;
      stops.forEach((s, i) => {
        const r = s.sec.getBoundingClientRect();
        s.top = r.top - rr.top; s.h = r.height || 1;
        s.visible = s.top < vh + 40 && s.top + s.h > -40;
        if (s.top <= c && s.top + s.h > c) newActive = i;
        if (s.inst && s.visible) {
          const p = U.clamp((vh * 0.62 - s.top) / Math.max(1, s.h - vh * 0.2), 0, 1);
          s.inst.progress && s.inst.progress(p);
          s.inst.frame && s.inst.frame(dt);
        }
      });
      // which year?
      let Y = null;
      const yearStops = stops.filter((s) => s.def.year);
      for (let i = 0; i < yearStops.length; i++) {
        const s = yearStops[i], a = s.top + s.h * 0.1, b = s.top + s.h * 0.86;
        if (c >= a && c <= b) {
          Y = s.def.end ? U.lerp(s.def.year, s.def.end, U.clamp((c - a) / (b - a), 0, 1)) : s.def.year;
          break;
        }
        const nx = yearStops[i + 1];
        if (c > b && nx && c < nx.top + nx.h * 0.1) {
          const na = nx.top + nx.h * 0.1;
          Y = U.lerp(s.def.end || s.def.year, nx.def.year, U.ease.inOutSine(U.clamp((c - b) / Math.max(1, na - b), 0, 1)));
          break;
        }
        if (!nx && c > b) Y = s.def.end || s.def.year;
      }
      const nowStop = stops[stops.length - 1];
      if (c > nowStop.top) Y = U.lerp(1970, U.today().getFullYear(), U.clamp((c - nowStop.top) / (vh * 0.35), 0, 1));
      if (stops[0].top + stops[0].h > c && c < (yearStops[0].top + yearStops[0].h * 0.1)) Y = null;
      target = Y;
      if (target == null) { counter.classList.add('blank'); }
      else {
        counter.classList.remove('blank');
        if (disp == null) disp = target - 24;
        disp += (target - disp) * (1 - Math.exp(-dt * 7));
        if (Math.abs(target - disp) < 0.003) disp = target;
        renderOdo(disp);
        const iy = Math.floor(disp + 1e-6);
        if (iy !== lastInt) {
          if (lastInt != null && performance.now() - lastTick > 38) { snd.tick(); lastTick = performance.now(); }
          lastInt = iy;
        }
      }
      // active stop changes
      if (newActive !== active) {
        const prev = stops[active];
        if (prev && prev.inst && prev.inst.leave) prev.inst.leave();
        active = newActive;
        const s = stops[active];
        if (s) {
          applyMood(s);
          if (s.inst && s.inst.enter) s.inst.enter();
          const lab = s.def.now ? 'Now' : s.def.label;
          if (lab !== lastLabel) {
            label.classList.remove('in'); void label.offsetWidth;
            label.textContent = lab; label.classList.add('in'); lastLabel = lab;
            sr.textContent = `${s.def.when || 'Now'}: ${lab}`;
          }
          stops.forEach((o) => o.rail && o.rail.classList.toggle('on', o === s || (o.def.year && s.def.year && o.def.year === s.def.year && o.rail.parentNode)));
          if (!s.entered) {
            s.entered = true;
            if (s.def.enterSfx === 'bell') A.sfx('bell', { n: 38, g: 0.1, decay: 6 });
            else A.sfx('paper', { dur: 0.3, g: 0.35 });
            if (s.def.now) { LT.stats.set('yearsTraveled', 405); A.sfx('bell', { n: 50, g: 0.12, decay: 6 }); LT.fx.embers(1.2); }
          }
        } else {
          LT.music.param('level', 1); LT.music.param('cello', 1);
          LT.light.set({ darkness: 0.5, radius: 480 });
        }
      }
    }
    return {
      el: reel, update,
      resize() { measureCell(); stops.forEach((s) => s.inst && s.inst.resize && s.inst.resize()); },
    };
  }

  /* ================================================================
     THE CHAPTER
     ================================================================ */
  LT.chapter({
    id: 'record', index: 1, numeral: 'I', course: 'First Course', title: 'The Record',
    blurb: 'What actually happened in 1621, and in the 405 years after.',
    music: 'record', transition: 'candle', light: { darkness: 0.5, radius: 480 },
    mount(root, api) {
      root.classList.add('scrolls', 'rec');
      const intro = el('header', { class: 'rec-intro' },
        el('p', { class: 'lt-eyebrow' }, 'First Course'),
        el('h1', { class: 'lt-display rec-title' }, 'The ', el('i', null, 'Record')),
        el('p', { class: 'rec-lede' }, 'Every November the same picture comes out of the drawer. Hold your candle to it.'));
      const postcard = buildPostcard(api);
      const bridge = el('div', { class: 'rec-bridge' },
        el('p', { class: 'lt-display' }, 'That’s the picture. Here’s the ', el('i', null, 'record'), '.'),
        el('p', { class: 'rec-lede' }, 'It starts before the Mayflower, and it doesn’t end in 1621.'),
        el('div', { class: 'rec-arrow', 'aria-hidden': 'true' }, '↓'));
      const reel = buildReel(api);
      root.append(intro, postcard, bridge, reel.el);
      api.on(window, 'resize', () => reel.resize());
      api.timeout(() => reel.resize(), 300);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => api.alive && reel.resize());
      api.frame((dt) => reel.update(dt));
    },
  });
})();
