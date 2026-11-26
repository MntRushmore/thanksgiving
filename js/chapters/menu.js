/* The bill of fare — pick a course. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  LT.chapter({
    id: 'menu', index: 0.5, title: 'Bill of Fare', music: 'menu', transition: 'candle',
    light: { darkness: 0.5, radius: 520 },
    world: { shot: 'menu', dur: 2.6, mood: { cursor: 1, dim: 0.85, soft: 0.25 }, light: { darkness: 0.2, radius: 900 } },
    mount(root, api) {
      root.classList.add('scrolls');
      root.appendChild(el('div', { class: 'menu-page' }, LT.renderBill({ begin: true })));
      LT.fx.embers(1.2);
      // if the table went dark at the end of the night, light it again
      const W = LT.world;
      if (W.ok) { W.aftermath(false); W.hero.burn(0); W.hero.light(); W.ignite({ gap: 0.02, quiet: true }); }
      api.timeout(() => LT.audio.sfx('paper'), 200);
    },
  });
})();
