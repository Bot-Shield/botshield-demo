// BotShield Demos — the shell around every demo page. Same composition as the
// app's web rail (brand top-left, grouped nav, footer), with the selected demo
// running in a frame so each page keeps its own script, widget and state.
// Desktop: 300px rail + frame. Phone: top bar with a menu button; the menu is a
// full-screen sheet; the chosen demo fills the screen.
//
// Demos are registered in DEMOS; a `#key` in the URL (or ?demo=key) selects
// one and survives reloads. External demos open in a new tab.
export interface DemoEntry {
  key: string;
  group: string;
  label: string;
  hint: string;
  path?: string;      // framed page on this worker
  href?: string;      // external demo, opens in a new tab
  badge?: string;
  /** Where the outcome is real today (e.g. platform age signals): shown as small pills. */
  platforms?: string[];
}

export const DEMOS: DemoEntry[] = [
  { key: 'ticketz', group: 'Ticketz', label: 'BotShield Gate', hint: 'Human Gate at checkout', path: '/ticketz' },
  { key: 'agent', group: 'Ticketz', label: 'Agents Ask', hint: 'An agent buys, a human approves', path: '/agent' },
  { key: 'vapez', group: 'Vapez', label: 'Age Gate', hint: '18+ to enter the store', path: '/vapez', platforms: ['iOS', 'Android'] },
  { key: 'salesforce', group: 'Salesforce', label: 'Coral Cloud', hint: 'Agentforce + Flow on AppExchange', href: 'https://salesforce-demo.botshield.ai/coralcloud/s/' },
];

export function shellHtml(): string {
  const groups: Record<string, DemoEntry[]> = {};
  for (const d of DEMOS) (groups[d.group] ||= []).push(d);
  const nav = Object.entries(groups).map(([group, items]) => `
      <div class="grp">
        <div class="grp-h">${group}</div>
        ${items.map((d) => d.href
          ? `<a class="it" data-key="${d.key}" href="${d.href}" target="_blank" rel="noopener"><span class="it-l">${d.label}<span class="ext">&#8599;</span></span><span class="it-h">${d.hint}</span></a>`
          : `<a class="it" data-key="${d.key}" href="#${d.key}"><span class="it-l">${d.label}${d.badge ? `<span class="badge">${d.badge}</span>` : ''}${(d.platforms || []).map((pl) => `<span class="plat">${pl}</span>`).join('')}</span><span class="it-h">${d.hint}</span></a>`).join('')}
      </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0b0c0e">
  <title>BotShield Demos</title>
  <link rel="icon" href="/favicon.ico">
  <meta name="description" content="Live demos of BotShield: Human Gate at checkout, Age Gate at the door, Agents Ask for AI agents, and the Salesforce Agentforce integration.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root { --bg: #0b0c0e; --rail: #0e0f12; --line: #1c1f24; --ink: #f5f5f6; --muted: #9a9ea6; --faint: #5f636b; --brand: #147baa; --ok: #00d492; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: var(--bg); color: var(--ink); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
    .app { display: grid; grid-template-columns: 300px 1fr; height: 100dvh; }
    .rail { background: var(--rail); border-right: 1px solid var(--line); display: flex; flex-direction: column; padding: 18px 14px; gap: 6px; overflow-y: auto; }
    .brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 18px; }
    .brand svg { width: 30px; height: 30px; flex-shrink: 0; }
    .brand b { font-size: 16.5px; font-weight: 700; letter-spacing: -.01em; }
    .brand small { display: block; font-family: 'Roboto Mono', monospace; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--faint); margin-top: 1px; }
    .grp { padding-top: 10px; }
    .grp-h { font-family: 'Roboto Mono', monospace; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); padding: 0 10px 8px; }
    .it { display: flex; flex-direction: column; gap: 2px; padding: 9px 10px; border-radius: 10px; color: var(--muted); text-decoration: none; border: 1px solid transparent; }
    .it:hover { color: var(--ink); background: #14161b; }
    .it.on { color: var(--ink); background: #15191f; border-color: #242a33; }
    .it-l { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .it-h { font-size: 12px; color: var(--faint); }
    .ext { font-size: 12px; color: var(--faint); }
    .plat { font-family: 'Roboto Mono', monospace; font-size: 9.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); border: 1px solid #2a2e36; background: #14161b; border-radius: 999px; padding: 1px 7px; }
    .badge { font-family: 'Roboto Mono', monospace; font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--brand); border: 1px solid rgba(20, 123, 170, .5); border-radius: 999px; padding: 1px 7px; }
    .spacer { flex: 1; }
    .foot { border-top: 1px solid var(--line); padding-top: 14px; display: flex; flex-direction: column; gap: 8px; }
    .foot a { color: var(--muted); text-decoration: none; font-size: 13px; padding: 4px 10px; }
    .foot a:hover { color: var(--ink); }
    .pill { display: inline-flex; align-items: center; gap: 6px; margin: 4px 10px 0; font-family: 'Roboto Mono', monospace; font-size: 10.5px; letter-spacing: .08em; color: var(--ok); border: 1px solid rgba(0, 212, 146, .4); border-radius: 999px; padding: 3px 9px; width: max-content; }
    .pill::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--ok); }
    .main { display: flex; flex-direction: column; min-width: 0; }
    .top { display: none; }
    .crumb { display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 22px; border-bottom: 1px solid var(--line); font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--faint); }
    .crumb b { color: var(--ink); font-weight: 500; }
    .crumb .sep { color: #33373f; }
    .crumb .right { margin-left: auto; text-transform: none; letter-spacing: 0; font-family: 'Inter', sans-serif; font-size: 12.5px; color: var(--muted); }
    /* Desktop: the demo runs in a phone-sized frame, centred — the same
       composition as the app's web rail. Phone: it IS the screen. */
    .frame { flex: 1; min-height: 0; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 28px 24px; }
    .frame iframe { width: 430px; max-width: 100%; height: 100%; max-height: 900px; border: 1px solid #23262c; border-radius: 26px; display: block; background: #000; box-shadow: 0 30px 80px rgba(0,0,0,.55); }

    @media (max-width: 767px) {
      .app { grid-template-columns: 1fr; }
      .rail { position: fixed; inset: 0; z-index: 50; transform: translateX(-100%); transition: transform .22s ease; padding-top: calc(env(safe-area-inset-top, 0px) + 18px); }
      .rail.open { transform: none; }
      .top { display: flex; align-items: center; gap: 10px; height: calc(env(safe-area-inset-top, 0px) + 52px); padding: env(safe-area-inset-top, 0px) 12px 0; border-bottom: 1px solid var(--line); background: var(--rail); }
      .top .menu { width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--line); background: #14161b; color: var(--ink); display: flex; align-items: center; justify-content: center; }
      .top .title { font-size: 15px; font-weight: 600; }
      .top .title small { display: block; font-size: 11.5px; font-weight: 400; color: var(--faint); }
      .crumb { display: none; }
      .frame { padding: 0; }
      .frame iframe { width: 100%; height: 100%; max-height: none; border: 0; border-radius: 0; box-shadow: none; }
      .rail .close { position: absolute; top: calc(env(safe-area-inset-top, 0px) + 16px); right: 14px; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: #14161b; color: var(--ink); display: flex; align-items: center; justify-content: center; }
    }
    @media (min-width: 768px) { .rail .close { display: none; } }
  </style>
</head>
<body>
  <div class="app">
    <nav class="rail" id="rail" aria-label="Demos">
      <button type="button" class="close" id="close" aria-label="Close menu">&#x2715;</button>
      <div class="brand">
        <svg viewBox="0 0 150 163" fill="none" aria-hidden="true"><path d="M147.597 30.2247C147.5 29.7539 147.288 29.3145 146.979 28.9457C146.671 28.5768 146.277 28.2899 145.831 28.1106L76.0714 0.19552C75.3809 -0.0651734 74.6191 -0.0651734 73.9286 0.19552L4.16945 28.1106C3.72348 28.2899 3.32881 28.5768 3.02062 28.9457C2.71243 29.3145 2.50029 29.7539 2.40311 30.2247C-9.17993 84.5204 22.0944 141.654 75 162.156C127.906 141.683 159.18 84.5204 147.597 30.2247ZM75 147.677C31.5345 131.084 5.84927 84.0569 15.3183 39.5199C15.4198 39.051 15.6335 38.6137 15.9412 38.2455C16.2488 37.8773 16.6412 37.5893 17.0846 37.4061L73.9286 14.6745C74.6191 14.4138 75.3809 14.4138 76.0714 14.6745L132.915 37.4062C133.359 37.5894 133.751 37.8775 134.059 38.2456C134.367 38.6138 134.58 39.0511 134.682 39.5201C144.151 84.0569 118.466 131.084 75 147.677Z" fill="url(#paint0_linear_113_1711)"/>
<path d="M74.915 40.7707C77.7023 40.7707 79.9619 42.7078 79.9619 45.0969C79.9618 46.8223 78.783 48.3108 77.0781 49.0051V53.7482H80.8857C83.0961 53.7482 84.8877 55.5408 84.8877 57.7512C84.8877 57.8603 84.8826 57.9684 84.874 58.0754H88.6143C98.361 58.0755 106.695 64.1205 110.075 72.6652C110.372 72.6104 110.678 72.5803 110.991 72.5803C113.763 72.5803 116.011 74.8278 116.011 77.5998C116.011 80.1522 114.105 82.2574 111.64 82.5754C110.902 94.6517 100.876 104.218 88.6143 104.218H61.2168C48.9548 104.218 38.9282 94.6518 38.1904 82.5754C35.7252 82.2569 33.8203 80.1518 33.8203 77.5998C33.8204 74.8278 36.0678 72.5803 38.8398 72.5803C39.1524 72.5803 39.4581 72.6105 39.7549 72.6652C43.1346 64.1202 51.4698 58.0755 61.2168 58.0754H65.1387C65.1301 57.9684 65.125 57.8603 65.125 57.7512C65.125 55.5408 66.9166 53.7482 69.127 53.7482H72.752V49.0051C71.0475 48.3107 69.8693 46.8221 69.8691 45.0969C69.8691 42.7079 72.128 40.7709 74.915 40.7707ZM60.4961 69.6096C53.7273 69.6099 48.2404 75.0976 48.2402 81.8664C48.2403 88.6353 53.7272 94.1229 60.4961 94.1232H89.3359C96.1048 94.123 101.592 88.6353 101.592 81.8664C101.592 75.0975 96.1048 69.6098 89.3359 69.6096H60.4961ZM63.2266 78.2609C65.1324 78.2609 66.6777 79.8063 66.6777 81.7121C66.6776 83.6178 65.1323 85.1623 63.2266 85.1623C61.321 85.1621 59.7765 83.6177 59.7764 81.7121C59.7764 79.8064 61.3209 78.2611 63.2266 78.2609ZM86.7549 78.2609C88.6605 78.2611 90.2051 79.8064 90.2051 81.7121C90.205 83.6177 88.6605 85.1621 86.7549 85.1623C84.8491 85.1623 83.3038 83.6178 83.3037 81.7121C83.3037 79.8063 84.8491 78.2609 86.7549 78.2609Z" fill="url(#paint1_linear_113_1711)"/>
<defs>
<linearGradient id="paint0_linear_113_1711" x1="137.232" y1="162.811" x2="129.859" y2="-28.35" gradientUnits="userSpaceOnUse">
<stop stop-color="#0F5E82"/>
<stop offset="0.163462" stop-color="#0F5E82"/>
<stop offset="0.509615" stop-color="#147BAA"/>
<stop offset="1" stop-color="#147BAA"/>
</linearGradient>
<linearGradient id="paint1_linear_113_1711" x1="109.015" y1="104.474" x2="106.953" y2="29.6236" gradientUnits="userSpaceOnUse">
<stop stop-color="#0F5E82"/>
<stop offset="0.163462" stop-color="#0F5E82"/>
<stop offset="0.509615" stop-color="#147BAA"/>
<stop offset="1" stop-color="#147BAA"/>
</linearGradient>
</defs></svg>
        <div><b>BotShield Demos</b><small>Public Beta</small></div>
      </div>
      ${nav}
      <div class="spacer"></div>
      <div class="foot">
        <a href="https://docs.botshield.ai" target="_blank" rel="noopener">Documentation &#8599;</a>
        <a href="https://console.botshield.ai" target="_blank" rel="noopener">Partner Console &#8599;</a>
        <a href="https://botshield.ai" target="_blank" rel="noopener">botshield.ai &#8599;</a>
        <span class="pill">Live on production</span>
      </div>
    </nav>
    <div class="main">
      <div class="top">
        <button type="button" class="menu" id="menu" aria-label="Open menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
        <div class="title" id="mtitle">BotShield Demos<small id="msub"></small></div>
      </div>
      <div class="crumb"><span>Demos</span><span class="sep">&middot;</span><b id="crumbGroup"></b><span class="sep">&middot;</span><span id="crumbLabel"></span><span class="right" id="crumbHint"></span></div>
      <div class="frame"><iframe id="frame" title="Selected demo" allow="publickey-credentials-get *; publickey-credentials-create *; clipboard-write"></iframe></div>
    </div>
  </div>
  <script>
    var DEMOS = ${JSON.stringify(DEMOS)};
    var rail = document.getElementById('rail');
    var frame = document.getElementById('frame');
    function pick(key, push) {
      var d = DEMOS.find(function(x) { return x.key === key && x.path; }) || DEMOS[0];
      Array.prototype.forEach.call(document.querySelectorAll('.it'), function(a) { a.classList.toggle('on', a.getAttribute('data-key') === d.key); });
      var qs = window.location.search.replace(/^\\?/, '');
      if (frame.getAttribute('data-key') !== d.key) { frame.src = d.path + (qs ? '?' + qs : ''); frame.setAttribute('data-key', d.key); }
      document.getElementById('crumbGroup').textContent = d.group;
      document.getElementById('crumbLabel').textContent = d.label;
      document.getElementById('crumbHint').textContent = d.hint;
      document.getElementById('msub').textContent = d.group + ' \\u00b7 ' + d.label;
      document.title = d.group + ' \\u00b7 ' + d.label + ' \\u2014 BotShield Demos';
      if (push && window.location.hash !== '#' + d.key) history.replaceState(null, '', '#' + d.key);
      rail.classList.remove('open');
    }
    Array.prototype.forEach.call(document.querySelectorAll('.it[href^="#"]'), function(a) {
      a.addEventListener('click', function(e) { e.preventDefault(); pick(a.getAttribute('data-key'), true); });
    });
    document.getElementById('menu').addEventListener('click', function() { rail.classList.add('open'); });
    document.getElementById('close').addEventListener('click', function() { rail.classList.remove('open'); });
    window.addEventListener('hashchange', function() { pick(window.location.hash.slice(1), false); });
    var initial = (new URLSearchParams(window.location.search).get('demo')) || window.location.hash.slice(1) || 'ticketz';
    pick(initial, true);
  </script>
</body>
</html>`;
}
