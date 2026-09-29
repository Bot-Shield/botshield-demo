// Ticketz — Trusted Accounts. The visitor has a Ticketz account and secures it
// with their BotShield ID: the 3.0 widget with `notarize` on the Ticketz
// Account gate (Human · Recent Presence · "Notarize account with BotShield" on
// in the Console). The ceremony is real, on production: the tap hands off to
// the BotShield app, a passkey confirms, and the account row appears in the
// person's BotShield app (Trusted Accounts) and in the Ticketz Console registry.
//
// The moments: secure the account → "Your account is secured"; a SECOND Ticketz
// account can't be secured by the same human (409 already_trusted — one human,
// one account); back on the first account, a pass reports trusted: true.
//
// Demo accounts are stable per browser (localStorage), never an email — the
// widget refuses an email-shaped ref (notarize_ref_must_be_stable).
// Served at /trusted; framed by the Demos shell.
export const trustedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="noindex">
  <title>Ticketz - Your account</title>
  <link rel="icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #000; color: #fff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
    .page { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 16px; padding-top: calc(env(safe-area-inset-top, 0px) + 16px); padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px); overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .top-spacer { flex-shrink: 0; height: 34px; }
    .header { display: flex; align-items: center; justify-content: center; gap: 9.5px; flex-shrink: 0; }
    .header-logo { width: 31px; height: 31px; border-radius: 50%; background: #7c3aed; display: flex; align-items: center; justify-content: center; }
    .header-logo svg { width: 16px; height: 16px; fill: #fff; }
    .header-brand { font-size: 19px; font-weight: 600; line-height: 28.7px; }
    .wrap { width: 100%; max-width: 430px; display: flex; flex-direction: column; gap: 16px; }

    /* ── Account card ── */
    .kicker { font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #6b6b6b; }
    .acct { background: #111; border: 1px solid #1f1f1f; border-radius: 18px; padding: 18px; display: flex; align-items: center; gap: 14px; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #2a1a3e, #1a1a2e); border: 1px solid #2c2140; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #a78bfa; font-size: 16px; flex-shrink: 0; }
    .acct-who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .acct-name { font-size: 17px; font-weight: 600; }
    .acct-id { font-family: 'Roboto Mono', monospace; font-size: 11px; color: #6b6b6b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .secured { display: none; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #00d492; border: 1px solid rgba(0, 212, 146, .4); background: rgba(0, 212, 146, .08); border-radius: 999px; padding: 5px 10px; white-space: nowrap; }
    .secured.on { display: inline-flex; }
    .secured svg { width: 13px; height: 13px; }

    /* ── Switcher between the visitor's demo accounts ── */
    .switch { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { font-family: inherit; font-size: 12.5px; font-weight: 600; color: #bdbdbd; background: #111; border: 1px solid #262626; border-radius: 999px; padding: 7px 12px; cursor: pointer; }
    .chip.on { color: #fff; border-color: #7c3aed; background: #1a1230; }
    .chip.add { color: #a78bfa; border-style: dashed; }

    /* ── Secure panel ── */
    .panel { display: flex; flex-direction: column; gap: 12px; }
    .panel h1 { font-size: 22px; font-weight: 700; letter-spacing: -.02em; line-height: 1.2; }
    .panel h1:empty { display: none; }
    .panel p { font-size: 14px; line-height: 1.55; color: #a3a3a3; padding: 0 2px; }
    .panel p b { color: #e5e5e5; font-weight: 600; }
    botshield-verify { display: block; width: 100%; }
    botshield-verify.hide { display: none; }
    .again { display: none; font-family: inherit; font-size: 14px; font-weight: 600; color: #fff; background: #7c3aed; border: 0; border-radius: 12px; padding: 13px 16px; cursor: pointer; }
    .again.on { display: block; }

    /* ── Callouts for the demo moments ── */
    .note { display: none; border-radius: 14px; padding: 14px 16px; font-size: 13.5px; line-height: 1.55; }
    .note.on { display: block; }
    .note b { font-weight: 600; }
    .note.ok { background: rgba(0, 212, 146, .08); border: 1px solid rgba(0, 212, 146, .35); color: #d9fff0; }
    .note.ok b { color: #00d492; }
    .note.one { background: rgba(255, 181, 71, .08); border: 1px solid rgba(255, 181, 71, .35); color: #fff1dc; }
    .note.one b { color: #ffb547; }
    .note.info { background: #0e1520; border: 1px solid #1d2b3d; color: #cfe3f5; }
    .note.info b { color: #5fb6e8; }
    .note ol { margin: 8px 0 0 18px; }
    .note li { margin: 3px 0; }

    .how { font-size: 12.5px; line-height: 1.55; color: #6b6b6b; text-align: center; padding: 0 6px; }
    .how b { color: #9a9a9a; font-weight: 600; }

    /* ── Demo chrome (not part of the Ticketz design) ── */
    .demo-controls { position: fixed; top: calc(env(safe-area-inset-top, 0px) + 12px); right: 12px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; z-index: 30000; }
    .demo-reset { background: rgba(26, 26, 26, 0.9); border: 1px solid #2a2a2a; border-radius: 8px; color: #c0c0c0; font-family: inherit; font-size: 12px; padding: 6px 10px; cursor: pointer; }
    .toast { position: fixed; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 24px); transform: translateX(-50%) translateY(20px); background: #0f2a20; border: 1px solid rgba(0, 212, 146, 0.4); color: #e6fff5; padding: 12px 16px; border-radius: 12px; font-size: 14px; max-width: 92vw; opacity: 0; transition: opacity .25s, transform .25s; pointer-events: none; z-index: 30001; text-align: center; }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  </style>
</head>
<body>
  <div class="page">
    <div class="top-spacer"></div>
    <div class="header">
      <div class="header-logo"><svg viewBox="0 0 24 24"><path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1a3 3 0 000 6v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a3 3 0 000-6V9z"/></svg></div>
      <div class="header-brand">Ticketz</div>
    </div>

    <div class="wrap">
      <div class="kicker">Your account</div>
      <div class="acct">
        <div class="avatar" id="avatar">G</div>
        <div class="acct-who">
          <div class="acct-name" id="acctName">Guest</div>
          <div class="acct-id" id="acctId"></div>
        </div>
        <span class="secured" id="secured"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3v6c0 5-3.5 9.3-8 11-4.5-1.7-8-6-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>Secured</span>
      </div>
      <div class="switch" id="switch"></div>

      <section class="panel">
        <h1 id="panelTitle"></h1>
        <p id="panelBody">Link this Ticketz account to your <b>BotShield ID</b>. Ticketz learns a real person is behind it &mdash; <b>never who</b>.</p>
        <botshield-verify
          id="bsVerify"
          theme="dark"
          scan-mode="modal"
          signals="true"
          notarize
          checkout="false"
        ></botshield-verify>
        <button type="button" class="again" id="signInAgain">Sign in again</button>
      </section>

      <div class="note ok" id="noteSecured"><b>Your account is secured.</b> Open the BotShield app &rarr; <b>Trusted Accounts</b>: Ticketz is there. Ticketz sees it too, in its Console registry &mdash; as a handle, never your name.<br><br>Now try <b>+ Second account</b> above.</div>
      <div class="note one" id="noteOne"><b>Already secured by your BotShield ID.</b> Your BotShield ID secures one Ticketz account &mdash; that&rsquo;s the promise Ticketz relies on. This second account can&rsquo;t be secured by you.<br><br>Switch back to your first account &mdash; it&rsquo;s still secured.</div>
      <div class="note ok" id="noteBack"><b>Welcome back &mdash; trusted.</b> Same human, same account: Ticketz gets <b>trusted: true</b> on this pass, no new setup.</div>
      <div class="note info" id="noteUnlinked"><b>Unlinked.</b> This Ticketz account is no longer secured by your BotShield ID &mdash; you unlinked it in the BotShield app, or Ticketz revoked it. Link it again any time.</div>
      <div class="note info" id="noteReset"><b>Start over</b><ol><li>In the BotShield app: Trusted Accounts &rarr; Ticketz &rarr; <b>Unlink</b>.</li><li>Tap <b>Start over</b> (top right) for fresh Ticketz accounts.</li></ol></div>

      <p class="how"><b>What you&rsquo;re watching:</b> the BotShield Gate widget with Trusted Accounts on, against production. The tap hands off to the BotShield app; your passkey confirms. Ticketz receives a yes and a per-platform handle &mdash; no email, no name, no device ID.</p>
    </div>
  </div>

  <div class="demo-controls">
    <button type="button" class="demo-reset" id="demoHowReset">How to reset</button>
    <button type="button" class="demo-reset" id="demoStartOver">Start over</button>
  </div>
  <div class="toast" id="toast"></div>

  <!-- ?sdk=next loads the prerelease widget (the /next channel) for testing. -->
  <script>(function () { var n = /[?&]sdk=next\\b/.test(window.location.search); var s = document.createElement('script'); s.src = n ? 'https://cdn.botshield.ai/next/sdk.js' : 'https://cdn.botshield.ai/sdk.js?v=17'; document.head.appendChild(s); })();</script>
  <script>
    var params = new URLSearchParams(window.location.search);
    // Coming back from the BotShield app (phone hand-off): the app returns to
    // this page's own URL with ?token=. Opened on its own (not in the Demos
    // shell) → move into the shell and carry the query; the shell hands it to
    // this frame.
    var returnTopLevel = window.top === window.self && !!params.get('token');
    // Production Ticketz org + key; the gate is "Ticketz Account" in its Console.
    var SITE_KEY = params.get('site_key') || 'pk_live_e398598c7f5af741b540abffd49ae74e';
    var SCOPE = params.get('scope') || 'ticketz_account';
    var MODE = params.get('mode') || 'private';

    // The visitor's demo Ticketz accounts: stable per browser, never an email.
    var STORE_KEY = 'tkz_demo_accounts_v1';
    function hex(n) { return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(function(b) { return b.toString(16).padStart(2, '0'); }).join(''); }
    function newAccount() {
      var num = 1000 + (crypto.getRandomValues(new Uint16Array(1))[0] % 9000);
      return { ref: 'tkz-demo-' + hex(6), name: 'Guest ' + num, secured: false };
    }
    function load() {
      try { var s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (s && Array.isArray(s.accounts) && s.accounts.length) return s; } catch (err) { /* fresh */ }
      return { accounts: [newAccount()], active: 0 };
    }
    function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (err) { /* private mode */ } }
    var state = params.get('fresh') ? { accounts: [newAccount()], active: 0 } : load();
    save();

    // The tab the app returned to (opened by the widget for the hand-off):
    // record the result — the original demo tab picks it up from storage —
    // and close, so there is no second demo tab and no reload flash. A browser
    // that refuses to close it gets the demo in the shell instead.
    if (returnTopLevel) {
      var rc = claimsOf(params.get('token')) || {};
      if (rc.trusted === true) { state.accounts[state.active].secured = true; save(); }
      try { window.close(); } catch (err) { /* not closable */ }
      setTimeout(function() { window.location.replace('/' + window.location.search + '#trusted'); }, 400);
    }

    var bsVerify = document.getElementById('bsVerify');
    bsVerify.setAttribute('site-key', SITE_KEY);
    bsVerify.setAttribute('scope', SCOPE);
    bsVerify.setAttribute('mode', MODE);

    var toast = document.getElementById('toast');
    function say(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(function() { toast.classList.remove('show'); }, 3400); }
    function note(id) { ['noteSecured', 'noteOne', 'noteBack', 'noteReset', 'noteUnlinked'].forEach(function(n) { document.getElementById(n).classList.toggle('on', n === id); }); }
    function acct() { return state.accounts[state.active]; }

    /** A secured account shows the finished state; "Sign in again" brings the widget back for a returning pass. */
    var returning = false;
    document.getElementById('signInAgain').addEventListener('click', function() {
      returning = true;
      note(null);
      if (typeof bsVerify.reset === 'function') bsVerify.reset();
      render();
    });

    function render() {
      var a = acct();
      document.getElementById('acctName').textContent = a.name;
      document.getElementById('acctId').textContent = 'Account ' + a.ref;
      document.getElementById('avatar').textContent = a.name.replace('Guest ', '').slice(0, 2);
      document.getElementById('secured').classList.toggle('on', !!a.secured);
      document.getElementById('panelTitle').textContent = a.secured ? 'Secured by BotShield' : '';
      document.getElementById('panelBody').innerHTML = a.secured
        ? 'This Ticketz account is linked to your <b>BotShield ID</b>. Ticketz knows a real human stands behind it &mdash; <b>never who</b>. Come back any time: your next pass says so.'
        : 'Link this Ticketz account to your <b>BotShield ID</b>. Ticketz learns a real person is behind it &mdash; <b>never who</b>.';
      var showWidget = !a.secured || returning;
      bsVerify.classList.toggle('hide', !showWidget);
      document.getElementById('signInAgain').classList.toggle('on', !showWidget);
      var sw = document.getElementById('switch');
      sw.innerHTML = '';
      state.accounts.forEach(function(x, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip' + (i === state.active ? ' on' : '');
        b.textContent = x.name + (x.secured ? ' \\u2713' : '');
        b.addEventListener('click', function() { switchTo(i); });
        sw.appendChild(b);
      });
      if (state.accounts.length < 3) {
        var add = document.createElement('button');
        add.type = 'button';
        add.className = 'chip add';
        add.textContent = state.accounts.length === 1 ? '+ Second account' : '+ Another account';
        add.addEventListener('click', function() {
          state.accounts.push(newAccount());
          switchTo(state.accounts.length - 1);
          say('New Ticketz account \\u2014 try to secure it with the same BotShield ID.');
        });
        sw.appendChild(add);
      }
    }

    function switchTo(i) {
      state.active = i;
      returning = false;
      save();
      note(null);
      bsVerify.setAttribute('platform-user-ref', acct().ref);
      if (typeof bsVerify.reset === 'function') bsVerify.reset();
      render();
    }

    bsVerify.addEventListener('botshield:success', function(e) {
      var d = e.detail || {};
      var a = acct();
      if (d.trusted === true) {
        var wasSecured = a.secured;
        a.secured = true;
        save();
        render();
        if (wasSecured) { returning = false; render(); note('noteBack'); say('Trusted \\u2014 the same human is back.'); }
        else { note('noteSecured'); say('Your account is secured.'); }
      } else {
        say('Verified human.');
      }
    });
    // Live account state from BotShield (RFC 139 stream): the widget tells the
    // page whether this Ticketz account is still a Trusted Account — no tap.
    // none = not (or no longer) secured; fresh / stale = secured.
    bsVerify.addEventListener('botshield:presence', function(e) {
      var st = e.detail && e.detail.state;
      var a = acct();
      if (st === 'none' && a.secured) {
        a.secured = false; returning = false; save(); render();
        note('noteUnlinked'); say('This account is no longer secured.');
      } else if ((st === 'fresh' || st === 'stale') && !a.secured) {
        a.secured = true; save(); render();
        note('noteSecured'); say('Your account is secured.');
      }
    });

    bsVerify.addEventListener('botshield:failure', function(e) {
      var r = e.detail && e.detail.reason;
      console.warn('[Ticketz] botshield:failure', e.detail);
      if (r === 'already_trusted') { note('noteOne'); say('Already secured by your BotShield ID.'); }
      else if (r === 'notarize_not_enabled') say('Trusted Accounts is off for this gate in the Console.');
      else if (r === 'gate_not_found') say('The Ticketz Account gate is not active yet.');
    });

    document.getElementById('demoHowReset').addEventListener('click', function() { note('noteReset'); });
    document.getElementById('demoStartOver').addEventListener('click', function() {
      state = { accounts: [newAccount()], active: 0 };
      save();
      switchTo(0);
      say('Fresh Ticketz account. Unlink the old one in the BotShield app first if you secured it.');
    });

    // The return token (display only — a real Ticketz confirms it on its server
    // with POST /sdk/verify-token). trusted: true → this account is secured.
    function claimsOf(tok) {
      try {
        if (!tok || tok.split('.').length < 3) return null;
        var b = tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(b + '='.repeat((4 - b.length % 4) % 4)));
      } catch (err) { return null; }
    }
    function handleReturnToken() {
      var tok = params.get('token');
      if (!tok) return;
      var c = claimsOf(tok) || {};
      var trusted = c.trusted === true || (c.botshield && c.botshield.trusted === true);
      try { history.replaceState(null, '', window.location.pathname); } catch (err) { /* framed */ }
      try { if (window.top !== window.self) window.top.history.replaceState(null, '', '/#trusted'); } catch (err) { /* cross-origin */ }
      if (trusted) {
        acct().secured = true;
        save();
        note('noteSecured');
        say('Your account is secured.');
      }
    }

    // The hand-off can come back in ANOTHER tab (the widget opens the app in a
    // new tab; the app returns there). Both tabs share this storage, so when
    // the other tab marks the account secured, this one follows — on the
    // storage event and whenever this tab becomes visible again.
    function syncFromStorage() {
      var before = acct().ref + ':' + !!acct().secured;
      var next = load();
      state = next;
      var a = acct();
      if (before !== a.ref + ':' + !!a.secured) {
        bsVerify.setAttribute('platform-user-ref', a.ref);
        render();
        if (a.secured) { note('noteSecured'); say('Your account is secured.'); }
      }
    }
    window.addEventListener('storage', function(e) { if (e.key === STORE_KEY) syncFromStorage(); });
    document.addEventListener('visibilitychange', function() { if (document.visibilityState === 'visible') syncFromStorage(); });
    window.addEventListener('pageshow', function(e) { if (e.persisted) syncFromStorage(); });

    bsVerify.setAttribute('platform-user-ref', acct().ref);
    handleReturnToken();
    render();
  </script>
</body>
</html>`;
