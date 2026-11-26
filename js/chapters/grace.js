/* STUB — to be replaced. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  LT.chapter({
    id: 'grace', index: 4, numeral: 'IV', course: 'Fourth Course', title: 'Grace',
    blurb: 'What gratitude actually is.', music: 'grace', transition: 'candle', light: { darkness: 0.5, radius: 460 },
    mount(root, api) {
      root.appendChild(el('div', { class: 'lt-center' }, el('p', { class: 'lt-eyebrow' }, 'Fourth Course'), el('h1', { class: 'lt-display', style: { fontSize: 'var(--step-4)' } }, 'Grace'), el('p', { class: 'lt-prose' }, 'Coming up.'), api.nextButton()));
    },
  });
})();
