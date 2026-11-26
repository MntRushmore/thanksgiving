/* STUB — to be replaced. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  LT.chapter({
    id: 'leftovers', index: 5, numeral: 'V', course: 'Dessert', title: 'Leftovers',
    blurb: 'For later.', music: 'leftovers', transition: 'candle', light: { darkness: 0.5, radius: 460 },
    mount(root, api) {
      root.appendChild(el('div', { class: 'lt-center' }, el('p', { class: 'lt-eyebrow' }, 'Dessert'), el('h1', { class: 'lt-display', style: { fontSize: 'var(--step-4)' } }, 'Leftovers'), el('p', { class: 'lt-prose' }, 'Coming up.'), api.nextButton()));
    },
  });
})();
