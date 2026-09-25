// Vapez — Age Gate at the door. A nicotine storefront that will not show its
// shelves until BotShield says the visitor is over the threshold. Same widget
// as Ticketz; the difference is the SCOPE: `enter_site_age_check` is a gate of
// type "age" (threshold set in the Console — 18 for tobacco), so the ceremony
// returns age_verdict verified | unavailable, never a birthdate, never an ID.
// Served at /vapez; framed by the Demos shell.
export const vapezHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="noindex">
  <title>Vapez - Enter</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #000; color: #fff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
    .page { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; gap: 22px; padding: 16px; padding-top: calc(env(safe-area-inset-top, 0px) + 16px); padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .top-spacer { flex-shrink: 0; height: 34px; }
    .header { display: flex; align-items: center; gap: 12px; }
    .header-mark { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #0ea5e9, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; letter-spacing: -.04em; }
    .header-brand { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .header-sub { font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #6b6b6b; }
    .wrap { width: 100%; max-width: 430px; display: flex; flex-direction: column; gap: 16px; }

    /* ── Age wall ── */
    .wall { background: #111; border: 1px solid #1f1f1f; border-radius: 18px; padding: 26px 22px; display: flex; flex-direction: column; gap: 14px; }
    .wall-kicker { font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #ffb547; display: flex; align-items: center; gap: 8px; }
    .wall-kicker .dot { width: 6px; height: 6px; border-radius: 50%; background: #ffb547; }
    .wall h1 { font-size: 26px; font-weight: 700; letter-spacing: -.02em; line-height: 1.15; }
    .wall p { font-size: 14.5px; line-height: 1.55; color: #a3a3a3; }
    .wall p b { color: #e5e5e5; font-weight: 600; }
    .wall-note { font-size: 12.5px; color: #6b6b6b; line-height: 1.5; }
    .wall-note em { color: #c9c9c9; font-style: normal; }

    /* ── Store (revealed after the gate) ── */
    .store { display: none; flex-direction: column; gap: 16px; }
    .store.open { display: flex; }
    .store-banner { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(0, 212, 146, 0.08); border: 1px solid rgba(0, 212, 146, 0.35); border-radius: 12px; padding: 12px 14px; font-size: 13.5px; }
    .store-banner b { color: #00d492; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .item { background: #111; border: 1px solid #1f1f1f; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
    .item-art { height: 92px; border-radius: 10px; background: linear-gradient(160deg, #1b1f2a, #0f1117); display: flex; align-items: center; justify-content: center; font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .1em; color: #5b6070; }
    .item-name { font-size: 14px; font-weight: 600; }
    .item-meta { font-size: 12px; color: #7a7a7a; }
    .item-price { font-size: 14px; font-weight: 700; }
    .item-btn { margin-top: 2px; padding: 9px 10px; border-radius: 9px; border: 1px solid #2a2a2a; background: #161616; color: #d4d4d4; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
    .item-btn:active { background: #202020; }
    .legal { font-size: 11.5px; line-height: 1.5; color: #5b5b5b; text-align: center; padding: 0 8px; }

    /* ── Demo chrome (not part of the Vapez design) ── */
    .demo-controls { position: fixed; top: calc(env(safe-area-inset-top, 0px) + 12px); right: 12px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; z-index: 30000; }
    .demo-reset { background: rgba(26, 26, 26, 0.9); border: 1px solid #2a2a2a; border-radius: 8px; color: #c0c0c0; font-family: inherit; font-size: 12px; padding: 6px 10px; cursor: pointer; }
    .toast { position: fixed; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 24px); transform: translateX(-50%) translateY(20px); background: #0f2a20; border: 1px solid rgba(0, 212, 146, 0.4); color: #e6fff5; padding: 12px 16px; border-radius: 12px; font-size: 14px; max-width: 92vw; opacity: 0; transition: opacity .25s, transform .25s; pointer-events: none; z-index: 30001; text-align: center; }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* The widget's verify card + component-owned continue button. */
    botshield-verify { display: block; width: 100%; }
  </style>
</head>
<body>
  <div class="page">
    <div class="top-spacer"></div>
    <div class="header">
      <div class="header-mark">V</div>
      <div>
        <div class="header-brand">Vapez</div>
        <div class="header-sub">Adults only &middot; 18+</div>
      </div>
    </div>

    <div class="wrap">
      <!-- ── The door. Nothing behind it renders until the gate says yes. ── -->
      <section class="wall" id="wall">
        <div class="wall-kicker"><span class="dot"></span>Age-restricted store</div>
        <h1>You must be 18 or older to enter.</h1>
        <p>Vapez sells nicotine products. <b>Verify you&rsquo;re over 18 to continue.</b> BotShield checks the age your device already knows &mdash; no ID upload, no birthdate, nothing stored by Vapez.</p>
        <botshield-verify
          id="bsVerify"
          theme="dark"
          scan-mode="modal"
          signals="true"
          checkout-label="Enter site"
        ></botshield-verify>
        <p class="wall-note">What Vapez receives: <em>verified</em> or <em>unavailable</em>. On a phone without an age assertion the check is <em>unavailable</em> &mdash; the door stays closed, and you are told why.</p>
      </section>

      <!-- ── The store. Shown only after botshield:checkout (server-verified state). ── -->
      <section class="store" id="store">
        <div class="store-banner"><span><b>Over 18 &mdash; verified.</b> Welcome to Vapez.</span><span id="storeRef" style="font-family:'Roboto Mono',monospace;font-size:10.5px;color:#7a7a7a"></span></div>
        <div class="grid">
          <div class="item"><div class="item-art">DEVICE</div><div class="item-name">Vapez One</div><div class="item-meta">Pod system &middot; USB-C</div><div class="item-price">$29.00</div><button type="button" class="item-btn">Add to bag</button></div>
          <div class="item"><div class="item-art">PODS</div><div class="item-name">Mint &middot; 4-pack</div><div class="item-meta">2% nicotine</div><div class="item-price">$18.00</div><button type="button" class="item-btn">Add to bag</button></div>
          <div class="item"><div class="item-art">PODS</div><div class="item-name">Tobacco &middot; 4-pack</div><div class="item-meta">2% nicotine</div><div class="item-price">$18.00</div><button type="button" class="item-btn">Add to bag</button></div>
          <div class="item"><div class="item-art">ACCESSORY</div><div class="item-name">Travel case</div><div class="item-meta">Fits Vapez One</div><div class="item-price">$12.00</div><button type="button" class="item-btn">Add to bag</button></div>
        </div>
        <p class="legal">WARNING: This product contains nicotine. Nicotine is an addictive chemical. Demo storefront &mdash; nothing is for sale.</p>
      </section>
    </div>
  </div>

  <div class="demo-controls">
    <button type="button" class="demo-reset" id="demoNewVisitor" title="Forget this visitor — next Verify runs the first-visit ceremony">New visitor</button>
    <button type="button" class="demo-reset" id="demoReset">Reset</button>
  </div>
  <div class="toast" id="toast"></div>

  <script src="https://cdn.botshield.ai/sdk.js?v=16"></script>
  <script>
    var params = new URLSearchParams(window.location.search);
    // Same prod partner + key as Ticketz: the Vepez gate lives on that org.
    var SITE_KEY = params.get('site_key') || 'pk_live_e398598c7f5af741b540abffd49ae74e';
    var SCOPE = params.get('scope') || 'enter_site_age_check';
    var MODE = params.get('mode') || 'private';

    var bsVerify = document.getElementById('bsVerify');
    bsVerify.setAttribute('site-key', SITE_KEY);
    bsVerify.setAttribute('scope', SCOPE);
    bsVerify.setAttribute('mode', MODE);

    // Stable stand-in for the store's own user id (see the Ticketz page for
    // the full note): the first verification links it, later visits resolve
    // instantly. ?fresh=1 mints a new one.
    var REF_KEY = 'vpz_demo_user_ref';
    var userRef = localStorage.getItem(REF_KEY);
    if (!userRef || params.get('fresh')) {
      userRef = 'vpz_' + Array.from(crypto.getRandomValues(new Uint8Array(6))).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
      localStorage.setItem(REF_KEY, userRef);
    }
    bsVerify.setAttribute('platform-user-ref', userRef);

    var wall = document.getElementById('wall');
    var store = document.getElementById('store');
    var toast = document.getElementById('toast');
    function say(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(function() { toast.classList.remove('show'); }, 3200); }

    // Display only: a real store confirms the token on its server
    // (POST /sdk/verify-token) before opening the door. The demo peeks at the
    // JWT payload for the toast line — age_verdict is verified | unavailable.
    function ageVerdictOf(detail) {
      try {
        var tok = detail && (detail.token || detail.verification_token || detail.signed_token);
        if (!tok || tok.split('.').length < 3) return null;
        var b = tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        var claims = JSON.parse(atob(b + '='.repeat((4 - b.length % 4) % 4)));
        return claims.age_verdict || (claims.botshield && claims.botshield.age_verdict) || null;
      } catch (err) { return null; }
    }

    bsVerify.addEventListener('botshield:success', function(e) {
      var v = ageVerdictOf(e.detail);
      if (v === 'unavailable') say('Human verified \\u2014 but no age assertion on this device. The door stays closed; finish on a phone that has one.');
      else say('Over 18 \\u2014 verified. Tap Enter site.');
    });
    bsVerify.addEventListener('botshield:failure', function(e) { console.error('[Vapez] verification failed:', e.detail); });

    // The component only emits checkout when its server-verified state is
    // resolved — that is the door opening.
    bsVerify.addEventListener('botshield:checkout', function() {
      wall.style.display = 'none';
      store.classList.add('open');
      document.getElementById('storeRef').textContent = userRef;
      window.scrollTo(0, 0);
    });

    document.getElementById('demoReset').addEventListener('click', function() {
      store.classList.remove('open'); wall.style.display = '';
      bsVerify.reset();
    });
    document.getElementById('demoNewVisitor').addEventListener('click', function() {
      localStorage.removeItem(REF_KEY);
      userRef = 'vpz_' + Array.from(crypto.getRandomValues(new Uint8Array(6))).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
      localStorage.setItem(REF_KEY, userRef);
      bsVerify.setAttribute('platform-user-ref', userRef);
      store.classList.remove('open'); wall.style.display = '';
      bsVerify.reset();
      say('New visitor \\u2014 next verification runs the first-visit ceremony.');
    });
  </script>
</body>
</html>`;
