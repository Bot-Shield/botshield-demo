// Ticketz — Agents Ask. A branded chat with the Ticketz agent (Claude through
// the BotShield agentgateway, Ticketz MCP tools behind it). When the agent
// wants to buy, the purchase pauses for the human's approval in the BotShield
// app (Agents Ask) and resumes with the signed Proof of Resolution.
//
// The page talks only to this worker (/api/agent/chat); the worker talks to
// the gateway. Until AGENT_GATEWAY_URL is configured the worker answers 503
// and the page says so — no fake replies.
// Served at /agent; framed by the Demos shell.
export const agentHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <meta name="robots" content="noindex">
  <title>Ticketz - Agent</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #000; color: #fff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
    .page { height: 100dvh; display: flex; flex-direction: column; align-items: center; padding: 16px; padding-top: calc(env(safe-area-inset-top, 0px) + 16px); padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px); }
    .header { display: flex; align-items: center; gap: 12px; padding: 18px 0 14px; flex-shrink: 0; }
    .header-mark { width: 36px; height: 36px; border-radius: 50%; background: #7c3aed; display: flex; align-items: center; justify-content: center; }
    .header-brand { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .header-sub { font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #6b6b6b; }
    .chat { width: 100%; max-width: 560px; flex: 1; min-height: 0; display: flex; flex-direction: column; background: #0e0e10; border: 1px solid #1f1f1f; border-radius: 18px; overflow: hidden; }
    .status { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid #1a1a1a; font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #7a7a7a; }
    .status .dot { width: 7px; height: 7px; border-radius: 50%; background: #3a3a3a; }
    .status.live .dot { background: #00d492; box-shadow: 0 0 0 3px rgba(0, 212, 146, 0.18); }
    .status.off .dot { background: #ffb547; }
    .log { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 10px; -webkit-overflow-scrolling: touch; }
    .msg { max-width: 86%; padding: 10px 13px; border-radius: 14px; font-size: 14.5px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
    .msg.user { align-self: flex-end; background: #7c3aed; color: #fff; border-bottom-right-radius: 4px; }
    .msg.agent { align-self: flex-start; background: #17171a; border: 1px solid #222; border-bottom-left-radius: 4px; }
    .msg.agent b { color: #fff; } .msg.agent code { font-family: 'Roboto Mono', monospace; font-size: 12.5px; color: #c9d1ff; }
    .msg.sys { align-self: center; background: transparent; color: #8a8a8a; font-size: 12.5px; text-align: center; max-width: 100%; }
    .msg.tool { align-self: flex-start; font-family: 'Roboto Mono', monospace; font-size: 11.5px; color: #9aa0ad; background: #101216; border: 1px dashed #2a2f3a; }
    .msg.ask { align-self: flex-start; background: rgba(0, 212, 146, 0.08); border: 1px solid rgba(0, 212, 146, 0.35); color: #d7fff1; }
    .msg.ask b { color: #00d492; }
    .compose { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #1a1a1a; }
    .compose input { flex: 1; min-width: 0; background: #151517; border: 1px solid #262626; border-radius: 11px; color: #fff; font-family: inherit; font-size: 15px; padding: 11px 13px; outline: none; }
    .compose input:focus { border-color: #7c3aed; }
    .compose button { background: #7c3aed; color: #fff; border: 0; border-radius: 11px; font-family: inherit; font-size: 14px; font-weight: 600; padding: 0 16px; cursor: pointer; }
    .compose button:disabled { opacity: .45; cursor: not-allowed; }
    .chips { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 12px 10px; }
    .chip { background: #131316; border: 1px solid #262626; border-radius: 999px; color: #c9c9c9; font-family: inherit; font-size: 12.5px; padding: 6px 11px; cursor: pointer; }
    .link { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #1a1a1a; background: #0b0d12; font-size: 13px; }
    .link .l { color: #c9c9c9; }
    .link .l b { color: #fff; font-weight: 600; }
    .link.bound .l b { color: #00d492; }
    .link button { background: #147baa; color: #fff; border: 0; border-radius: 9px; font-family: inherit; font-size: 12.5px; font-weight: 600; padding: 7px 11px; cursor: pointer; white-space: nowrap; }
    .link button.ghost { background: transparent; border: 1px solid #2a2a2a; color: #c9c9c9; }
    .code { font-family: 'Roboto Mono', monospace; font-size: 22px; letter-spacing: .22em; color: #fff; background: #151517; border: 1px solid #2a2a2a; border-radius: 9px; padding: 4px 10px 4px 14px; }
    .foot { font-size: 11.5px; color: #5b5b5b; text-align: center; padding: 10px 8px 0; line-height: 1.5; max-width: 560px; }
    .foot b { color: #8a8a8a; font-weight: 600; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4Z"/></svg></div>
      <div>
        <div class="header-brand">Ticketz Agent</div>
        <div class="header-sub">Agents Ask &middot; a human approves every purchase</div>
      </div>
    </div>

    <div class="chat">
      <div class="status" id="status"><span class="dot"></span><span id="statusText">Connecting&hellip;</span></div>
      <div class="link" id="link">
        <span class="l" id="linkText"><b>Link your BotShield ID</b> &mdash; so a purchase can be sent to <i>your</i> phone.</span>
        <button type="button" id="linkBtn">Link</button>
      </div>
      <div class="log" id="log">
        <div class="msg agent">Hi, I&rsquo;m the Ticketz agent. I can find shows and buy tickets for you &mdash; but I never spend without you. When it&rsquo;s time to pay, the request goes to your phone and <b>you</b> confirm with BotShield.</div>
      </div>
      <div class="chips">
        <button type="button" class="chip" data-q="What shows are on this weekend?">What shows are on this weekend?</button>
        <button type="button" class="chip" data-q="Buy me 2 tickets to the next show on sale.">Buy 2 tickets to the next show</button>
        <button type="button" class="chip" data-q="How does the approval on my phone work?">How does approval work?</button>
      </div>
      <form class="compose" id="compose">
        <input id="input" type="text" placeholder="Ask the Ticketz agent&hellip;" autocomplete="off" maxlength="600">
        <button type="submit" id="send" disabled>Send</button>
      </form>
    </div>
    <p class="foot"><b>What you&rsquo;re watching:</b> Claude runs the Ticketz tools through the BotShield gateway. Any tool that spends is held until a verified human confirms it in the BotShield app &mdash; the agent gets a signed Proof of Resolution, never your card.</p>
  </div>

  <script>
    var log = document.getElementById('log');
    var input = document.getElementById('input');
    var send = document.getElementById('send');
    var statusEl = document.getElementById('status'); // not 'status': window.status is a string property
    var statusText = document.getElementById('statusText');
    var turns = []; // not 'history': window.history
    var live = false;
    var LINK_KEY = 'tkz_agent_bind_jwt';
    var bindToken = sessionStorage.getItem(LINK_KEY) || null;
    var linkEl = document.getElementById('link');
    var linkText = document.getElementById('linkText');
    var linkBtn = document.getElementById('linkBtn');
    var linkPolling = false;

    function renderLink() {
      if (bindToken) {
        linkEl.classList.add('bound');
        linkText.innerHTML = '<b>BotShield ID linked.</b> Purchases go to your phone for approval.';
        linkBtn.textContent = 'Unlink'; linkBtn.className = 'ghost';
      } else {
        linkEl.classList.remove('bound');
        linkText.innerHTML = '<b>Link your BotShield ID</b> \u2014 so a purchase can be sent to <i>your</i> phone.';
        linkBtn.textContent = 'Link'; linkBtn.className = '';
      }
    }
    renderLink();

    // The Link ceremony: a 6-character code, entered in the BotShield app
    // (Agents Ask → Link), answered with a bind JWT the gateway trusts.
    async function startLink() {
      if (linkPolling) return;
      linkPolling = true;
      linkBtn.disabled = true;
      try {
        var r = await fetch('/api/agent/link/start', { method: 'POST' });
        var j = await r.json();
        if (!r.ok || !j.code) { add('sys', 'Could not start the link: ' + (j.error || r.status)); return; }
        linkText.innerHTML = 'In the BotShield app, open <b>Agents Ask \u2192 Link</b> and enter <span class="code">' + j.code + '</span>';
        linkBtn.textContent = 'Waiting\u2026';
        for (var i = 0; i < 18; i++) { // ~6 min of 20s long-polls
          var s = await fetch('/api/agent/link/status?code=' + encodeURIComponent(j.code));
          var sj = await s.json();
          if (sj.status === 'bound' && sj.token) {
            bindToken = sj.token; sessionStorage.setItem(LINK_KEY, bindToken);
            add('sys', 'Linked. Purchases will be proposed to your phone.');
            return;
          }
          if (sj.status === 'expired' || sj.status === 'denied') { add('sys', 'Link ' + sj.status + ' \u2014 try again.'); return; }
        }
        add('sys', 'Link timed out \u2014 try again.');
      } catch (e) { add('sys', 'Link failed \u2014 try again.'); }
      finally { linkPolling = false; linkBtn.disabled = false; renderLink(); }
    }
    linkBtn.addEventListener('click', function() {
      if (bindToken) { bindToken = null; sessionStorage.removeItem(LINK_KEY); renderLink(); add('sys', 'Unlinked.'); }
      else startLink();
    });

    // Tiny markdown for agent replies: **bold**, inline code, "- " bullets. Escaped first.
    function mdLite(t) {
      var e = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      e = e.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\x60([^\x60]+)\x60/g, '<code>$1</code>');
      e = e.replace(/^- (.*)$/gm, '\u2022 $1');
      return e;
    }
    function add(kind, text) {
      var d = document.createElement('div');
      d.className = 'msg ' + kind;
      if (kind === 'ask') d.innerHTML = text; else if (kind === 'agent' && text !== '\u2026') d.innerHTML = mdLite(text); else d.textContent = text;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    }
    function setLive(on, text) {
      live = on;
      statusEl.className = 'status ' + (on ? 'live' : 'off');
      statusText.textContent = text;
      send.disabled = !on;
    }

    // Health: is the worker wired to a gateway?
    fetch('/api/agent/health').then(function(r) { return r.json(); }).then(function(h) {
      if (h && h.ok) setLive(true, 'Live \\u00b7 ' + (h.model || 'claude') + ' \\u00b7 via BotShield gateway');
      else { setLive(false, 'Not connected'); add('sys', (h && h.reason) || 'The Ticketz agent is not connected to a gateway yet.'); }
    }).catch(function() { setLive(false, 'Not connected'); add('sys', 'The Ticketz agent is not connected to a gateway yet.'); });

    async function ask(q) {
      if (!q || !live) return;
      add('user', q);
      turns.push({ role: 'user', content: q });
      input.value = '';
      send.disabled = true;
      var pending = add('agent', '\\u2026');
      try {
        var headers = { 'Content-Type': 'application/json' };
        if (bindToken) headers['Authorization'] = 'Bearer ' + bindToken;
        var r = await fetch('/api/agent/chat', { method: 'POST', headers: headers, body: JSON.stringify({ messages: turns }) });
        var j = await r.json();
        if (!r.ok) { pending.className = 'msg sys'; pending.textContent = j.error || 'The agent could not answer.'; return; }
        pending.remove();
        (j.events || []).forEach(function(ev) {
          if (ev.type === 'tool') add('tool', ev.name + '(' + (ev.args || '') + ')' + (ev.result ? ' \\u2192 ' + ev.result : ''));
          else if (ev.type === 'ask') add('ask', '<b>Waiting on you.</b> ' + ev.text);
        });
        add('agent', j.reply || '(no reply)');
        turns.push({ role: 'assistant', content: j.reply || '' });
      } catch (e) {
        pending.className = 'msg sys'; pending.textContent = 'Network error \\u2014 try again.';
      } finally {
        send.disabled = !live;
        input.focus();
      }
    }
    document.getElementById('compose').addEventListener('submit', function(e) { e.preventDefault(); ask(input.value.trim()); });
    Array.prototype.forEach.call(document.querySelectorAll('.chip'), function(c) { c.addEventListener('click', function() { input.value = c.getAttribute('data-q'); ask(input.value); }); });
    input.addEventListener('input', function() { send.disabled = !live || !input.value.trim(); });
  </script>
</body>
</html>`;
