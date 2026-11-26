/* STUB — to be replaced. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  LT.chapter({
    id: 'spread', index: 2, numeral: 'II', course: 'Second Course', title: 'The Spread',
    blurb: 'The strange true stories of the food.', music: 'spread', transition: 'candle', light: { darkness: 0.5, radius: 460 },
    mount(root, api) {
      root.appendChild(el('div', { class: 'lt-center' }, el('p', { class: 'lt-eyebrow' }, 'Second Course'), el('h1', { class: 'lt-display', style: { fontSize: 'var(--step-4)' } }, 'The Spread'), el('p', { class: 'lt-prose' }, 'Coming up.'), api.nextButton()));
    },
  });
})();
