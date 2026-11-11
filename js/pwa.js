/* PWA registration and install affordance for the GitHub Pages study app. */
(function () {
  'use strict';
  var script = document.currentScript;
  var scriptUrl = script && script.src ? new URL(script.src) : new URL('js/pwa.js', location.href);
  var basePath = scriptUrl.pathname.replace(/js\/pwa\.js(?:\?.*)?$/, '');
  var appBase = new URL(basePath || '/', scriptUrl.origin);
  var installPrompt = null;
  var installButtons = Array.prototype.slice.call(document.querySelectorAll('#pwa-install, #pwa-install-card'));
  var statusNode = document.getElementById('pwa-status');

  function status(message) {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.hidden = !message;
  }

  function setInstallButtonsHidden(hidden) {
    installButtons.forEach(function (button) { button.hidden = hidden; });
  }

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register(new URL('sw.js', appBase).href, { scope: appBase.pathname })
      .then(function () { status('App ready — previously visited pages may work offline.'); })
      .catch(function () { status('Offline mode could not be enabled on this visit.'); });
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installPrompt = event;
    setInstallButtonsHidden(false);
  });

  installButtons.forEach(function (button) {
    button.addEventListener('click', async function () {
      if (!installPrompt) {
        status('Install option not available in this browser yet. Use the browser menu → Install app / Add to Home screen.');
        return;
      }
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      setInstallButtonsHidden(true);
    });
  });

  window.addEventListener('appinstalled', function () {
    setInstallButtonsHidden(true);
    status('AIOU Coaching app installed.');
  });
  window.addEventListener('online', function () { status('Back online.'); });
  window.addEventListener('offline', function () { status('Offline mode — only cached pages and files are available.'); });
})();
