// Commons — sign-up on a social platform. This is where the Gate's argument is
// sharpest: a feed is only worth reading if the people in it are people. The
// form collects everything someone CLAIMS; the Gate is the only field that says
// a person is there, and the only thing stopping one person holding a hundred
// of these accounts.
//
// Commons is a MOCK platform (see the mock roster: no real brand on a customer
// surface). Same widget and site key as the other demos; the scope is
// `account_signup` so the Console sees signups apart from purchases.
// Served at /signup; framed by the Demos shell.
export const signupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="noindex">
  <title>Commons - Join</title>
  <link rel="icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #08090b; color: #f7f7f7; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
    .page { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: safe center;
            gap: 18px; padding: 16px; padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); overflow-y: auto; }
    .wrap { width: 100%; max-width: 430px; }

    /* Commons is a mock platform — its own mark, our surfaces. */
    .brand { display: flex; align-items: center; gap: 11px; margin-bottom: 18px; }
    .brand .mk { width: 34px; height: 34px; border-radius: 11px; background: #e0457b; display: flex; align-items: center; justify-content: center; }
    .brand .mk svg { width: 19px; height: 19px; }
    .brand b { font-size: 19px; font-weight: 700; letter-spacing: -.3px; }
    .brand small { font-family: 'Roboto Mono', monospace; font-size: 9.5px; letter-spacing: .14em; text-transform: uppercase; color: #61656c; display: block; margin-top: 1px; }

    .card { background: #111418; border: 1px solid #22262f; border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 15px; }
    h1 { font-size: 25px; line-height: 30px; font-weight: 600; letter-spacing: -.6px; }
    .lede { font-size: 13.5px; line-height: 20px; color: #94979c; }

    .fields { display: flex; flex-direction: column; gap: 12px; }
    .f label { display: block; font-family: 'Roboto Mono', monospace; font-size: 9.5px; letter-spacing: .16em;
               text-transform: uppercase; color: #61656c; margin-bottom: 6px; }
    .f input { width: 100%; background: #0b0e12; border: 1px solid #22262f; border-radius: 11px; color: #f7f7f7;
               font-family: inherit; font-size: 15px; padding: 13px 14px; outline: none; }
    .f input:focus { border-color: #373a41; }

    /* The Gate is the last field, labelled like the rest — the form makes the
       argument on its own, before the copy says it. */
    .f.gate { padding-top: 3px; }
    .f.gate label { display: flex; align-items: baseline; gap: 8px; }
    .f.gate label span { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0;
                         text-transform: none; color: #7dc0e4; }
    botshield-verify { display: block; width: 100%; }

    .legal { font-size: 11.5px; line-height: 17px; color: #61656c; text-align: center; }
    .alt { font-size: 13px; color: #94979c; text-align: center; }
    .alt a { color: #e6e8ea; text-decoration: none; border-bottom: 1px solid #373a41; }

    /* ── The feed. The reason the check is there. ── */
    .feed { display: none; flex-direction: column; gap: 12px; }
    .feed.open { display: flex; }
    .welcome { background: rgba(35, 203, 120, .08); border: 1px solid rgba(35, 203, 120, .35);
               border-radius: 12px; padding: 13px 14px; font-size: 13.5px; line-height: 19px; }
    .welcome b { color: #23cb78; font-weight: 600; }
    .feed-k { font-family: 'Roboto Mono', monospace; font-size: 9px; letter-spacing: .14em;
              text-transform: uppercase; color: #61656c; padding: 4px 2px 0; }
    .post { background: #111418; border: 1px solid #22262f; border-radius: 14px; padding: 14px; display: flex; gap: 11px; }
    .post .av { flex: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
                justify-content: center; font-size: 14px; font-weight: 600; color: #0b0e12; }
    .post .bd { min-width: 0; flex: 1; }
    .post .who { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .post .nm { font-size: 14px; font-weight: 600; }
    .post .hd { font-size: 12.5px; color: #61656c; }
    /* The marker every account on Commons carries, because every account is one. */
    .human { display: inline-flex; align-items: center; gap: 4px; font-family: 'Roboto Mono', monospace;
             font-size: 8.5px; letter-spacing: .1em; text-transform: uppercase; color: #23cb78;
             border: 1px solid rgba(35, 203, 120, .35); border-radius: 999px; padding: 2px 7px; }
    .human i { width: 5px; height: 5px; border-radius: 50%; background: #23cb78; display: block; }
    .post .tx { font-size: 14px; line-height: 20px; color: #e6e8ea; margin-top: 6px; }
    .post.me { border-color: rgba(224, 69, 123, .4); }

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
      <div class="brand">
        <span class="mk"><svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="4.2" stroke="#fff" stroke-width="2"/><circle cx="15.5" cy="15" r="4.2" stroke="#fff" stroke-width="2" opacity=".65"/></svg></span>
        <div><b>Commons</b><small>Real posts, real people</small></div>
      </div>

      <section class="card" id="form">
        <h1>Join Commons</h1>
        <p class="lede">Four fields tell Commons who you <i>say</i> you are. A script can fill every one of them &mdash; and fill them again tomorrow under another name.</p>

        <div class="fields">
          <div class="f"><label for="nm">Name</label><input id="nm" type="text" value="Jordan Reyes" autocomplete="off"></div>
          <div class="f"><label for="hd">Handle</label><input id="hd" type="text" value="@jordanreyes" autocomplete="off"></div>
          <div class="f"><label for="em">Email</label><input id="em" type="email" value="jordan@example.com" autocomplete="off"></div>
          <div class="f"><label for="pw">Password</label><input id="pw" type="password" value="correcthorsebattery" autocomplete="off"></div>

          <div class="f gate">
            <label for="bsVerify">Human check <span>the only one a script can’t fill</span></label>
            <botshield-verify
              site-key="pk_live_e398598c7f5af741b540abffd49ae74e"
              scope="account_signup"
              id="bsVerify"
              theme="dark"
              scan-mode="modal"
              signals="true"
              checkout-label="Join Commons"
            ></botshield-verify>
          </div>
        </div>

        <p class="legal">One account per human. That is the whole rule here.</p>
        <p class="alt">Already on Commons? <a href="#">Log in</a></p>
      </section>

      <section class="feed" id="feed">
        <div class="welcome"><b>You’re on Commons.</b> Every account in this feed is one human. Including yours.</div>
        <div class="feed-k">Your feed</div>

        <div class="post me">
          <div class="av" style="background:#e0457b;color:#fff">J</div>
          <div class="bd">
            <div class="who"><span class="nm">Jordan Reyes</span><span class="hd">@jordanreyes &middot; now</span><span class="human"><i></i>Human</span></div>
            <div class="tx">just joined. took about four seconds.</div>
          </div>
        </div>

        <div class="post">
          <div class="av" style="background:#7dc0e4">A</div>
          <div class="bd">
            <div class="who"><span class="nm">Amara Osei</span><span class="hd">@amara &middot; 12m</span><span class="human"><i></i>Human</span></div>
            <div class="tx">the sourdough finally worked. fourth attempt. photographic evidence to follow once it cools.</div>
          </div>
        </div>

        <div class="post">
          <div class="av" style="background:#f0b429">M</div>
          <div class="bd">
            <div class="who"><span class="nm">Mikko Laine</span><span class="hd">@mikko &middot; 48m</span><span class="human"><i></i>Human</span></div>
            <div class="tx">bus replacement service on a Sunday is a kind of character building nobody asked for</div>
          </div>
        </div>

        <div class="post">
          <div class="av" style="background:#23cb78;color:#06281f">R</div>
          <div class="bd">
            <div class="who"><span class="nm">Rosa Delgado</span><span class="hd">@rosa &middot; 2h</span><span class="human"><i></i>Human</span></div>
            <div class="tx">my neighbour has started leaving tomatoes on the wall between our gardens. no note. we have never spoken. this is the best thing that has happened all year.</div>
          </div>
        </div>

        <div class="rows">
          <div class="k">What Commons received</div>
          <div class="row"><span>Account</span><b id="acct">&mdash;</b></div>
          <div class="row"><span>Human present</span><b style="color:#23cb78">yes</b></div>
          <div class="row"><span>Ceremony</span><b class="mono" id="cer">&mdash;</b></div>
          <p class="note">Commons still only knows what Jordan typed. What the check adds is that a person was there to type it &mdash; and that the same person cannot quietly hold a hundred of these. Never a name, never a document.</p>
        </div>
      </section>
    </div>

    <!-- Demo chrome, not part of the Commons design. -->
    <div class="demo-controls">
      <button type="button" class="demo-reset" id="demoReset">Reset</button>
    </div>
  </div>

  <script>document.write('<scr' + 'ipt src="' + (window.location.search.indexOf('sdk=next') >= 0 ? 'https://cdn.botshield.ai/next/sdk.js' : 'https://cdn.botshield.ai/sdk.js?v=17') + '"></scr' + 'ipt>');</script>
  <script>
    (function () {
      var form = document.getElementById('form');
      var feed = document.getElementById('feed');
      var bsVerify = document.getElementById('bsVerify');

      // The run panel lives outside this iframe; the demo reports its progress.
      function narrate(msg) { try { if (window.parent !== window) window.parent.postMessage(msg, '*'); } catch (e) {} }

      bsVerify.addEventListener('click', function () { narrate({ bs: 'step', n: 1 }); });
      bsVerify.addEventListener('botshield:success', function () { narrate({ bs: 'step', n: 2 }); });

      // The component emits checkout only once its server-verified state resolves.
      bsVerify.addEventListener('botshield:checkout', function (e) {
        var d = (e && e.detail) || {};
        document.getElementById('acct').textContent = '@jordanreyes';
        document.getElementById('cer').textContent = d.ceremony_id || d.ceremonyId || 'issued';
        form.style.display = 'none';
        feed.classList.add('open');
        window.scrollTo(0, 0);
        narrate({ bs: 'step', n: 3 });
        narrate({ bs: 'result', result: { label: 'What Commons received', value: 'a human was here',
          note: 'Added to a form that otherwise only carries what someone typed. No name, no document \\u2014 and no second account for the same person.' } });
      });

      document.getElementById('demoReset').addEventListener('click', function () {
        feed.classList.remove('open');
        form.style.display = '';
        if (bsVerify.reset) bsVerify.reset();
        narrate({ bs: 'reset' });
      });
    })();
  </script>
</body>
</html>`;
