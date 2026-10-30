/* AIOU Coaching — Ollama local provider controls */
(function (w, d) {
  'use strict';
  function init() {
    if (!w.AIOU || !w.AIOU.ai || !d.getElementById('ollamaModel')) return;
    var AI = w.AIOU.ai;
    var model = d.getElementById('ollamaModel');
    var enabled = d.getElementById('ollamaEnabled');
    var status = d.getElementById('ollamaStatus');
    var message = d.getElementById('ollamaMessage');
    var save = d.getElementById('ollamaSave');
    var test = d.getElementById('ollamaTest');
    function show(text, kind) {
      message.textContent = text;
      message.className = 'stt ' + (kind || '');
      message.classList.remove('hid');
    }
    function load() {
      var cfg = AI.ollamaConfig();
      model.value = cfg.model;
      enabled.checked = cfg.enabled;
      status.textContent = cfg.enabled ? 'Enabled · local first' : 'Disabled';
    }
    save.addEventListener('click', function () {
      var cfg = AI.saveOllamaConfig({ enabled: enabled.checked, model: model.value });
      model.value = cfg.model;
      status.textContent = cfg.enabled ? 'Enabled · local first' : 'Disabled';
      show('Settings saved in this browser. Ollama model: ' + cfg.model, 'ok');
    });
    test.addEventListener('click', function () {
      AI.saveOllamaConfig({ enabled: true, model: model.value });
      test.disabled = true;
      show('Local Ollama se connection test ho raha hai…', 'ld');
      AI.testOllama().then(function (result) {
        if (result.ok) {
          status.textContent = 'Connected · ' + result.model;
          show('Ollama connected. Model response: ' + result.text, 'ok');
        } else {
          status.textContent = 'Not connected';
          show('Connection failed: ' + result.error + '. Ollama start karein, model pull karein aur OLLAMA_ORIGINS check karein.', 'err');
        }
        enabled.checked = AI.ollamaConfig().enabled;
      }).then(function () { test.disabled = false; }, function (err) {
        show('Test failed: ' + err.message, 'err'); test.disabled = false;
      });
    });
    load();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
