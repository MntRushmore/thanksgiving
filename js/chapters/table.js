/* STUB — to be replaced. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  LT.chapter({
    id: 'table', index: 3, numeral: 'III', course: 'Third Course', title: 'The Table',
    blurb: 'Survive dinner with the family.', music: 'table', transition: 'candle', light: { darkness: 0.5, radius: 460 },
    mount(root, api) {
      root.appendChild(el('div', { class: 'lt-center' }, el('p', { class: 'lt-eyebrow' }, 'Third Course'), el('h1', { class: 'lt-display', style: { fontSize: 'var(--step-4)' } }, 'The Table'), el('p', { class: 'lt-prose' }, 'Coming up.'), api.nextButton()));
    },
  });
})();
