/* Boot. Everything else is registered by now. */
(function () {
  'use strict';
  const start = () => window.LT.app.start();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
