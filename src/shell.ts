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
}

export const DEMOS: DemoEntry[] = [
  { key: 'ticketz', group: 'Ticketz', label: 'BotShield Gate', hint: 'Human Gate at checkout', path: '/ticketz' },
  { key: 'agent', group: 'Ticketz', label: 'Agents Ask', hint: 'An agent buys, a human approves', path: '/agent', badge: 'Phase 2' },
  { key: 'vapez', group: 'Vapez', label: 'Age Gate', hint: '18+ to enter the store', path: '/vapez' },
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
          : `<a class="it" data-key="${d.key}" href="#${d.key}"><span class="it-l">${d.label}${d.badge ? `<span class="badge">${d.badge}</span>` : ''}</span><span class="it-h">${d.hint}</span></a>`).join('')}
      </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0b0c0e">
  <title>BotShield Demos</title>
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
    .frame { flex: 1; min-height: 0; background: #000; }
    .frame iframe { width: 100%; height: 100%; border: 0; display: block; background: #000; }

    @media (max-width: 767px) {
      .app { grid-template-columns: 1fr; }
      .rail { position: fixed; inset: 0; z-index: 50; transform: translateX(-100%); transition: transform .22s ease; padding-top: calc(env(safe-area-inset-top, 0px) + 18px); }
      .rail.open { transform: none; }
      .top { display: flex; align-items: center; gap: 10px; height: calc(env(safe-area-inset-top, 0px) + 52px); padding: env(safe-area-inset-top, 0px) 12px 0; border-bottom: 1px solid var(--line); background: var(--rail); }
      .top .menu { width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--line); background: #14161b; color: var(--ink); display: flex; align-items: center; justify-content: center; }
      .top .title { font-size: 15px; font-weight: 600; }
      .top .title small { display: block; font-size: 11.5px; font-weight: 400; color: var(--faint); }
      .crumb { display: none; }
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
        <svg viewBox="0 0 150 163" fill="none" aria-hidden="true"><path d="M75 4 12 30v45c0 39 27 72 63 84 36-12 63-45 63-84V30L75 4Z" stroke="#147baa" stroke-width="10" stroke-linejoin="round"/><circle cx="75" cy="78" r="18" stroke="#147baa" stroke-width="9"/><circle cx="66" cy="78" r="3.5" fill="#147baa"/><circle cx="84" cy="78" r="3.5" fill="#147baa"/></svg>
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
