/* STUB — to be replaced. */
(function () {
  'use strict';
  const LT = window.LT, U = LT.util, el = U.el;
  LT.chapter({
    id: 'record', index: 1, numeral: 'I', course: 'First Course', title: 'The Record',
    blurb: 'What actually happened in 1621, and in the 405 years after.', music: 'record', transition: 'candle', light: { darkness: 0.5, radius: 460 },
    mount(root, api) {
      root.appendChild(el('div', { class: 'lt-center' }, el('p', { class: 'lt-eyebrow' }, 'First Course'), el('h1', { class: 'lt-display', style: { fontSize: 'var(--step-4)' } }, 'The Record'), el('p', { class: 'lt-prose' }, 'Coming up.'), api.nextButton()));
    },
  });
})();
