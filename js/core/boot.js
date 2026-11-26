/* Boot. Everything else is registered by now. */
(function () {
  'use strict';
  const LT = window.LT, C = LT.chapters;
  // where each course sits in the world (the camera glides between them)
  const set = (id, w) => { if (C[id]) C[id].world = Object.assign({}, C[id].world || {}, w); };
  set('record', { glideShot: 'course1', visible: false });
  set('spread', { glideShot: 'course2', visible: false });
  set('table', { glideShot: 'course3', visible: false });
  set('grace', { shot: 'grace', mood: { dim: 0.34, soft: 0.8, cursor: 0.2 }, light: { darkness: 0.42, radius: 520 } });
  const start = () => window.LT.app.start();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
