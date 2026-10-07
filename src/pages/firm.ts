// Whitlock & Barr — a free case review form. The most mundane surface there is,
// and the one that gets spammed hardest, which is why captcha lives here today.
//
// The argument is the cost curve, not block-bots. A solicitor reads every
// enquiry, so junk is paid for in a person's time at the firm's end. The Gate
// moves that cost back onto whoever sent it: a run of a thousand fake enquiries
// stops being free and starts costing a human each.
//
// Whitlock & Barr is a MOCK firm (the roster rule: no real brand on a customer
// surface). Same widget and site key as the other demos; scope `contact_form`.
// Served at /firm; framed by the Demos shell.
export const firmHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="noindex">
  <title>Whitlock &amp; Barr - Free case review</title>
  <link rel="icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&family=Lora:wght@500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #08090b; color: #f7f7f7; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
    .page { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: safe center;
            gap: 18px; padding: 16px; padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); overflow-y: auto; }
    .wrap { width: 100%; max-width: 430px; }

    /* A small firm's own letterhead — a serif and a rule, nothing more. */
    .letterhead { text-align: center; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid #22262f; }
    .letterhead b { font-family: 'Lora', Georgia, serif; font-size: 21px; font-weight: 600; letter-spacing: .2px; display: block; }
    .letterhead small { font-family: 'Roboto Mono', monospace; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: #61656c; display: block; margin-top: 6px; }

    .card { background: #111418; border: 1px solid #22262f; border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 15px; }
    h1 { font-family: 'Lora', Georgia, serif; font-size: 25px; line-height: 31px; font-weight: 600; letter-spacing: -.2px; }
    .lede { font-size: 13.5px; line-height: 20px; color: #94979c; }
    .lede b { color: #e6e8ea; font-weight: 600; }

    .fields { display: flex; flex-direction: column; gap: 12px; }
    .f label { display: block; font-family: 'Roboto Mono', monospace; font-size: 9.5px; letter-spacing: .16em;
               text-transform: uppercase; color: #61656c; margin-bottom: 6px; }
    .f input, .f textarea { width: 100%; background: #0b0e12; border: 1px solid #22262f; border-radius: 11px; color: #f7f7f7;
                            font-family: inherit; font-size: 15px; padding: 13px 14px; outline: none; resize: none; }
    .f input:focus, .f textarea:focus { border-color: #373a41; }
    .f textarea { line-height: 21px; }

    /* The Gate is the last field, labelled like the rest. */
    .f.gate { padding-top: 3px; }
    .f.gate label { display: flex; align-items: baseline; gap: 8px; }
    .f.gate label span { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0;
                         text-transform: none; color: #7dc0e4; }
    botshield-verify { display: block; width: 100%; }
    botshield-verify::part(checkout) {
      background: #f7f7f7;
      color: #0b0e12;
      border: 0;
      border-radius: 10px;
      box-shadow: none;
    }

    .legal { font-size: 11.5px; line-height: 17px; color: #61656c; text-align: center; }

    /* ── Sent: the firm's side of it ── */
    .done { display: none; flex-direction: column; gap: 14px; }
    .done.open { display: flex; }
    .banner { background: rgba(35, 203, 120, .08); border: 1px solid rgba(35, 203, 120, .35);
              border-radius: 12px; padding: 13px 14px; font-size: 13.5px; line-height: 19px; }
    .banner b { color: #23cb78; font-weight: 600; }

    .inbox { background: #111418; border: 1px solid #22262f; border-radius: 14px; padding: 14px; }
    .inbox .hd { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 11px; }
    .inbox .hd .k { font-family: 'Roboto Mono', monospace; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: #61656c; }
    .inbox .hd .n { font-family: 'Roboto Mono', monospace; font-size: 11px; color: #94979c; }
    .enq { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px solid #1a1e24; }
    .enq:first-of-type { border-top: 0; }
    .enq .who { flex: 1; min-width: 0; }
    .enq .nm { font-size: 13.5px; font-weight: 500; color: #e6e8ea; }
    .enq .sub { font-size: 12px; color: #61656c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .person { flex: none; display: inline-flex; align-items: center; gap: 4px; font-family: 'Roboto Mono', monospace;
              font-size: 8.5px; letter-spacing: .1em; text-transform: uppercase; color: #23cb78;
              border: 1px solid rgba(35, 203, 120, .35); border-radius: 999px; padding: 2px 7px; }
    .person i { width: 5px; height: 5px; border-radius: 50%; background: #23cb78; display: block; }
    .enq.me { background: rgba(35, 203, 120, .05); margin: 0 -14px; padding-left: 14px; padding-right: 14px; }

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
      <div class="letterhead">
        <b>Whitlock &amp; Barr</b>
        <small>Employment &amp; Injury · Est. 1998</small>
      </div>

      <section class="card" id="form">
        <h1>Free case review</h1>
        <p class="lede">Tell us what happened and a solicitor will call you back. <b>A person reads every one of these</b> — which is why we ask you to confirm you are one.</p>

        <div class="fields">
          <div class="f"><label for="nm">Your name</label><input id="nm" type="text" value="Dana Whitfield" autocomplete="off"></div>
          <div class="f"><label for="em">Email</label><input id="em" type="email" value="d.whitfield@example.com" autocomplete="off"></div>
          <div class="f"><label for="ph">Phone</label><input id="ph" type="text" value="(0117) 496 2210" autocomplete="off"></div>
          <div class="f"><label for="wh">What happened</label><textarea id="wh" rows="3">I was let go two weeks after raising a safety complaint. I still have the emails.</textarea></div>

          <div class="f gate">
            <label for="bsVerify">Human check <span>so a person’s time goes to a person</span></label>
            <botshield-verify
              scope="contact_form"
              id="bsVerify"
              theme="dark"
              scan-mode="modal"
              signals="true"
              checkout-label="Send enquiry"
            ></botshield-verify>
          </div>
        </div>

        <p class="legal">No account needed. We never see who you are — only that someone is there.</p>
      </section>

      <section class="done" id="done">
        <div class="banner"><b>Enquiry sent.</b> A solicitor will call you back — and will have time to, because the morning was not spent on the other kind.</div>

        <div class="inbox">
          <div class="hd"><span class="k">The firm’s inbox this morning</span><span class="n" id="count">4 enquiries</span></div>
          <div class="enq me">
            <div class="who"><div class="nm">Dana Whitfield</div><div class="sub">Let go after a safety complaint</div></div>
            <span class="person"><i></i>Person</span>
          </div>
          <div class="enq">
            <div class="who"><div class="nm">Owen Pryce</div><div class="sub">Unpaid overtime, eleven months</div></div>
            <span class="person"><i></i>Person</span>
          </div>
          <div class="enq">
            <div class="who"><div class="nm">Nadia Haddad</div><div class="sub">Slipped on an unmarked floor at work</div></div>
            <span class="person"><i></i>Person</span>
          </div>
          <div class="enq">
            <div class="who"><div class="nm">Tom Ferreira</div><div class="sub">Contract ended the day he reported a fault</div></div>
            <span class="person"><i></i>Person</span>
          </div>
        </div>

        <div class="rows">
          <div class="k">What the firm received</div>
          <div class="row"><span>Enquiry</span><b id="ref">&mdash;</b></div>
          <div class="row"><span>Sent by a person</span><b style="color:#23cb78">yes</b></div>
          <div class="row"><span>Ceremony</span><b class="mono" id="cer">&mdash;</b></div>
          <p class="note">A captcha would have said this was not a script. It could not have said a person was here. The difference is who pays: sending a thousand of these used to cost nothing and cost the firm a morning. Now it costs a human each, and the morning goes to Dana.</p>
        </div>
      </section>
    </div>

    <!-- Demo chrome, not part of the Whitlock & Barr design. -->
    <div class="demo-controls">
      <button type="button" class="demo-reset" id="demoNewVisitor" title="Forget this visitor — the next check runs as a different human">New visitor</button>
      <button type="button" class="demo-reset" id="demoReset">Reset</button>
    </div>
  </div>

  <script>document.write('<scr' + 'ipt src="' + (window.location.search.indexOf('sdk=next') >= 0 ? 'https://cdn.botshield.ai/next/sdk.js' : 'https://cdn.botshield.ai/sdk.js?v=17') + '"></scr' + 'ipt>');</script>
  <script>
    (function () {
      var form = document.getElementById('form');
      var done = document.getElementById('done');
      var bsVerify = document.getElementById('bsVerify');

      var params = new URLSearchParams(window.location.search);
      var SITE_KEY = params.get('site_key') || 'pk_live_e398598c7f5af741b540abffd49ae74e';
      var SCOPE = params.get('scope') || 'contact_form';
      var MODE = params.get('mode') || 'private';
      bsVerify.setAttribute('site-key', SITE_KEY);
      bsVerify.setAttribute('scope', SCOPE);
      bsVerify.setAttribute('mode', MODE);

      // A stable stand-in for the firm's own visitor id. Without it the gate has
      // nothing to link a verification to. ?fresh=1 mints a new one.
      var REF_KEY = 'wnb_demo_user_ref';
      var userRef = localStorage.getItem(REF_KEY);
      if (!userRef || params.get('fresh')) {
        userRef = 'wnb_' + Array.from(crypto.getRandomValues(new Uint8Array(6))).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
        localStorage.setItem(REF_KEY, userRef);
      }
      bsVerify.setAttribute('platform-user-ref', userRef);

      // The run panel lives outside this iframe; the demo reports its progress.
      function narrate(msg) { try { if (window.parent !== window) window.parent.postMessage(msg, '*'); } catch (e) {} }

      bsVerify.addEventListener('click', function () { narrate({ bs: 'step', n: 1 }); });
      bsVerify.addEventListener('botshield:success', function () { narrate({ bs: 'step', n: 2 }); });

      bsVerify.addEventListener('botshield:checkout', function (e) {
        var d = (e && e.detail) || {};
        document.getElementById('ref').textContent = 'WB-' + Math.random().toString(36).slice(2, 7).toUpperCase();
        document.getElementById('cer').textContent = d.ceremony_id || d.ceremonyId || 'issued';
        form.style.display = 'none';
        done.classList.add('open');
        window.scrollTo(0, 0);
        narrate({ bs: 'step', n: 3 });
        narrate({ bs: 'result', result: { label: 'What the firm received', value: 'a person asked for a call',
          note: 'No name to store, no document, no account. What changed is the cost of the next thousand fake enquiries \\u2014 a human each, instead of nothing.' } });
      });

      document.getElementById('demoNewVisitor').addEventListener('click', function () {
        var fresh = 'wnb_' + Array.from(crypto.getRandomValues(new Uint8Array(6))).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
        localStorage.setItem(REF_KEY, fresh);
        bsVerify.setAttribute('platform-user-ref', fresh);
        if (bsVerify.reset) bsVerify.reset();
        location.reload();
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
