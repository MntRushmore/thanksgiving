/* The Long Table — a candle on a canvas. Lit in the prelude, blown out at the end. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util;

  /**
   * LT.candle(canvas, {burn:0..1, lit:false, holder:true, scale})
   * -> {light(), out(), wind(v), blow(strength), flamePos(), lit, destroy()}
   */
  LT.candle = function (canvas, opts = {}) {
    const cx = canvas.getContext('2d');
    let W = 0, H = 0, DPR = 1;
    const st = { flame: opts.lit ? 1 : 0, target: opts.lit ? 1 : 0, wind: 0, windT: 0, blow: 0, burn: opts.burn || 0, t: U.rand(100), lit: !!opts.lit, gutter: 0 };
    const holder = opts.holder !== false;
    const rnd = U.seeded(opts.seed || 26);
    const drips = Array.from({ length: 5 }, () => ({ x: rnd() * 2 - 1, len: 0.04 + rnd() * 0.12, w: 0.08 + rnd() * 0.1 }));

    function resize() {
      const r = canvas.getBoundingClientRect();
      DPR = Math.min(2, devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    }
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro && ro.observe(canvas);

    function geom() {
      const s = Math.min(W / 160, H / 420) * (opts.scale || 1);
      const cxm = W / 2;
      const baseY = H - 8 * s;
      const holderH = holder ? 70 * s : 0;
      const candleW = 30 * s;
      const fullH = 230 * s;
      const candleH = fullH * (1 - st.burn * 0.8);
      const topY = baseY - holderH - candleH;
      return { s, cxm, baseY, holderH, candleW, candleH, topY, wickY: topY - 9 * s };
    }

    function drawHolder(g) {
      const { s, cxm, baseY, holderH } = g;
      const c = cx;
      const metal = (x0, x1) => {
        const gr = c.createLinearGradient(x0, 0, x1, 0);
        gr.addColorStop(0, '#3b3d3a'); gr.addColorStop(0.3, '#9a9c95'); gr.addColorStop(0.45, '#d7d8cf');
        gr.addColorStop(0.6, '#8a8c86'); gr.addColorStop(1, '#2c2e2b');
        return gr;
      };
      // base foot
      c.fillStyle = metal(cxm - 62 * s, cxm + 62 * s);
      c.beginPath(); c.ellipse(cxm, baseY - 6 * s, 62 * s, 12 * s, 0, 0, Math.PI * 2); c.fill();
      c.fillRect(cxm - 62 * s, baseY - 12 * s, 124 * s, 6 * s);
      c.beginPath(); c.ellipse(cxm, baseY - 12 * s, 62 * s, 12 * s, 0, 0, Math.PI * 2); c.fill();
      // stem with knops
      c.fillStyle = metal(cxm - 14 * s, cxm + 14 * s);
      c.beginPath();
      c.moveTo(cxm - 26 * s, baseY - 14 * s);
      c.bezierCurveTo(cxm - 10 * s, baseY - 22 * s, cxm - 9 * s, baseY - 30 * s, cxm - 12 * s, baseY - 36 * s);
      c.bezierCurveTo(cxm - 20 * s, baseY - 42 * s, cxm - 9 * s, baseY - 48 * s, cxm - 10 * s, baseY - holderH + 10 * s);
      c.lineTo(cxm + 10 * s, baseY - holderH + 10 * s);
      c.bezierCurveTo(cxm + 9 * s, baseY - 48 * s, cxm + 20 * s, baseY - 42 * s, cxm + 12 * s, baseY - 36 * s);
      c.bezierCurveTo(cxm + 9 * s, baseY - 30 * s, cxm + 10 * s, baseY - 22 * s, cxm + 26 * s, baseY - 14 * s);
      c.closePath(); c.fill();
      // drip pan
      c.fillStyle = metal(cxm - 40 * s, cxm + 40 * s);
      c.beginPath(); c.ellipse(cxm, baseY - holderH + 8 * s, 40 * s, 8 * s, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1e1f1c';
      c.beginPath(); c.ellipse(cxm, baseY - holderH + 5 * s, 34 * s, 5.5 * s, 0, 0, Math.PI * 2); c.fill();
      // socket
      c.fillStyle = metal(cxm - 19 * s, cxm + 19 * s);
      c.fillRect(cxm - 19 * s, baseY - holderH - 6 * s, 38 * s, 12 * s);
      c.beginPath(); c.ellipse(cxm, baseY - holderH - 6 * s, 19 * s, 4 * s, 0, 0, Math.PI * 2); c.fill();
    }

    function drawCandle(g) {
      const { s, cxm, topY, candleW, baseY, holderH } = g;
      const c = cx, bottom = baseY - holderH - 4 * s;
      const wax = c.createLinearGradient(cxm - candleW / 2, 0, cxm + candleW / 2, 0);
      wax.addColorStop(0, '#8d7a5c'); wax.addColorStop(0.22, '#e7dbbf'); wax.addColorStop(0.5, '#f4ead3'); wax.addColorStop(0.8, '#cdbb96'); wax.addColorStop(1, '#6e5e45');
      c.fillStyle = wax;
      c.beginPath();
      c.moveTo(cxm - candleW / 2, bottom);
      c.lineTo(cxm - candleW / 2, topY + 4 * s);
      c.quadraticCurveTo(cxm - candleW / 2, topY - 2 * s, cxm - candleW / 2 + 6 * s, topY - 1 * s);
      c.lineTo(cxm + candleW / 2 - 6 * s, topY - 1 * s);
      c.quadraticCurveTo(cxm + candleW / 2, topY - 2 * s, cxm + candleW / 2, topY + 4 * s);
      c.lineTo(cxm + candleW / 2, bottom);
      c.closePath(); c.fill();
      // drips
      c.fillStyle = 'rgba(246,238,220,.85)';
      drips.forEach((d) => {
        const x = cxm + d.x * candleW * 0.42, w = d.w * candleW, len = d.len * 230 * s * (0.6 + st.burn);
        c.beginPath(); c.moveTo(x - w / 2, topY); c.lineTo(x - w / 2, topY + len); c.arc(x, topY + len, w / 2, Math.PI, 0, true); c.lineTo(x + w / 2, topY); c.fill();
      });
      // inner glow from the flame
      if (st.flame > 0.01) {
        const gl = c.createRadialGradient(cxm, topY, 0, cxm, topY, 120 * s);
        gl.addColorStop(0, `rgba(255,200,120,${0.55 * st.flame})`); gl.addColorStop(1, 'rgba(255,170,80,0)');
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = gl; c.fillRect(cxm - candleW / 2, topY - 2 * s, candleW, 120 * s);
        c.globalCompositeOperation = 'source-over';
      }
      // wax pool
      c.fillStyle = 'rgba(255,245,225,.55)';
      c.beginPath(); c.ellipse(cxm, topY + 1 * s, candleW / 2 - 2 * s, 3 * s, 0, 0, Math.PI * 2); c.fill();
    }

    function flameShape(x, y, w, h, tipDx) {
      cx.beginPath();
      cx.moveTo(x, y + h * 0.02);
      cx.bezierCurveTo(x - w, y - h * 0.12, x - w * 0.75, y - h * 0.62, x + tipDx, y - h);
      cx.bezierCurveTo(x + w * 0.75, y - h * 0.62, x + w, y - h * 0.12, x, y + h * 0.02);
      cx.closePath();
    }

    function drawFlame(g) {
      const { s, cxm, wickY, topY } = g;
      const c = cx;
      // wick
      c.strokeStyle = '#1b130c'; c.lineWidth = 2.2 * s; c.lineCap = 'round';
      c.beginPath(); c.moveTo(cxm, topY); c.quadraticCurveTo(cxm + 1 * s, wickY + 4 * s, cxm + 2.5 * s * (1 - st.flame), wickY + 1 * s); c.stroke();
      if (st.flame < 0.02) {
        if (st.ember > 0.01) { c.fillStyle = `rgba(255,120,40,${st.ember})`; c.beginPath(); c.arc(cxm + 2 * s, wickY + 1 * s, 2 * s, 0, Math.PI * 2); c.fill(); }
        return;
      }
      const t = st.t, f = st.flame;
      const flick = 1 + U.noise(t * 9.1) * 0.09 + U.noise(t * 23.7 + 4) * 0.04;
      const lean = U.clamp(st.wind + U.noise(t * 1.4 + 2) * 0.12, -1.6, 1.6);
      const bl = st.blow;
      const h = 46 * s * f * flick * (1 - bl * 0.55);
      const w = 10.5 * s * f * (1 + bl * 0.4);
      const tip = lean * h * 0.55 + bl * h * 0.9 * (opts.blowDir || 1);
      const x = cxm + lean * 2 * s, y = wickY + 3 * s;
      c.globalCompositeOperation = 'lighter';
      // keep the halo inside the canvas so its edge never shows as a box
      const hx = x + tip * 0.4, hy = y - h * 0.45;
      const hr = Math.max(4, Math.min(h * 3.4, hx - 1, W - hx - 1, hy - 1, H - hy - 1));
      const halo = c.createRadialGradient(hx, hy, 0, hx, hy, hr);
      halo.addColorStop(0, `rgba(255,190,100,${0.42 * f})`); halo.addColorStop(0.35, `rgba(255,150,60,${0.14 * f})`); halo.addColorStop(1, 'rgba(255,120,40,0)');
      c.fillStyle = halo; c.beginPath(); c.arc(hx, hy, hr, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = 'source-over';
      const og = c.createLinearGradient(0, y - h, 0, y);
      og.addColorStop(0, 'rgba(255,110,30,0)'); og.addColorStop(0.25, 'rgba(255,140,40,.85)'); og.addColorStop(0.7, 'rgba(255,196,90,.95)'); og.addColorStop(1, 'rgba(255,170,70,.6)');
      c.fillStyle = og; flameShape(x, y, w, h, tip); c.fill();
      c.fillStyle = 'rgba(255,246,214,.96)'; flameShape(x, y - h * 0.04, w * 0.55, h * 0.62, tip * 0.6); c.fill();
      const bb = c.createRadialGradient(x, y, 0, x, y, w * 0.9);
      bb.addColorStop(0, 'rgba(90,130,255,.55)'); bb.addColorStop(1, 'rgba(90,130,255,0)');
      c.fillStyle = bb; c.beginPath(); c.ellipse(x, y - h * 0.04, w * 0.7, h * 0.14, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(30,18,10,.9)'; c.beginPath(); c.ellipse(x, y - 1 * s, 1.4 * s, 4 * s, lean * 0.3, 0, Math.PI * 2); c.fill();
      st.lastFlame = { x, y: y - h * 0.5, h };
    }

    let alive = true;
    st.ember = 0;
    const off = LT.loop.add((dt) => {
      if (!alive) return;
      st.t += dt;
      st.flame += (st.target - st.flame) * (1 - Math.pow(st.target > st.flame ? 0.02 : 0.0005, dt));
      st.wind *= Math.pow(0.15, dt);
      if (opts.feelPointer !== false) {
        const r = canvas.getBoundingClientRect();
        const near = Math.abs(LT.pointer.x - (r.left + r.width / 2)) < 260 && Math.abs(LT.pointer.y - (r.top + r.height / 2)) < 320;
        if (near) st.wind += U.clamp(-LT.pointer.vx * 0.004, -0.6, 0.6) * dt * 8;
      }
      st.ember *= Math.pow(0.4, dt);
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx.clearRect(0, 0, W, H);
      const g = geom();
      if (holder) drawHolder(g);
      drawCandle(g);
      drawFlame(g);
    });

    const api = {
      get lit() { return st.lit; },
      light() { st.lit = true; st.target = 1; st.flame = Math.max(st.flame, 0.15); },
      out() {
        if (!st.lit) return;
        st.lit = false; st.target = 0; st.flame = 0; st.blow = 0; st.ember = 1;
        const p = api.flamePos();
        if (LT.fx) {
          LT.fx.smoke(p.x, p.y + 10, { count: 26, color: 'rgba(200,190,175,.28)', scale: 1.4 });
          setTimeout(() => LT.fx.smoke(p.x, p.y + 10, { count: 12, color: 'rgba(200,190,175,.2)' }), 400);
        }
      },
      wind(v) { st.wind += v; },
      blow(v) { st.blow = U.clamp(v, 0, 1); },
      burn(v) { st.burn = U.clamp(v, 0, 1); },
      flamePos() {
        const r = canvas.getBoundingClientRect(), g = geom();
        return { x: r.left + g.cxm, y: r.top + g.wickY - 18 * g.s, s: g.s };
      },
      destroy() { alive = false; off(); ro && ro.disconnect(); },
    };
    return api;
  };
})();
