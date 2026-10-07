// Demo analytics — two layers (Paul 2026-10-06: "are people using this thing, which demo?").
//
// LAYER 1 · first-party, cookieless counts (no consent needed). The worker writes one Workers
// Analytics Engine data point per page view and per key step. Blobs carry only the event, the
// demo, a step, the country (request.cf), a coarse device class (mobile / desktop / bot) and the
// referrer HOST. No IP, no full user agent, no cookie, no id. Server-observable steps (page views,
// the Salesforce click-out, every Agents Ask step) are recorded by the worker itself; steps only
// the browser can see (the gate widget, outbound CTAs) arrive through a same-origin beacon,
// POST /api/e, allowlisted below.
//
// LAYER 2 · GTM / GA4 behind the SAME consent as botshield.ai and the Console: cookie
// `bs_consent=v1.<granted|denied>.<unix>` on .botshield.ai, Consent Mode v2 basic — everything
// starts denied, GTM-KQRP68TK loads ONLY when the stored choice is "granted". Framed demo pages
// never load GTM themselves; they push their events into the shell's dataLayer (same origin).
//
// The snippets below are plain JS inside String.raw so their regexes keep their backslashes
// (TS template literals eat single backslashes — see scripts/check-pages.mjs).

export interface AnalyticsEnv {
  DEMO_EVENTS?: { writeDataPoint(p: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void };
}

/** Path → demo key. '/' is the shell. */
export const PATH_DEMO: Record<string, string> = {
  '/': 'shell', '/ticketz': 'ticketz', '/vapez': 'vapez', '/agent': 'agent', '/trusted': 'trusted', '/salesforce': 'salesforce',
  '/signup': 'signup', '/drop': 'drop', '/firm': 'firm',
};

/** Events the browser may report through POST /api/e (everything else is recorded server-side). */
const BEACON_EVENTS = new Set(['verify_start', 'verify_complete', 'verify_unavailable', 'verify_checkout', 'cta_click']);
const BEACON_DEMOS = new Set(['shell', 'ticketz', 'vapez', 'trusted', 'agent', 'signup', 'drop', 'firm']);

function deviceClass(ua: string): string {
  if (!ua || /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|curl|wget|python|httpclient/i.test(ua)) return 'bot';
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop';
}

function refHost(request: Request): string {
  try { return new URL(request.headers.get('Referer') || '').hostname.slice(0, 80); } catch { return ''; }
}

/** One data point. Never throws; never blocks the response. */
export function record(env: AnalyticsEnv, request: Request, event: string, demo: string, step = ''): void {
  try {
    if (!env.DEMO_EVENTS) return;
    const cf = (request as unknown as { cf?: { country?: string } }).cf;
    env.DEMO_EVENTS.writeDataPoint({
      blobs: [event, demo, step.slice(0, 32), (cf?.country || '').slice(0, 2), deviceClass(request.headers.get('User-Agent') || ''), refHost(request)],
      doubles: [1],
      indexes: [demo],
    });
  } catch { /* analytics must never break a demo */ }
}

/** POST /api/e — one allowlisted browser event per request, same origin only. */
export async function beacon(env: AnalyticsEnv, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return new Response(null, { status: 403 });
  const text = (await request.text()).slice(0, 512);
  let b: { event?: unknown; demo?: unknown; step?: unknown } = {};
  try { b = JSON.parse(text); } catch { return new Response(null, { status: 400 }); }
  const event = String(b.event || ''); const demo = String(b.demo || '');
  const step = /^[a-z0-9_-]{0,32}$/.test(String(b.step || '')) ? String(b.step || '') : '';
  if (!BEACON_EVENTS.has(event) || !BEACON_DEMOS.has(demo)) return new Response(null, { status: 400 });
  record(env, request, event, demo, step);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

// ── Browser side ────────────────────────────────────────────────────────────

/** <head>: consent default + GTM loader (top-level documents only) + window.bsTrack + auto-wiring. */
const HEAD_JS = String.raw`(function(w,d){
w.dataLayer=w.dataLayer||[];function gtag(){w.dataLayer.push(arguments)}w.gtag=w.gtag||gtag;
var TOP=w;try{if(w.top!==w&&w.top.location.host===w.location.host)TOP=w.top}catch(e){}
var framed=TOP!==w;
var m=d.cookie.match(/(?:^|;\s*)bs_consent=v1\.(granted|denied)\.(\d+)/);
var c=m&&(Date.now()/1000-Number(m[2])<31536000)?m[1]:null;w.__bsConsent=c;
if(!framed){
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted'});
var loaded=false;w.__bsLoadGtm=function(){if(loaded)return;loaded=true;
w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var j=d.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=GTM-KQRP68TK';d.head.appendChild(j)};
if(c==='granted'){gtag('consent','update',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});w.__bsLoadGtm()}
}
var host=w.location.hostname;var env=(/staging/.test(host)||host==='localhost'||host==='127.0.0.1')?'staging':'production';
var demo=({'/':'shell','/ticketz':'ticketz','/vapez':'vapez','/agent':'agent','/trusted':'trusted','/signup':'signup','/drop':'drop','/firm':'firm'})[w.location.pathname.replace(/\/+$/,'')||'/']||'shell';
w.__bsDemo=demo;
w.bsTrack=function(event,params,toServer){
try{var p={event:event,surface:'demo',env:env,demo:demo};if(params)for(var k in params)p[k]=params[k];
TOP.dataLayer=TOP.dataLayer||[];TOP.dataLayer.push(p)}catch(e){}
if(toServer){try{var body=JSON.stringify({event:event,demo:(params&&params.demo)||demo,step:(params&&(params.step||params.target))||''});
if(navigator.sendBeacon)navigator.sendBeacon('/api/e',new Blob([body],{type:'application/json'}));
else fetch('/api/e',{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:true})}catch(e){}}
};
if(demo!=='shell')w.bsTrack('demo_open',{demo:demo});
var started=false,done=false;
d.addEventListener('pointerdown',function(e){var t=e.target;if(!started&&t&&t.closest&&t.closest('botshield-verify')){started=true;w.bsTrack('verify_start',{demo:demo},true)}},true);
function ageVerdict(x){try{var t=x&&(x.token||x.verification_token||x.signed_token);if(!t||t.split('.').length<3)return null;
var b=t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');var cl=JSON.parse(atob(b+'='.repeat((4-b.length%4)%4)));
return cl.age_verdict||(cl.botshield&&cl.botshield.age_verdict)||null}catch(e){return null}}
d.addEventListener('botshield:success',function(e){if(done)return;done=true;
w.bsTrack(ageVerdict(e.detail)==='unavailable'?'verify_unavailable':'verify_complete',{demo:demo},true)});
d.addEventListener('botshield:failure',function(){if(done)return;done=true;w.bsTrack('verify_unavailable',{demo:demo},true)});
d.addEventListener('botshield:checkout',function(){w.bsTrack('verify_checkout',{demo:demo},true)});
d.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('[data-cta]');
if(a)w.bsTrack(a.getAttribute('data-cta')==='salesforce'?'salesforce_click':'cta_click',{target:a.getAttribute('data-cta')},a.getAttribute('data-cta')!=='salesforce')},true);
})(window,document);`;

/** Bottom of <body>: the consent card — shown only in the top-level document, only without a choice. */
const BANNER_CSS = `
  .bsc { position: fixed; z-index: 2147483000; left: 16px; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); max-width: 400px; padding: 18px 20px; background: #0e1013; color: #f5f5f6; border: 1px solid #23262c; border-radius: 16px; box-shadow: 0 18px 50px -12px rgba(0,0,0,.7); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; transition: opacity .2s ease, transform .2s ease; }
  .bsc[hidden] { display: none !important; }
  .bsc h2 { font-size: 15px; font-weight: 600; line-height: 1.3; margin: 0; }
  .bsc p { margin: 8px 0 0; font-size: 13.5px; line-height: 1.55; color: #9a9ea6; }
  .bsc .row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 16px; }
  .bsc button { font: 600 13.5px 'Inter', sans-serif; color: #f5f5f6; background: #15191f; border: 1px solid #2a2e36; border-radius: 10px; padding: 8px 14px; cursor: pointer; }
  .bsc button:hover { border-color: #3a404b; }
  .bsc a { margin-left: auto; font-size: 13.5px; color: #9a9ea6; text-decoration: underline; text-underline-offset: 3px; }
  .bsc a:hover { color: #f5f5f6; }
  .bsc button:focus-visible, .bsc a:focus-visible { outline: 2px solid #147baa; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .bsc { transition: none; } }
`;

const BANNER_JS = String.raw`(function(w,d){
var TOP=w;try{if(w.top!==w&&w.top.location.host===w.location.host)TOP=w.top}catch(e){}
var el=d.getElementById('bsc');if(!el)return;
if(TOP!==w){el.parentNode.removeChild(el);return}
function gtag(){w.dataLayer=w.dataLayer||[];w.dataLayer.push(arguments)}
function write(choice){var now=Math.floor(Date.now()/1000);var onSite=/(^|\.)botshield\.ai$/.test(w.location.hostname);
try{d.cookie='bs_consent=v1.'+choice+'.'+now+'; '+(onSite?'Domain=.botshield.ai; ':'')+'Path=/; Max-Age=31536000; SameSite=Lax'+(w.location.protocol==='https:'?'; Secure':'')}catch(e){}
w.__bsConsent=choice}
function show(){el.hidden=false;var b=el.querySelector('button');if(b)try{b.focus({preventScroll:true})}catch(e){}}
function hide(){el.hidden=true}
d.getElementById('bscAccept').addEventListener('click',function(){write('granted');
gtag('consent','update',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
try{w.__bsLoadGtm&&w.__bsLoadGtm()}catch(e){}hide()});
d.getElementById('bscDecline').addEventListener('click',function(){var was=w.__bsConsent;write('denied');
if(was==='granted')gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});hide()});
w.__bsOpenConsent=show;
d.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('[data-cookie-settings]');if(a){e.preventDefault();show()}});
if(!w.__bsConsent)show();
})(window,document);`;

const BANNER_HTML = `
  <section class="bsc" id="bsc" hidden role="region" aria-labelledby="bscTitle" aria-live="polite">
    <h2 id="bscTitle">Cookies on BotShield Demos</h2>
    <p>We use analytics cookies (Google) to see how people find BotShield. Nothing from your verifications or your users is ever included. You can change this any time.</p>
    <div class="row">
      <button type="button" id="bscAccept">Accept analytics</button>
      <button type="button" id="bscDecline">Decline</button>
      <a href="https://botshield.ai/privacy" target="_blank" rel="noopener">Privacy</a>
    </div>
  </section>`;

/** The pieces, for scripts/check-pages.mjs to parse-check. */
export const analyticsHead = `<script>${HEAD_JS}</script>`;
export const analyticsFoot = `<style>${BANNER_CSS}</style>${BANNER_HTML}\n  <script>${BANNER_JS}</script>`;

/** Inject both layers' browser pieces into a page. */
export function withAnalytics(html: string): string {
  return html.replace('</head>', `  ${analyticsHead}\n</head>`).replace(/<\/body>(?![\s\S]*<\/body>)/, `${analyticsFoot}\n</body>`);
}
