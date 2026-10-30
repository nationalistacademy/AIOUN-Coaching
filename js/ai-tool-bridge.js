/* Shared AI bridge for standalone AIOU tools.
 * Uses local Ollama when enabled; retains each tool's existing Worker as fallback.
 */
(function (w) {
  'use strict';
  w.AIOU = w.AIOU || {};
  w.AIOU.toolAI = {
    generate: async function (options) {
      options = options || {};
      var ai = w.AIOU.ai;
      if (ai && ai.ollamaConfig && ai.ollamaConfig().enabled) {
        var local = await ai.ask({
          system: options.system || '',
          user: options.user || '',
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          timeoutMs: options.timeoutMs || 180000
        });
        if (local && local.ok) return local.text;
        if (typeof options.fallback !== 'function') {
          throw new Error((local && local.error) || 'Local Ollama failed');
        }
      }
      if (typeof options.fallback === 'function') return options.fallback();
      throw new Error('AI provider is not configured');
    }
  };
})(window);
