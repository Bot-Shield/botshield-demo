// Ticketz — sign-up. The Human Gate on account creation, which is the sharpest
// version of the argument: a form collects everything a person CLAIMS, and none
// of it says a person is there. The Gate is the only field that does.
//
// Same widget, same site key as the other Ticketz surfaces; the difference is
// the SCOPE — `account_signup` — so the Console sees signups separately from
// purchases. Built to the frames on the Website Demo Page (3232:3220 before ·
// 3232:3246 waiting · 3232:3278 verified).
// Served at /signup; framed by the Demos shell.
export const signupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="noindex">
  <title>Ticketz - Create your account</title>
  <link rel="icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #08090b; color: #f7f7f7; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
    .page { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: safe center;
            gap: 20px; padding: 16px; padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); overflow-y: auto; }
    .wrap { width: 100%; max-width: 430px; }

    .card { background: #111418; border: 1px solid #22262f; border-radius: 16px; padding: 24px 22px; display: flex; flex-direction: column; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 11px; }
    .brand .mk { width: 34px; height: 34px; border-radius: 10px; background: #15c39a; display: flex; align-items: center; justify-content: center; }
    .brand .mk svg { width: 19px; height: 19px; fill: #06281f; }
    .brand b { font-size: 19px; font-weight: 700; letter-spacing: -.3px; }

    h1 { font-size: 25px; line-height: 30px; font-weight: 600; letter-spacing: -.6px; }
    /* The whole argument, in the subhead. */
    .lede { font-size: 13.5px; line-height: 20px; color: #94979c; }

    .fields { display: flex; flex-direction: column; gap: 13px; }
    .f label { display: block; font-family: 'Roboto Mono', monospace; font-size: 9.5px; letter-spacing: .16em;
               text-transform: uppercase; color: #61656c; margin-bottom: 6px; }
    .f input { width: 100%; background: #0b0e12; border: 1px solid #22262f; border-radius: 11px; color: #f7f7f7;
               font-family: inherit; font-size: 15px; padding: 13px 14px; outline: none; }
    .f input:focus { border-color: #373a41; }
    .f input::placeholder { color: #4b4f56; }

    botshield-verify { display: block; width: 100%; }

    .legal { font-size: 11.5px; line-height: 17px; color: #61656c; text-align: center; }

    /* ── What the gate is actually for, shown once it answers ── */
    .done { display: none; flex-direction: column; gap: 14px; }
    .done.open { display: flex; }
    .banner { display: flex; align-items: center; gap: 10px; background: rgba(35, 203, 120, .08);
              border: 1px solid rgba(35, 203, 120, .35); border-radius: 12px; padding: 13px 14px; font-size: 13.5px; }
    .banner b { color: #23cb78; font-weight: 600; }
    .rows { background: #0b0e12; border: 1px solid #22262f; border-radius: 12px; padding: 14px; }
    .rows .k { font-family: 'Roboto Mono', monospace; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: #61656c; margin-bottom: 9px; }
    .row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 5px 0; }
    .row span { color: #94979c; }
    .row b { font-weight: 500; color: #e6e8ea; }
    .row b.mono { font-family: 'Roboto Mono', monospace; font-size: 12px; color: #7dc0e4; }
    .note { font-size: 11.5px; line-height: 17px; color: #61656c; margin-top: 10px; }

    .demo-controls { width: 100%; max-width: 430px; display: flex; justify-content: center; gap: 8px; padding: 0 16px; }
    .demo-reset { background: transparent; border: 1px solid #262a30; border-radius: 999px; color: #61656c;
                  font-family: 'Roboto Mono', monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
                  padding: 7px 13px; cursor: pointer; }
    .demo-reset:hover { color: #94979c; border-color: #373a41; }
  </style>
</head>
<body>
  <div class="page">
    <div class="wrap">
      <section class="card" id="form">
        <div class="brand">
          <span class="mk"><svg viewBox="0 0 24 24"><path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1a3 3 0 000 6v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a3 3 0 000-6V9z"/></svg></span>
          <b>Ticketz</b>
        </div>
        <h1>Create your account</h1>
        <p class="lede">All of this tells Ticketz who you <i>say</i> you are. None of it tells them a person is here.</p>

        <div class="fields">
          <div class="f"><label for="nm">Full name</label><input id="nm" type="text" value="Jordan Reyes" autocomplete="off"></div>
          <div class="f"><label for="em">Email</label><input id="em" type="email" value="jordan@example.com" autocomplete="off"></div>
          <div class="f"><label for="pw">Password</label><input id="pw" type="password" value="correcthorsebattery" autocomplete="off"></div>
          <div class="f"><label for="db">Date of birth</label><input id="db" type="text" value="14 / 03 / 1994" autocomplete="off"></div>
        </div>

        <botshield-verify
          site-key="pk_live_e398598c7f5af741b540abffd49ae74e"
          scope="account_signup"
          id="bsVerify"
          theme="dark"
          scan-mode="modal"
          signals="true"
          checkout-label="Create account"
        ></botshield-verify>

        <p class="legal">One account per human. The check says a person is here &mdash; never who.</p>
      </section>

      <section class="done" id="done">
        <div class="banner"><span><b>Account created.</b> A human was here when it was.</span></div>
        <div class="rows">
          <div class="k">What Ticketz received</div>
          <div class="row"><span>Account</span><b id="acct">&mdash;</b></div>
          <div class="row"><span>Human present</span><b style="color:#23cb78">yes</b></div>
          <div class="row"><span>Ceremony</span><b class="mono" id="cer">&mdash;</b></div>
          <p class="note">That is the whole addition. Ticketz still only knows what Jordan typed &mdash; the check adds that a person was there to type it, and nothing about who.</p>
        </div>
      </section>
    </div>

    <!-- Demo chrome, not part of the Ticketz design. -->
    <div class="demo-controls">
      <button type="button" class="demo-reset" id="demoReset">Reset</button>
    </div>
  </div>

  <script>document.write('<scr' + 'ipt src="' + (window.location.search.indexOf('sdk=next') >= 0 ? 'https://cdn.botshield.ai/next/sdk.js' : 'https://cdn.botshield.ai/sdk.js?v=17') + '"></scr' + 'ipt>');</script>
  <script>
    (function () {
      var form = document.getElementById('form');
      var done = document.getElementById('done');
      var bsVerify = document.getElementById('bsVerify');

      // The run panel lives outside this iframe; the demo reports its progress.
      function narrate(msg) { try { if (window.parent !== window) window.parent.postMessage(msg, '*'); } catch (e) {} }

      bsVerify.addEventListener('click', function () { narrate({ bs: 'step', n: 1 }); });
      bsVerify.addEventListener('botshield:success', function () { narrate({ bs: 'step', n: 2 }); });

      // The component emits checkout only once its server-verified state resolves.
      bsVerify.addEventListener('botshield:checkout', function (e) {
        var d = (e && e.detail) || {};
        document.getElementById('acct').textContent = 'TKZ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        document.getElementById('cer').textContent = d.ceremony_id || d.ceremonyId || 'issued';
        form.style.display = 'none';
        done.classList.add('open');
        window.scrollTo(0, 0);
        narrate({ bs: 'step', n: 3 });
        narrate({ bs: 'result', result: { label: 'What Ticketz received', value: 'a human was here',
          note: 'Added to a form that otherwise only carries what someone typed. No name, no document, nothing about who.' } });
      });

      document.getElementById('demoReset').addEventListener('click', function () {
        done.classList.remove('open');
        form.style.display = '';
        if (bsVerify.reset) bsVerify.reset();
        narrate({ bs: 'reset' });
      });
    })();
  </script>
</body>
</html>`;
