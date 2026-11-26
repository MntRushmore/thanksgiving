/* The bill of fare — pick a course. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  LT.chapter({
    id: 'menu', index: 0.5, title: 'Bill of Fare', music: 'menu', transition: 'candle',
    light: { darkness: 0.5, radius: 520 },
    mount(root, api) {
      root.classList.add('scrolls');
      root.appendChild(el('div', { class: 'menu-page' }, LT.renderBill({ begin: true })));
      LT.fx.embers(1.2);
      api.timeout(() => LT.audio.sfx('paper'), 200);
    },
  });
})();
