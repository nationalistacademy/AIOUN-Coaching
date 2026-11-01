# AIOU Coaching AI Worker — Security Audit and Hardening

**Audit date:** 2026-11-02  
**Scope:** Repository source only. No Cloudflare account, secret values, deployed Worker runtime, provider billing console, or DNS settings were accessed or changed.  
**Status:** Hardened source prepared; deployment remains blocked until owner-controlled Cloudflare configuration and smoke tests are complete.

## Executive summary

The prior multi-provider Worker source was not ready for an untrusted public browser client. It accepted any non-empty messages array, trusted the `Content-Length` header for its size check, exposed configured-provider flags in its unauthenticated health response, returned upstream error detail, and had no enforced Cloudflare rate-limit binding. The browser-side `js/store.js` also persists configured Worker tokens in localStorage.

This revision adds strict origin checks, session-token authentication, bounded streaming request reads, message/model allowlists, output-token caps, sanitized provider errors, a mandatory Cloudflare Rate Limiting binding, and non-cacheable security headers. It removes arbitrary Codex/Freebuff endpoint URL support; those integrations remain disabled until a documented, verified endpoint is supplied and reviewed.

## Findings

| Finding | Severity | Evidence / impact | Remediation |
|---|---|---|---|
| Worker request size depended on Content-Length | High | Missing or inaccurate header could bypass the application-level 64 KB check | Read the request stream and stop at 16 KB |
| Message schema was not constrained | High | Arbitrary roles/content and unbounded message count could be forwarded upstream | Allow only system/user/assistant text; 12 messages max, 6,000 chars each, 14,000 chars total |
| No enforced rate limiter | High | A leaked token or abusive client could consume provider quota | Require `AI_RATE_LIMITER` binding; fail closed if absent |
| Provider/model selection was not allowlisted | High | A caller could request arbitrary model identifiers supported by configured credentials | Restrict to `ALLOWED_MODELS`; default allowlist is DeepSeek Chat and Reasoner only |
| Unauthenticated health disclosed provider configuration | Medium | Exposed which provider secrets were configured | Health returns enabled model IDs only; no secret-presence flags |
| Raw upstream errors were returned to callers | Medium | Could expose unnecessary provider response details | Return generic provider failure and HTTP status only |
| Arbitrary Codex/Freebuff URLs were configurable | High | A wrong or malicious URL could receive an API key from the Worker | Remove custom URL provider branches; do not enable without a fixed, verified provider contract |
| Legacy client persists Worker tokens in localStorage | High | Any script running in that origin can read browser storage | New Content Studio uses a manually entered, one-request session token; legacy token manager is not used by this Studio |
| CORS was previously treated as a major access gate | Medium | CORS is browser policy, not authentication | Retain exact origin allowlist as defense in depth; require the server-side token separately |

### Important source-history clarification

The `AUTH_TOKEN` declarations found in the three legacy HTML tools on the default branch were empty string placeholders at the time of this audit; no non-empty token value was found in those declarations. However, the legacy tools read user-configured tokens from localStorage and send them in `X-Auth-Token`. Do not put a shared production token into those tools or browser storage.

## Hardened Worker behavior

- Allows only configured HTTPS origins; wildcard CORS is not used.
- Requires `AUTH_TOKEN` as a Cloudflare Worker Secret for POST requests.
- Requires the Cloudflare `AI_RATE_LIMITER` binding; missing binding returns 503.
- Rate-limit key is the client IP plus the AI Content Studio route.
- Reads the body with a 16 KB streaming cap; Content-Length is only an early check.
- Validates message roles and plain-text content; limits count and aggregate length.
- Allows only models explicitly listed in `ALLOWED_MODELS` and backed by a configured provider secret.
- Default model allowlist: `deepseek/deepseek-chat,deepseek/deepseek-reasoner`.
- Caps output at 2,048 tokens and timeout at 90 seconds.
- Does not support arbitrary provider URLs, Codex endpoint URLs, or Freebuff endpoint URLs.
- Does not log prompts, access tokens, or provider keys.
- Uses `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer`.

Cloudflare's Rate Limiting API is approximate and local to each Cloudflare location. It is not a global hard spend cap. Set provider-side usage/spend alerts or caps as an additional control.

## Provider support

The Worker retains fixed official provider endpoints for Ollama Cloud, OpenRouter, DeepSeek and Anthropic. Only models listed in the Cloudflare `ALLOWED_MODELS` variable and backed by a corresponding secret appear in the health response. DeepSeek Chat and Reasoner are the default allowlist because these model identifiers were already returned by the user's prior service health response and the official DeepSeek Chat Completions API documents the request format.

Ollama, OpenRouter and Anthropic models must be explicitly added to `ALLOWED_MODELS` after checking the current provider model catalogue and account access. Codex and Freebuff are disabled: no custom base URL is accepted by this hardened Worker.

## Required Cloudflare configuration — owner action

1. Review the Worker name and deployed `workers.dev` hostname in the Cloudflare dashboard. The repository has had different historical Worker labels/URLs; no single deployed endpoint is assumed by the Studio.
2. Create a fresh `AUTH_TOKEN` secret. Do not reuse a token copied into a browser, a public file, or an old localStorage entry.
3. Configure `DEEPSEEK_API_KEY` as a Worker Secret if enabling the default DeepSeek models. Add other provider keys only when needed.
4. Set `ALLOWED_ORIGINS` to the exact HTTPS origin(s) from which the Content Studio will be opened. Do not use `*`.
5. Set `ALLOWED_MODELS` explicitly. Start with `deepseek/deepseek-chat,deepseek/deepseek-reasoner` only if those account models are available.
6. Set `DEFAULT_MODEL` to one entry from `ALLOWED_MODELS`.
7. Configure a Cloudflare Workers Rate Limiting binding named exactly `AI_RATE_LIMITER`, with a unique positive-integer namespace ID for this Cloudflare account. Start conservatively (for example, 5 requests per 60 seconds per IP). The namespace ID must be chosen in the Cloudflare account; this repository does not guess it.
8. Confirm provider-side usage alerts/limits before enabling provider traffic.
9. Deploy from `worker/` only after reviewing this checklist. No deployment was performed by this audit.

## Content Studio connection

The Studio's optional connection panel:
- Has no prefilled Worker endpoint.
- Accepts only an HTTPS `.workers.dev` root URL.
- Calls GET and checks the AIOU Coaching Worker service identifier and enabled model list before enabling generation.
- Requires the editor to paste a fresh token for a generation request.
- Does not save the endpoint or token in localStorage or exported drafts.
- Clears the token input immediately after reading it for a single request.
- Sends prompts to the selected Worker/provider; users must remove roll numbers, student records, passwords, payment details and confidential client data.
- Does not publish content to Blogger.

The health check verifies the service response shape, not ownership of the hostname. Use only the exact Worker URL shown in your Cloudflare dashboard.

## Validation completed

- JavaScript syntax parsing passed for the hardened Worker source.
- JavaScript syntax parsing passed for the Content Studio source after adding the optional connector.
- No provider API call, Cloudflare deployment, secret read, DNS change, or production configuration change was made.
- Runtime smoke tests against a deployed Worker remain pending because no verified deployment endpoint or Cloudflare account configuration is available in this repository audit.

## Official references

- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/runtime-apis/bindings/secrets/)
- [Cloudflare Workers Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Cloudflare Workers platform limits](https://developers.cloudflare.com/workers/platform/limits/)
- [DeepSeek Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion)
- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages)
- [Ollama Chat API](https://docs.ollama.com/api/chat)
- [OpenRouter API reference](https://openrouter.ai/docs/api-reference/overview)
