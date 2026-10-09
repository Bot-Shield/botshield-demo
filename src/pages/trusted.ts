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
  <meta name="mobile-web-app-capable" content="yes">
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
    .header-logo { width: 31px; height: 31px; border-radius: 50%; background: #15c39a; display: flex; align-items: center; justify-content: center; }
    .header-logo svg { width: 16px; height: 16px; fill: #fff; }
    .header-brand { font-size: 19px; font-weight: 600; line-height: 28.7px; }
    .wrap { width: 100%; max-width: 560px; display: flex; flex-direction: column; gap: 16px; }

    /* ── Account card ── */
    .kicker { font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #6b6b6b; }
    .acct { background: #111; border: 1px solid #1f1f1f; border-radius: 18px; padding: 18px; display: flex; align-items: center; gap: 14px; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: #17191c; border: 1px solid #373a41; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #94979c; font-size: 16px; flex-shrink: 0; }
    .acct-who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .acct-name { font-size: 17px; font-weight: 600; }
    .acct-id { font-family: 'Roboto Mono', monospace; font-size: 11px; color: #61656c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .secured { display: none; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #00d492; border: 1px solid rgba(0, 212, 146, .4); background: rgba(0, 212, 146, .08); border-radius: 999px; padding: 5px 10px; white-space: nowrap; }
    .secured.on { display: inline-flex; }
    .secured svg { width: 13px; height: 13px; }

    /* ── Switcher between the visitor's demo accounts ── */
    .switch { display: flex; gap: 8px; flex-wrap: wrap; }
    .switch:empty { display: none; }
    .chip { font-family: inherit; font-size: 12.5px; font-weight: 600; color: #94979c; background: #111418; border: 1px solid #22262f; border-radius: 999px; padding: 7px 12px; cursor: pointer; }
    .chip.on { color: #fff; border-color: #373a41; background: #262a30; }
    .chip.add { color: #94979c; border-style: dashed; }

    /* ── Security section ── the same card as .acct, so the page reads as two
       labelled sections of a settings page rather than a brochure panel. */
    .panel { background: #111; border: 1px solid #1f1f1f; border-radius: 18px; padding: 18px;
             display: flex; flex-direction: column; gap: 10px; }
    .panel h2 { font-size: 17px; font-weight: 600; letter-spacing: -.01em; line-height: 1.3; }
    .panel p { font-size: 14px; line-height: 1.55; color: #a3a3a3; }
    .panel p b { color: #e5e5e5; font-weight: 600; }
    botshield-verify { display: block; width: 100%; }
    /* The widget's checkout button ships #7f56d9. It declares that on the button
       itself, so a custom property set out here cannot win — but the SDK exposes
       part="checkout" for partner restyling, which can. Calm and high contrast,
       the way a shop's own add-to-cart reads. */
    botshield-verify::part(checkout) {
      background: #f7f7f7;
      color: #0b0e12;
      border: 0;
      border-radius: 10px;
      box-shadow: none;
    }
    botshield-verify.hide { display: none; }
    .again { display: none; font-family: inherit; font-size: 14px; font-weight: 600; color: #fff; background: linear-gradient(180deg, #16181b, #0e1013); border: 1px solid #373a41; border-radius: 12px; padding: 13px 16px; cursor: pointer; }
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
    /* The handoff out of the close — the site's .btn.ghost, on the note's ground. */
    .note .go { display: block; width: 100%; margin-top: 14px; font-family: inherit; font-size: 14px;
                font-weight: 600; color: #fff; background: transparent; border: 1px solid #373a41;
                border-radius: 10px; padding: 12px 16px; cursor: pointer;
                transition: border-color .15s, box-shadow .15s; }
    .note .go:hover, .note .go:active { border-color: #1a9fd6; box-shadow: 0 0 0 1px rgba(26,159,214,.12), 0 0 22px -4px rgba(26,159,214,.5); }
    .note li { margin: 3px 0; }

    /* ── Demo chrome (not part of the Ticketz design) ── */
    .demo-controls { width: 100%; max-width: 560px; display: flex; justify-content: center; gap: 8px; padding: 4px 16px 0; }
    .demo-reset { background: transparent; border: 1px solid #262a30; border-radius: 999px; color: #61656c;
                  font-family: 'Roboto Mono', monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
                  padding: 7px 13px; cursor: pointer; }
    .demo-reset:hover { color: #94979c; border-color: #373a41; }
    .toast { position: fixed; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 24px); transform: translateX(-50%) translateY(20px); background: #0f2a20; border: 1px solid rgba(0, 212, 146, 0.4); color: #e6fff5; padding: 12px 16px; border-radius: 12px; font-size: 14px; max-width: 92vw; opacity: 0; transition: opacity .25s, transform .25s; pointer-events: none; z-index: 30001; text-align: center; }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* Phone column. Desktop keeps the wider panel above — this demo is a
       Ticketz ACCOUNT page, so on a laptop it should read as a web app,
       not a 430px strip floating in the middle of the screen. */
    html.is-narrow .wrap,
    html.is-narrow .demo-controls { max-width: 430px; }

    /* The ceremony differs by device, so the offer has to. On a laptop the
       customer is signed in HERE but their BotShield passkey is on their
       PHONE, so the ceremony is a scan. On the phone it is one tap. Spans,
       not two blocks, because the shell flips .is-mobile on resize live. */
    /* HOW LINKING WORKS — the 3.2 explainer beats. Same rhythm as the app:
       heading, then one line under it. */
    .how { margin-top: 20px; padding-top: 18px; border-top: 1px solid #22262f; display: flex; flex-direction: column; gap: 14px; }
    /* Same tokens the page already uses: .kicker for the eyebrow, .panel p /
       .panel p b for the beats. Two beats at one size, split by weight and
       colour — the rhythm the app's onboarding beats use. */
    .how-k { font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #6b6b6b; }
    .how-b { display: flex; flex-direction: column; gap: 2px; }
    .how-b b { font-size: 14px; line-height: 1.55; font-weight: 600; color: #e5e5e5; }
    .how-b span { font-size: 14px; line-height: 1.55; color: #a3a3a3; }

    .desktop-only { display: inline; }
    .mobile-only { display: none; }
    html.is-narrow .desktop-only { display: none; }
    html.is-narrow .mobile-only { display: inline; }
  </style>
</head>
<body>
  <script>(function(){try{
    /* NOT the shell's ?m=. That flag answers "what device is the viewer on",
       which is what agent.ts needs for its QR. This page needs a different
       answer: "am I being rendered as a phone, or as a web page?" — because
       it is a Ticketz ACCOUNT page and the offer reads differently in each.
       In the shell this frame is a 430px phone bezel; standalone on a laptop
       it is a real browser window. So key off our OWN width, and use our own
       class — the shell toggles .is-mobile from the outer browser width and
       would otherwise overwrite us. */
    var el = document.documentElement;
    function narrow() { el.classList.toggle('is-narrow', window.innerWidth < 560); }
    narrow();
    window.addEventListener('resize', narrow);
  }catch(e){}})();</script>
  <div class="page">
    <div class="top-spacer"></div>
    <div class="header">
      <div class="header-logo"><svg viewBox="0 0 24 24"><path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1a3 3 0 000 6v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a3 3 0 000-6V9z"/></svg></div>
      <div class="header-brand">Ticketz</div>
    </div>

    <div class="wrap">
      <div class="kicker">Account</div>
      <div class="acct">
        <div class="avatar" id="avatar"></div>
        <div class="acct-who">
          <div class="acct-name" id="acctName"></div>
          <div class="acct-id" id="acctId"></div>
        </div>
        <span class="secured" id="secured"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3v6c0 5-3.5 9.3-8 11-4.5-1.7-8-6-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>Secured</span>
      </div>
      <div class="switch" id="switch"></div>

      <div class="kicker">Security</div>
      <section class="panel">
        <!-- The page owns the copy; the SDK renders only the Link BotShield ID
             button (Paul + Devrin, 2026-09-29). One block, two states — the
             moment/panelTitle pair said the same thing twice. -->
        <h2 id="panelH">Link with BotShield</h2>
        <p id="panelBody"><span class="desktop-only">You&rsquo;re signed in. Scan with your phone, and Ticketz can confirm a live human runs this account.</span><span class="mobile-only">You&rsquo;re signed in. One tap more, and Ticketz can confirm a live human runs this account.</span></p>
        <botshield-verify
          site-key="pk_live_e398598c7f5af741b540abffd49ae74e"
          scope="ticketz_account"
          id="bsVerify"
          theme="dark"
          scan-mode="modal"
          signals="true"
          notarize
          checkout="false"
        ></botshield-verify>
        <button type="button" class="again" id="signInAgain">Sign in again</button>

        <!-- Canon: Figma 3.2 "Link ceremony · 3.2 · deep link + scan" — the two
             beats every Link Account screen carries. This is how a company
             offers it to its customers: the ask, then why it is safe to say yes. -->
        <div class="how">
          <div class="how-k">HOW LINKING WORKS</div>
          <div class="how-b"><b>We only check that a human runs it</b><span>We notarize that one fact. Never your name, never what you do here.</span></div>
          <div class="how-b"><b>Agents ask, you decide</b><span>Only agents you allow can ask. Every request waits in Agents Ask for your answer.</span></div>
        </div>
      </section>

      <div class="note ok" id="noteSecured"><b>Your account is secured.</b> Agents and this site can now trust this account &mdash; a live human runs it. It&rsquo;s in your BotShield app under <b>Trusted Accounts</b>.<br><br>Now try <b>+ Second account</b> above.</div>
      <div class="note one" id="noteOne"><b>Already secured with BotShield.</b> BotShield secures one Ticketz account &mdash; that&rsquo;s the promise Ticketz relies on. This second account can&rsquo;t be secured by you.<br><br>Switch back to your first account &mdash; it&rsquo;s still secured.</div>
      <div class="note ok" id="noteBack"><b>Welcome back &mdash; trusted.</b> Same person, same account: Ticketz gets <b>trusted: true</b> on this pass, no new setup.<br><br><b>That trusted account is what lets an agent ask.</b> An agent acting for you can ask Ticketz for something, and Ticketz knows a live human is there to answer it.<button type="button" class="go" id="goAgent">See Agents Ask&trade; &rarr;</button></div>
      <div class="note info" id="noteUnlinked"><b>Unlinked.</b> This Ticketz account is no longer secured with BotShield &mdash; you unlinked it in the BotShield app, or Ticketz revoked it. Link it again any time.</div>
      <div class="note info" id="noteReset"><b>Start over</b><ol><li>In the BotShield app: Linked Accounts &rarr; Ticketz &rarr; <b>Unlink</b>.</li><li>Tap <b>Start over</b> (top right) for fresh Ticketz accounts.</li></ol></div>

    </div>
    <div class="demo-controls">
      <button type="button" class="demo-reset" id="demoHowReset">How to reset</button>
      <button type="button" class="demo-reset" id="demoStartOver">Start over</button>
    </div>
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
    // Deliberately one person's alts. Ticketz cannot tell them apart today; what
    // changes after securing is the cost of keeping them all trusted at once.
    // Two accounts make the whole point. A third is just more email to read.
    var MAX_ACCOUNTS = 2;
    var ALTS = ['jordan.reyes', 'j.reyes91'];
    function newAccount(i) {
      var mail = ALTS[Math.min(ALTS.length - 1, i || 0)] + '@example.com';
      return { ref: 'tkz-demo-' + hex(6), name: mail, secured: false };
    }
    function load() {
      try {
        var s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        if (s && Array.isArray(s.accounts) && s.accounts.length) {
          // A browser that used the demo when it allowed three accounts still
          // has three in storage; the cap only ever stopped new ones. Trim on
          // read, or the switcher keeps showing a row of near-identical emails.
          if (s.accounts.length > MAX_ACCOUNTS) s.accounts = s.accounts.slice(0, MAX_ACCOUNTS);
          // The active index was never validated. One that is missing or past
          // the end of the array handed acct() undefined, which threw on the
          // first line of render() — so the card kept its placeholder and read
          // as a real account called Guest, with no switcher and no way out.
          var i = Number(s.active);
          s.active = (isFinite(i) && i >= 0 && i < s.accounts.length) ? i : 0;
          return s;
        }
      } catch (err) { /* fresh */ }
      return { accounts: [newAccount(0)], active: 0 };
    }
    function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (err) { /* private mode */ } }
    var state = params.get('fresh') ? { accounts: [newAccount(0)], active: 0 } : load();
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
    // The shell lives outside this iframe. Same origin; it checks the source.
    function narrate(msg) { try { if (window.parent !== window) window.parent.postMessage(msg, '*'); } catch (err) {} }

    var goAgent = document.getElementById('goAgent');
    if (goAgent) goAgent.addEventListener('click', function() { narrate({ bs: 'goto', demo: 'agent' }); });

    function note(id) { ['noteSecured', 'noteOne', 'noteBack', 'noteReset', 'noteUnlinked'].forEach(function(n) { document.getElementById(n).classList.toggle('on', n === id); }); }
    function acct() { return state.accounts[state.active] || state.accounts[0]; }

    /** A secured account shows the finished state; "Sign in again" brings the widget back for a returning pass. */
    var returning = false;
    document.getElementById('signInAgain').addEventListener('click', function() {
      returning = true;
      note(null);
      if (typeof bsVerify.reset === 'function') bsVerify.reset();
      render();
    });

    /** The button-only widget (3.0.2+) renders no card: the page owns the moment. */
    function render() {
      var a = acct();
      document.getElementById('acctName').textContent = a.name;
      document.getElementById('acctId').textContent = 'Signed in \u00b7 ' + a.ref;
      document.getElementById('avatar').textContent = a.name.slice(0, 1).toUpperCase();
      document.getElementById('secured').classList.toggle('on', !!a.secured);
      document.getElementById('panelH').textContent = a.secured
        ? 'Secured with BotShield'
        : 'Link with BotShield';
      document.getElementById('panelBody').innerHTML = a.secured
        ? 'Ticketz can confirm a live human runs this account &mdash; <b>never your name</b>. Come back any time: your next pass says so.'
        : '<span class="desktop-only">You&rsquo;re signed in. Scan with your phone, and Ticketz can confirm a live human runs this account.</span>'
          + '<span class="mobile-only">You&rsquo;re signed in. One tap more, and Ticketz can confirm a live human runs this account.</span>';
      var showWidget = !a.secured || returning;
      bsVerify.classList.toggle('hide', !showWidget);
      document.getElementById('signInAgain').classList.toggle('on', !showWidget);
      var sw = document.getElementById('switch');
      sw.innerHTML = '';
      // Only the accounts you are NOT on. The one you are signed into is the
      // card above — printing it again as a chip was the same email twice.
      state.accounts.forEach(function(x, i) {
        if (i === state.active) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = 'Switch to ' + x.name + (x.secured ? ' \\u2713' : '');
        b.addEventListener('click', function() { switchTo(i); });
        sw.appendChild(b);
      });
      if (state.accounts.length < MAX_ACCOUNTS) {
        var add = document.createElement('button');
        add.type = 'button';
        add.className = 'chip add';
        add.textContent = '+ Second account';
        add.addEventListener('click', function() {
          state.accounts.push(newAccount(state.accounts.length));
          switchTo(state.accounts.length - 1);
          say('New Ticketz account \\u2014 try to secure it with BotShield too.');
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
      if (r === 'already_trusted') { note('noteOne'); say('Already secured with BotShield.'); }
      else if (r === 'notarize_not_enabled') say('Trusted Accounts is off for this gate in the Console.');
      else if (r === 'gate_not_found') say('The Ticketz Account gate is not active yet.');
    });

    document.getElementById('demoHowReset').addEventListener('click', function() { note('noteReset'); });
    document.getElementById('demoStartOver').addEventListener('click', function() {
      state = { accounts: [newAccount(0)], active: 0 };
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
