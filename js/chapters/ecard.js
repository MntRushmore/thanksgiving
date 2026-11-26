/* The cold open: a gloriously tacky e-card. It gets about two seconds before it burns. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;

  function drawCard(c, w, h, t) {
    const x = c;
    // sunburst background
    const g = x.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.55, w * 0.7);
    g.addColorStop(0, '#fff3a0'); g.addColorStop(0.45, '#ffb13b'); g.addColorStop(1, '#e2541b');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.save(); x.translate(w * 0.5, h * 0.62);
    for (let i = 0; i < 24; i++) { x.rotate(Math.PI / 12); x.fillStyle = i % 2 ? 'rgba(255,255,255,.13)' : 'rgba(255,120,0,.12)'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, -40); x.lineTo(w, 40); x.fill(); }
    x.restore();
    // a border of tiny clip-art leaves
    const leafCols = ['#c0392b', '#e67e22', '#f1c40f', '#8e5a2b'];
    for (let i = 0; i < 44; i++) {
      const along = i / 44, px = along < 0.25 ? along * 4 * w : along < 0.5 ? w : along < 0.75 ? (1 - (along - 0.5) * 4) * w : 0;
      const py = along < 0.25 ? 0 : along < 0.5 ? (along - 0.25) * 4 * h : along < 0.75 ? h : (1 - (along - 0.75) * 4) * h;
      x.save(); x.translate(px, py); x.rotate(i + t * 0.6); x.fillStyle = leafCols[i % 4];
      x.beginPath(); x.ellipse(0, 0, 13, 7, 0, 0, Math.PI * 2); x.fill(); x.restore();
    }
    // the turkey: circles, a rainbow tail, googly eyes
    const tx = w * 0.27, ty = h * 0.66, bob = Math.sin(t * 6) * 4;
    ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'].forEach((cc, i) => {
      x.fillStyle = cc; x.beginPath(); x.arc(tx, ty + bob, 120 - i * 15, Math.PI, 0); x.fill();
    });
    x.fillStyle = '#8b5a2b'; x.beginPath(); x.ellipse(tx, ty + 18 + bob, 52, 60, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#a0682f'; x.beginPath(); x.arc(tx, ty - 46 + bob, 32, 0, Math.PI * 2); x.fill();
    [[-12, -52], [12, -52]].forEach(([dx, dy]) => {
      x.fillStyle = '#fff'; x.beginPath(); x.arc(tx + dx, ty + dy + bob, 11, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#000'; x.beginPath(); x.arc(tx + dx + Math.sin(t * 9 + dx) * 4, ty + dy + bob + Math.cos(t * 7) * 3, 5, 0, Math.PI * 2); x.fill();
    });
    x.fillStyle = '#f39c12'; x.beginPath(); x.moveTo(tx - 7, ty - 40 + bob); x.lineTo(tx + 7, ty - 40 + bob); x.lineTo(tx, ty - 26 + bob); x.fill();
    x.fillStyle = '#e74c3c'; x.beginPath(); x.ellipse(tx + 9, ty - 28 + bob, 5, 11, 0.3, 0, Math.PI * 2); x.fill();
    // a pumpkin
    x.fillStyle = '#e67e22';
    [-22, 0, 22].forEach((dx) => { x.beginPath(); x.ellipse(w * 0.8 + dx, h * 0.8, 30, 34, 0, 0, Math.PI * 2); x.fill(); });
    x.fillStyle = '#27ae60'; x.fillRect(w * 0.8 - 4, h * 0.8 - 46, 8, 16);
    // WordArt
    const words = 'Happy Thanksgiving!!!';
    const size = Math.round(w * 0.085);
    x.save();
    x.font = `900 ${size}px "Comic Sans MS", "Chalkboard SE", "Trebuchet MS", Impact, sans-serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const cx = w * 0.5, cy = h * 0.2;
    for (let i = 0; i < words.length; i++) {
      const ch = words[i];
      const off = (i - words.length / 2) * size * 0.47;
      const yy = cy + Math.sin(i * 0.5 + t * 5) * 8 - Math.cos((i / words.length) * Math.PI) * 0;
      const rg = x.createLinearGradient(0, yy - size / 2, 0, yy + size / 2);
      rg.addColorStop(0, '#ff2d55'); rg.addColorStop(0.35, '#ffcc00'); rg.addColorStop(0.7, '#4cd964'); rg.addColorStop(1, '#5ac8fa');
      x.lineWidth = 9; x.strokeStyle = '#4a148c'; x.strokeText(ch, cx + off + 5, yy + 6);
      x.strokeStyle = '#fff'; x.lineWidth = 6; x.strokeText(ch, cx + off, yy);
      x.fillStyle = rg; x.fillText(ch, cx + off, yy);
    }
    x.font = `italic 700 ${Math.round(size * 0.42)}px "Comic Sans MS", "Trebuchet MS", sans-serif`;
    x.fillStyle = '#4a148c'; x.fillText('Gobble gobble!! Have a GREAT day!!', w * 0.62, h * 0.5);
    x.restore();
    // twinkles
    for (let i = 0; i < 9; i++) {
      const sx = ((i * 97) % 100) / 100 * w, sy = ((i * 61) % 100) / 100 * h * 0.9 + 12, k = Math.max(0, Math.sin(t * 7 + i * 2));
      x.save(); x.translate(sx, sy); x.rotate(t + i); x.fillStyle = `rgba(255,255,255,${k})`;
      x.beginPath(); for (let j = 0; j < 8; j++) { const r = j % 2 ? 3 : 14 * k + 2; x.lineTo(Math.cos((j * Math.PI) / 4) * r, Math.sin((j * Math.PI) / 4) * r); } x.fill(); x.restore();
    }
  }

  /** mount the e-card inside `root`; resolves when it has burned away */
  LT.ecard = function (root, api) {
    return new Promise((resolve) => {
      const wrap = el('div', { class: 'ecard' });
      const note = el('p', { class: 'ecard-note' }, 'You’ve got a card!');
      const cv = el('canvas', { class: 'ecard-cv', 'aria-label': 'A very cheerful Thanksgiving e-card' });
      const open = el('button', { class: 'ecard-btn', type: 'button' }, 'Open your card ▶');
      wrap.append(note, cv, open);
      root.appendChild(wrap);
      const ctx = cv.getContext('2d');
      const W = 640, H = 420, DPR = Math.min(2, devicePixelRatio || 1);
      cv.width = W * DPR; cv.height = H * DPR;
      const art = document.createElement('canvas'); art.width = W * DPR; art.height = H * DPR;
      const actx = art.getContext('2d'); actx.scale(DPR, DPR);
      // burn field: noise plus distance from the corner the fire starts in
      const BW = 128, BH = 84, field = new Float32Array(BW * BH), rnd = U.seeded(77);
      const lat = new Float32Array(64 * 64).map(() => rnd());
      const vn = (x, y) => {
        const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
        const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
        const g = (a, b) => lat[((b & 63) << 6) | (a & 63)];
        return U.lerp(U.lerp(g(xi, yi), g(xi + 1, yi), sx), U.lerp(g(xi, yi + 1), g(xi + 1, yi + 1), sx), sy);
      };
      const nz = (x, y) => { let v = 0, a = 0.55, f = 0.06; for (let o = 0; o < 4; o++) { v += a * vn(x * f + o * 17, y * f + o * 9); a *= 0.5; f *= 2.05; } return v; };
      for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
        const d = Math.hypot((BW - x) / BW, (BH - y) / BH * 0.8) / 1.3;
        field[y * BW + x] = d * 0.75 + (nz(x, y) + rnd() * 0.06) * 0.6;
      }
      const mk = () => { const c = document.createElement('canvas'); c.width = BW; c.height = BH; const x = c.getContext('2d'); return { c, x, d: x.createImageData(BW, BH) }; };
      const mask = mk(), char = mk(), glow = mk();
      let burn = -0.1, burning = false, t0 = performance.now(), done = false, jingle = null, fire = null;

      const off = LT.loop.add((dt, t, raw) => {
        if (done) return;
        const tt = (performance.now() - t0) / 1000;
        actx.clearRect(0, 0, W, H);
        drawCard(actx, W, H, tt);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(art, 0, 0);
        if (!burning) return;
        burn += raw * 0.42;
        const r = cv.getBoundingClientRect();
        let sparks = 0;
        for (let i = 0; i < BW * BH; i++) {
          const k = field[i] - burn, j = i * 4;
          mask.d.data[j + 3] = k < 0 ? 0 : 255;
          const cb = k >= 0 && k < 0.1 ? 1 - k / 0.1 : 0;
          char.d.data[j] = 34; char.d.data[j + 1] = 18; char.d.data[j + 2] = 8; char.d.data[j + 3] = Math.round(cb * cb * 235);
          const hot = Math.max(0, 1 - Math.abs(k - 0.004) / 0.022);
          glow.d.data[j] = 255; glow.d.data[j + 1] = Math.round(110 + hot * 130); glow.d.data[j + 2] = Math.round(25 + hot * 70); glow.d.data[j + 3] = Math.round(hot * 255);
          if (hot > 0.7 && sparks < 3 && Math.random() < 0.006) { sparks++; LT.fx.sparks(r.left + ((i % BW) / BW) * r.width, r.top + (Math.floor(i / BW) / BH) * r.height, 3, { speed: [30, 160], gravity: -80, life: [0.4, 1.2] }); }
        }
        mask.x.putImageData(mask.d, 0, 0); char.x.putImageData(char.d, 0, 0); glow.x.putImageData(glow.d, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(mask.c, 0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = 'source-atop'; ctx.drawImage(char.c, 0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow.c, 0, 0, cv.width, cv.height); ctx.drawImage(glow.c, 0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = 'source-over';
        if (burn > 1.5) finish();
      });
      api.cleanup(() => { off(); fire && fire.stop(0.3); jingle && clearInterval(jingle); });

      function playJingle() {
        // a cheerful chiptune, the kind that came with a dancing turkey GIF
        const A = LT.audio;
        if (!A.ready) return;
        const seq = [72, 76, 79, 84, 79, 76, 77, 81, 84, 89, 84, 81, 79, 83, 86, 91];
        let i = 0;
        jingle = setInterval(() => {
          const n = seq[i++ % seq.length];
          A.tone({ f: A.mtof(n), type: 'square', dur: 0.12, a: 0.003, g: 0.07, filter: { type: 'lowpass', f: 4000 } });
          if (i % 4 === 1) A.tone({ f: A.mtof(n - 24), type: 'square', dur: 0.2, a: 0.003, g: 0.06, filter: { type: 'lowpass', f: 1200 } });
        }, 125);
      }
      async function ignite() {
        open.remove();
        LT.audio.init();
        note.textContent = '♫♪ Happy Thanksgiving to YOU ♪♫';
        playJingle();
        wrap.classList.add('dance');
        await api.wait(2300);
        clearInterval(jingle); jingle = null;
        LT.audio.sfx('scratch');
        wrap.classList.remove('dance');
        note.textContent = '…no.';
        note.classList.add('flat');
        await api.wait(1100);
        LT.audio.sfx('match');
        fire = LT.audio.sfx('fire', { g: 0.4 });
        burning = true;
        note.classList.add('gone');
      }
      function finish() {
        if (done) return;
        done = true; off();
        fire && fire.stop(1.2);
        LT.fx.smoke(innerWidth / 2, innerHeight / 2, { count: 16, scale: 1.6 });
        wrap.classList.add('gone');
        setTimeout(() => { wrap.remove(); resolve(); }, 900);
      }
      open.addEventListener('click', ignite);
      open.focus({ preventScroll: true });
    });
  };
})();
