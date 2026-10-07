// Tread — a limited release. The checkout worth gating: a drop where the whole
// promise is ONE PAIR PER PERSON, and where bots are the reason real customers
// never get one. Gating an ordinary basket reads as slowing the funnel; gating
// a drop is the thing the shop is actually selling.
//
// Tread is a MOCK brand (the roster rule: no real brand on a customer surface).
// Same widget and site key as the other demos; the scope is `limited_release`.
// Served at /drop; framed by the Demos shell.
export const dropHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="noindex">
  <title>Tread - The Arc drop</title>
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

    /* Tread is a mock brand — monochrome mark, our surfaces. */
    .brand { display: flex; align-items: center; gap: 11px; margin-bottom: 16px; }
    .brand .mk { width: 32px; height: 32px; border-radius: 9px; background: #f7f7f7; display: flex; align-items: center; justify-content: center; }
    .brand .mk svg { width: 19px; height: 19px; }
    .brand b { font-size: 19px; font-weight: 700; letter-spacing: -.3px; }

    .card { background: #111418; border: 1px solid #22262f; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 15px; }

    /* The drop banner. Orange is the Ask colour; a release is a queue, so the
       token fits — 8% fill, 35% border, same as everywhere else. */
    .drop { display: flex; align-items: center; justify-content: space-between; gap: 10px;
            background: rgba(255, 93, 37, .08); border: 1px solid rgba(255, 93, 37, .35);
            border-radius: 11px; padding: 10px 13px; }
    .drop .l { display: flex; align-items: center; gap: 8px; font-family: 'Roboto Mono', monospace;
               font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #ff5d25; }
    .drop .l i { width: 6px; height: 6px; border-radius: 50%; background: #ff5d25; display: block; }
    .drop .r { font-family: 'Roboto Mono', monospace; font-size: 12.5px; color: #e6e8ea; }

    .shoe { height: 150px; border-radius: 12px; background: #17191c; border: 1px solid #22262f;
            display: flex; align-items: center; justify-content: center; }
    .shoe svg { width: 150px; height: auto; }

    .title { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    .title h1 { font-size: 22px; line-height: 27px; font-weight: 600; letter-spacing: -.5px; }
    .title .px { font-size: 18px; font-weight: 600; white-space: nowrap; }
    .sub { font-size: 13px; line-height: 19px; color: #94979c; margin-top: -8px; }

    .k { font-family: 'Roboto Mono', monospace; font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: #61656c; margin-bottom: 7px; }
    .sizes { display: flex; gap: 7px; flex-wrap: wrap; }
    .sz { flex: 1 1 auto; min-width: 52px; text-align: center; background: #0b0e12; border: 1px solid #22262f;
          border-radius: 9px; color: #94979c; font-family: inherit; font-size: 13.5px; padding: 9px 0; cursor: pointer; }
    .sz.on { background: #262a30; border-color: #373a41; color: #f7f7f7; }
    .sz.out { color: #3c4046; text-decoration: line-through; cursor: not-allowed; }

    botshield-verify { display: block; width: 100%; }
    .legal { font-size: 11.5px; line-height: 17px; color: #61656c; text-align: center; }

    /* ── Claimed ── */
    .done { display: none; flex-direction: column; gap: 14px; }
    .done.open { display: flex; }
    .banner { background: rgba(35, 203, 120, .08); border: 1px solid rgba(35, 203, 120, .35);
              border-radius: 12px; padding: 13px 14px; font-size: 13.5px; line-height: 19px; }
    .banner b { color: #23cb78; font-weight: 600; }
    .rows { background: #0b0e12; border: 1px solid #22262f; border-radius: 12px; padding: 14px; }
    .rows .k { margin-bottom: 9px; }
    .row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 5px 0; }
    .row span { color: #94979c; }
    .row b { font-weight: 500; color: #e6e8ea; }
    .row b.mono { font-family: 'Roboto Mono', monospace; font-size: 12px; color: #7dc0e4; }
    .note { font-size: 11.5px; line-height: 17px; color: #61656c; margin-top: 10px; }
    /* The second attempt — the whole reason the gate is on a drop. */
    .again { background: #111418; border: 1px solid #22262f; border-radius: 12px; padding: 14px; }
    .again .hd { font-size: 13.5px; font-weight: 600; margin-bottom: 5px; }
    .again p { font-size: 12.5px; line-height: 18px; color: #94979c; }
    .again .refused { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
                      font-family: 'Roboto Mono', monospace; font-size: 10px; letter-spacing: .1em;
                      text-transform: uppercase; color: #ff5d25; border: 1px solid rgba(255, 93, 37, .35);
                      border-radius: 999px; padding: 5px 10px; }

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
        <span class="mk"><svg viewBox="0 0 24 24" fill="none"><path d="M3 15.5c0-1 .6-1.6 1.6-2l3.3-1.3c.5-.2.9-.6 1.1-1.1L10.3 8c.3-.8 1.4-.9 1.9-.2l1.6 2.3c.3.5.9.8 1.5.9l3.6.5c1.6.2 2.6 1.1 2.6 2.4v1.6c0 .8-.6 1.5-1.5 1.5H4.5C3.7 17 3 16.3 3 15.5z" stroke="#0b0e12" stroke-width="1.7" stroke-linejoin="round"/></svg></span>
        <b>Tread</b>
      </div>

      <section class="card" id="form">
        <div class="drop">
          <span class="l"><i></i>Limited release</span>
          <span class="r">One pair per person</span>
        </div>

        <div class="shoe">
          <svg viewBox="0 0 160 80" fill="none" aria-hidden="true">
            <path d="M8 58c0-6 4-9 10-11l22-8c4-1.5 7-4 9-7l9-13c2-3 7-3 9 .5l8 13c2 3.5 6 5.5 10 6l25 3c10 1 16 6 16 13v6c0 3.5-3 6.5-7 6.5H14c-3.5 0-6-2.5-6-6z" fill="#22262f" stroke="#373a41" stroke-width="1.6"/>
            <path d="M8 62h118" stroke="#61656c" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M58 28l8 12M70 22l9 13M83 20l8 12" stroke="#61656c" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="title"><h1>Tread Arc &mdash; Ember</h1><span class="px">$180</span></div>
        <p class="sub">900 pairs. One each. Everyone who gets one is a person who wanted one.</p>

        <div>
          <div class="k">Size</div>
          <div class="sizes">
            <button type="button" class="sz out">8</button>
            <button type="button" class="sz">9</button>
            <button type="button" class="sz on">10</button>
            <button type="button" class="sz">11</button>
            <button type="button" class="sz out">12</button>
          </div>
        </div>

        <botshield-verify
          site-key="pk_live_e398598c7f5af741b540abffd49ae74e"
          scope="limited_release"
          id="bsVerify"
          theme="dark"
          scan-mode="modal"
          signals="true"
          checkout-label="Claim your pair"
        ></botshield-verify>

        <p class="legal">One pair per person, checked at the door. No queue, no raffle, no resale army.</p>
      </section>

      <section class="done" id="done">
        <div class="banner"><b>Pair claimed.</b> Size 10, held for you. Tread knows a person claimed it &mdash; never which person.</div>

        <div class="rows">
          <div class="k">What Tread received</div>
          <div class="row"><span>Claim</span><b id="claim">&mdash;</b></div>
          <div class="row"><span>One per person</span><b style="color:#23cb78">held</b></div>
          <div class="row"><span>Ceremony</span><b class="mono" id="cer">&mdash;</b></div>
          <p class="note">Never a name, never a card, never a device. Just that this pair went to a person who does not already have one.</p>
        </div>

        <div class="again">
          <div class="hd">Try to claim a second pair</div>
          <p>This is the part a drop actually needs. The same human comes back for another pair &mdash; a second account, a second card, a different browser. The answer does not change.</p>
          <span class="refused">Already claimed by this human</span>
        </div>
      </section>
    </div>

    <!-- Demo chrome, not part of the Tread design. -->
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

      Array.prototype.forEach.call(document.querySelectorAll('.sz'), function (b) {
        if (b.classList.contains('out')) return;
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(document.querySelectorAll('.sz'), function (x) { x.classList.remove('on'); });
          b.classList.add('on');
        });
      });

      bsVerify.addEventListener('click', function () { narrate({ bs: 'step', n: 1 }); });
      bsVerify.addEventListener('botshield:success', function () { narrate({ bs: 'step', n: 2 }); });

      bsVerify.addEventListener('botshield:checkout', function (e) {
        var d = (e && e.detail) || {};
        document.getElementById('claim').textContent = 'ARC-' + Math.random().toString(36).slice(2, 7).toUpperCase();
        document.getElementById('cer').textContent = d.ceremony_id || d.ceremonyId || 'issued';
        form.style.display = 'none';
        done.classList.add('open');
        window.scrollTo(0, 0);
        narrate({ bs: 'step', n: 3 });
        narrate({ bs: 'result', result: { label: 'What Tread received', value: 'one pair, one person',
          note: 'Not a name, not a card, not a device. Just that this pair went to someone who does not already have one.' } });
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
