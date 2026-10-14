// Which BotShield backend a demo page runs against, picked IN THE BROWSER from
// the host the page is served on (pages are framed same-origin by the shell, so
// window.location.hostname is the worker's host):
//   demo.botshield.ai          → production: cdn.botshield.ai (→ wg.botshield.ai) + prod site keys.
//                                 `?sdk=next` still loads the /next prerelease from the prod CDN.
//   demo-staging.botshield.ai,
//   localhost / 127.0.0.1      → staging: cdn-staging.botshield.ai/next/sdk.js (→ wg-staging) + staging site keys.
//
// These are JS EXPRESSIONS interpolated into the page templates. No regex and
// no backslashes on purpose — the templates eat single backslashes (see
// scripts/check-pages.mjs).

/** JS expression: true on the staging worker or local dev. */
export const IS_STAGING_JS = `(['demo-staging.botshield.ai', 'localhost', '127.0.0.1'].indexOf(window.location.hostname) >= 0)`;

/** JS expression for the widget script URL. The production branch is exactly what the pages loaded before staging existed. */
export const SDK_SRC_JS = `(${IS_STAGING_JS} ? 'https://cdn-staging.botshield.ai/next/sdk.js' : (window.location.search.indexOf('sdk=next') >= 0 ? 'https://cdn.botshield.ai/next/sdk.js' : 'https://cdn.botshield.ai/sdk.js?v=17'))`;

/**
 * JS statements: on staging, pin a small note to the corner of the page.
 * `msg` is a plain JS string literal body (no quotes, no backslashes).
 */
export function stagingNoteJs(msg: string): string {
  return `if (${IS_STAGING_JS}) { (function () { var n = document.createElement('div'); n.textContent = '${msg}'; n.setAttribute('data-staging-note', ''); n.style.cssText = 'position:fixed;top:8px;right:8px;z-index:2147483646;max-width:62%;font:600 11px/1.35 Inter,system-ui,sans-serif;color:#f7b955;background:rgba(24,18,6,.92);border:1px solid rgba(247,144,9,.45);border-radius:8px;padding:6px 9px;pointer-events:none'; (document.body || document.documentElement).appendChild(n); })(); }`;
}

/**
 * JS statements for a gate page: declares STAGING_SITE_KEY (the page's staging
 * key, or '' when none is known yet) and shows the staging note.
 */
export function stagingGateJs(stagingKey: string, demo: string): string {
  return `var STAGING_SITE_KEY = '${stagingKey}';
    ${stagingNoteJs(stagingKey ? 'Staging engine' : 'Staging engine · no staging site key for ' + demo + ' yet')}`;
}
