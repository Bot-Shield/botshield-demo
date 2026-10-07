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
  <link rel="icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
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
    .log { flex: 1 1 0; min-height: 0; overflow-y: auto; overscroll-behavior: contain; touch-action: pan-y; padding: 16px 14px; display: flex; flex-direction: column; gap: 10px; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }
    .log > * { flex-shrink: 0; }
    .msg { max-width: 86%; padding: 10px 13px; border-radius: 14px; font-size: 14.5px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
    .msg.user { align-self: flex-end; background: #7c3aed; color: #fff; border-bottom-right-radius: 4px; }
    .msg.agent { align-self: flex-start; background: #17171a; border: 1px solid #222; border-bottom-left-radius: 4px; }
    .msg.agent b { color: #fff; } .msg.agent code { font-family: 'Roboto Mono', monospace; font-size: 12.5px; color: #c9d1ff; }
    .msg.agent .trow { margin: 6px 0; padding: 8px 10px; border-radius: 10px; background: #101013; border: 1px solid #23232a; white-space: normal; }
    .msg.agent .tname { font-weight: 600; color: #fff; margin-bottom: 3px; }
    .msg.agent .tcell { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; color: #d4d4d4; }
    .msg.agent .tcell span { color: #7a7a7a; font-size: 11.5px; text-transform: uppercase; letter-spacing: .06em; }
    .msg.sys { align-self: center; background: transparent; color: #8a8a8a; font-size: 12.5px; text-align: center; max-width: 100%; }
    .msg.tool { align-self: flex-start; font-family: 'Roboto Mono', monospace; font-size: 11.5px; color: #9aa0ad; background: #101216; border: 1px dashed #2a2f3a; padding: 8px 11px; white-space: normal; }
    .msg.tool summary { cursor: pointer; list-style: none; display: flex; align-items: center; gap: 8px; }
    .msg.tool summary::-webkit-details-marker { display: none; }
    .msg.tool summary::before { content: '\\25B8'; color: #5b6070; font-size: 10px; }
    .msg.tool details[open] summary::before { content: '\\25BE'; }
    .msg.tool .tname { color: #c9d1ff; }
    .msg.tool .tcount { color: #7c8aa5; font-size: 10.5px; margin-left: 2px; }
    .msg.tool pre { margin: 8px 0 0; white-space: pre-wrap; word-break: break-word; color: #8a90a0; max-height: 220px; overflow: auto; font: inherit; }
    .msg.ask { align-self: flex-start; background: rgba(20, 123, 170, 0.10); border: 1px solid rgba(20, 123, 170, 0.5); color: #e6f4fb; display: flex; gap: 10px; align-items: flex-start; }
    .msg.ask b { color: #5cc3ee; display: block; margin-bottom: 2px; }
    .msg.ask .ph { flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; background: #147baa; display: flex; align-items: center; justify-content: center; }
    .msg.ask .wait { display: block; margin-top: 6px; font-size: 12px; color: #9cc9de; }
    .msg.ask .wait i { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #5cc3ee; margin-right: 3px; animation: bsdot 1.2s infinite ease-in-out; }
    .msg.ask .wait i:nth-child(2) { animation-delay: .18s; } .msg.ask .wait i:nth-child(3) { animation-delay: .36s; }
    .msg.ask .links { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .msg.ask .links a { font-size: 12px; color: #fff; background: #147baa; border-radius: 8px; padding: 5px 9px; text-decoration: none; }
    .msg.ask .links a.ghost { background: transparent; border: 1px solid #2a3f4b; color: #b9dcea; }
    .msg.ask.done .wait, .msg.ask.done .links { display: none; }
    .msg.closed { align-self: flex-start; background: rgba(255, 90, 90, 0.08); border: 1px solid rgba(255, 90, 90, 0.35); color: #ffd9d9; }
    .msg.order { align-self: flex-start; background: rgba(0, 212, 146, 0.08); border: 1px solid rgba(0, 212, 146, 0.4); color: #d7fff1; width: 86%; }
    .msg.order b { color: #00d492; display: block; margin-bottom: 6px; }
    .msg.order .row { display: flex; justify-content: space-between; gap: 12px; font-size: 13.5px; padding: 3px 0; border-top: 1px solid rgba(0,212,146,.12); }
    .msg.order .row span:last-child { color: #fff; font-weight: 600; text-align: right; }
    .msg.order .att { margin-top: 8px; font-family: 'Roboto Mono', monospace; font-size: 10.5px; color: #7fd9b9; word-break: break-all; }
    .msg.typing { align-self: flex-start; background: #17171a; border: 1px solid #222; border-bottom-left-radius: 4px; padding: 12px 14px; display: flex; gap: 5px; align-items: center; }
    .msg.typing i { width: 7px; height: 7px; border-radius: 50%; background: #8a8a8a; animation: bsdot 1.2s infinite ease-in-out; }
    .msg.typing i:nth-child(2) { animation-delay: .18s; } .msg.typing i:nth-child(3) { animation-delay: .36s; }
    @keyframes bsdot { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
    .msg.typing small { margin-left: 8px; font-size: 12px; color: #7a7a7a; }
    .compose { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #1a1a1a; }
    .compose input { flex: 1; min-width: 0; background: #151517; border: 1px solid #262626; border-radius: 11px; color: #fff; font-family: inherit; font-size: 15px; padding: 11px 13px; outline: none; }
    .compose input:focus { border-color: #7c3aed; }
    .compose button { background: #7c3aed; color: #fff; border: 0; border-radius: 11px; font-family: inherit; font-size: 14px; font-weight: 600; padding: 0 16px; cursor: pointer; }
    .compose button:disabled { opacity: .45; cursor: not-allowed; }
    .chips { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 12px 10px; }
    .chip { background: #131316; border: 1px solid #262626; border-radius: 999px; color: #c9c9c9; font-family: inherit; font-size: 12.5px; padding: 6px 11px; cursor: pointer; }
    /* The Link ceremony, built to the DS frame on the Website Demo Page
       (section 3249:3932, in-chat state 3253:3889). At rest it is a one-line
       strip; the ceremony turns it into the card that frame specifies. */
    .link { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #1a1a1a; background: #0b0d12; font-size: 13px; }
    .link .l { color: #c9c9c9; }
    .link .l b { color: #fff; font-weight: 600; }
    .link.bound .l b { color: #23cb78; }
    /* .btn.sm from the site — the ghost is the same button, no ground. */
    .link button { background: linear-gradient(180deg, #16181b, #0e1013); border: 1px solid #373a41; color: #fff;
                   border-radius: 10px; font-family: inherit; font-size: 13.5px; font-weight: 600; padding: 10px 16px;
                   cursor: pointer; white-space: nowrap; line-height: 1; transition: border-color .15s, box-shadow .15s; }
    .link button:hover, .link button:active { border-color: #1a9fd6; box-shadow: 0 0 0 1px rgba(26,159,214,.12), 0 0 22px -4px rgba(26,159,214,.5); }
    .link button.ghost { background: transparent; }

    .link.linking { display: block; position: relative; margin: 12px; padding: 18px; background: #111418; border: 1px solid #22262f; border-bottom-color: #22262f; border-radius: 14px; }
    .link.linking .l { display: block; }
    .link.linking > button { position: absolute; top: 15px; right: 15px; }
    .lk-wrap { position: relative; }

    .lk-h { font-size: 19px; line-height: 24px; letter-spacing: -0.4px; font-weight: 600; color: #f7f7f7; padding-right: 72px; }
    .lk-sub { margin-top: 7px; font-size: 13px; line-height: 20px; color: #94979c; }
    /* The site's .btn, verbatim: a dark gradient with a hairline edge and a
       white label. Blue is the hover/pressed state, never the resting fill. */
    .lk-open { display: block; margin-top: 14px; background: linear-gradient(180deg, #16181b, #0e1013);
               border: 1px solid #373a41; color: #fff; text-decoration: none; text-align: center;
               font-weight: 600; font-size: 15px; padding: 14px 22px; border-radius: 10px; line-height: 1;
               transition: border-color .15s, box-shadow .15s; }
    .lk-open:hover, .lk-open:active { border-color: #1a9fd6; box-shadow: 0 0 0 1px rgba(26,159,214,.12), 0 0 22px -4px rgba(26,159,214,.5); }

    .lk-row { display: flex; gap: 14px; align-items: center; margin-top: 14px; }
    .lk-qr { flex: none; width: 128px; height: 128px; border-radius: 12px; background: #fff; padding: 10px; box-sizing: border-box; }
    .lk-label { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 10px; letter-spacing: 2px; color: #61656c; }
    .lk-code { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 17px; letter-spacing: 3.6px; color: #f7f7f7; margin-top: 5px; }
    .lk-hint { margin-top: 13px; font-size: 12.5px; line-height: 19px; color: #94979c; }

    .lk-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 15px; padding-top: 14px; border-top: 1px solid #22262f; }
    .lk-chip { display: flex; align-items: center; gap: 5px; padding: 6px 12px 6px 6px; border: 1px solid #373a41; border-radius: 8px;
               background: linear-gradient(180deg, #16191f 0%, #0e1116 100%); box-shadow: inset 0 1px 0 0 rgba(255,255,255,.05); }
    .lk-chip svg { flex: none; width: 29px; height: 22px; }
    .lk-chip .t1 { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; color: #94979c; }
    .lk-chip .t2 { font-size: 14px; font-weight: 600; letter-spacing: -0.16px; color: #f7f7f7; margin-top: 2px; }
    .lk-pk { display: flex; align-items: center; gap: 5px; }
    .lk-pk svg { flex: none; width: 26px; height: 26px; }
    .lk-pk .p1 { font-size: 11px; line-height: 13px; color: #8f8f8f; }
    .lk-pk .p2 { font-size: 15.5px; line-height: 18px; font-weight: 700; color: #fff; }

    /* The real viewport is passed in by the shell as ?m=1 — this page lives in a
       430px iframe, so its own media queries can never see the browser width.
       A QR shown ON the phone cannot be scanned BY that phone. */
    .link .desktop-only { display: inline; }
    .link .mobile-only { display: none; }
    html.is-mobile .link .desktop-only { display: none; }
    html.is-mobile .link .mobile-only { display: inline; }
    html.is-mobile .lk-qr { display: none; }
    html.is-mobile .lk-row { gap: 0; }

    .code { font-family: 'JetBrains Mono', monospace; font-size: 17px; letter-spacing: .2em; color: #f7f7f7; }
    .foot { font-size: 11.5px; color: #5b5b5b; text-align: center; padding: 10px 8px 0; line-height: 1.5; max-width: 560px; }
    .foot b { color: #8a8a8a; font-weight: 600; }
  </style>
</head>
<body>
  <script>(function(){try{
    /* The shell always passes ?m= because only it sees the real browser width.
       Opened on its own (no shell, no param), fall back to our own width. */
    var m = new URLSearchParams(location.search).get('m');
    var mobile = (m === null) ? (window.innerWidth < 1024) : (m === '1');
    if (mobile) document.documentElement.classList.add('is-mobile');
  }catch(e){}})();</script>
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
    var AGENT_NAME = 'Ticketz';
    var ROBOT_SVG = '<svg viewBox="0 0 34.7937 26.8591" fill="none" xmlns="http://www.w3.org/2000/svg"> <path id="Vector" d="M17.3975 0C18.5771 0.00025 19.5335 0.819875 19.5337 1.83113C19.5337 2.56113 19.034 3.1885 18.313 3.48275V5.49437H19.9244C20.86 5.49437 21.6186 6.253 21.6186 7.18875C21.6186 7.23488 21.615 7.28038 21.6114 7.3255H23.1957C27.322 7.32563 30.8482 9.886 32.279 13.5035C32.4055 13.48 32.5364 13.4669 32.6696 13.4669C33.843 13.4671 34.7937 14.4188 34.7937 15.5921C34.7935 16.6729 33.9864 17.5626 32.9419 17.6966C32.6299 22.8091 28.3867 26.8589 23.1957 26.8591H11.5979C6.40637 26.859 2.16191 22.8086 1.85059 17.6954C0.806975 17.5606 0.0002 16.6724 0 15.5921C0 14.4186 0.951725 13.4669 2.12525 13.4669C2.25831 13.4669 2.38836 13.48 2.51465 13.5035C3.94539 9.886 7.47162 7.32563 11.5979 7.3255H13.2592C13.2556 7.28038 13.252 7.23488 13.252 7.18875C13.252 6.25313 14.0106 5.4945 14.9462 5.49437H16.4819V3.48387C15.7604 3.18987 15.2612 2.5615 15.2612 1.83113C15.2614 0.819875 16.2176 0 17.3975 0ZM11.2927 12.2083C8.42762 12.2086 6.10512 14.5312 6.10475 17.3962C6.10475 20.2617 8.42737 22.5853 11.2927 22.5855H23.5022C26.3676 22.5853 28.6901 20.2617 28.6901 17.3962C28.6897 14.5312 26.3672 12.2085 23.5022 12.2083H11.2927ZM12.4487 15.8716C13.2555 15.8717 13.9099 16.526 13.9099 17.3328C13.9097 18.1394 13.2554 18.7927 12.4487 18.7927C11.6421 18.7927 10.9877 18.1394 10.9875 17.3328C10.9875 16.526 11.6419 15.8716 12.4487 15.8716ZM22.4085 15.8716C23.2151 15.8716 23.8695 16.525 23.8696 17.3316C23.8696 18.1384 23.2152 18.7927 22.4085 18.7927C21.6017 18.7926 20.9485 18.1383 20.9485 17.3316C20.9486 16.525 21.6019 15.8717 22.4085 15.8716Z" fill="#1A9FD6"/> </svg>';
    var PASSKEY_SVG = '<svg viewBox="0 0 44.1964 44.1964" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="Passkey 1"> <path id="Vector" d="M5.52459 36.8304V31.6742C5.52459 30.6306 5.79345 29.6718 6.33118 28.7977C6.8689 27.9236 7.58218 27.2558 8.47102 26.7941C10.3739 25.8427 12.3075 25.1294 14.2718 24.6543C16.2361 24.1792 18.2311 23.941 20.2567 23.9398C20.8706 23.9398 21.4844 23.9631 22.0983 24.0098C22.7121 24.0564 23.3259 24.1252 23.9398 24.216C23.817 25.9962 24.1393 27.6768 24.9066 29.2581C25.6739 30.8393 26.7941 32.1358 28.2673 33.1474V36.8304H5.52459ZM34.9889 42.355L32.2266 39.5927V31.0296C30.8762 30.6306 29.7712 29.8713 28.9119 28.7517C28.0525 27.632 27.6228 26.335 27.6228 24.8606C27.6228 23.0804 28.252 21.5612 29.5104 20.3028C30.7687 19.0444 32.288 18.4152 34.0681 18.4152C35.8482 18.4152 37.3675 19.0444 38.6259 20.3028C39.8842 21.5612 40.5134 23.0804 40.5134 24.8606C40.5134 26.2417 40.1218 27.4694 39.3385 28.5436C38.5553 29.6178 37.5658 30.3851 36.37 30.8455L38.6719 33.1474L35.9096 35.9097L38.6719 38.6719L34.9889 42.355ZM20.2567 22.0983C18.2311 22.0983 16.497 21.377 15.0544 19.9345C13.6119 18.492 12.8907 16.7579 12.8907 14.7322C12.8907 12.7065 13.6119 10.9724 15.0544 9.52992C16.497 8.08739 18.2311 7.36613 20.2567 7.36613C22.2824 7.36613 24.0165 8.08739 25.459 9.52992C26.9015 10.9724 27.6228 12.7065 27.6228 14.7322C27.6228 16.7579 26.9015 18.492 25.459 19.9345C24.0165 21.377 22.2824 22.0983 20.2567 22.0983ZM35.3811 25.2528C35.7335 24.8992 35.9096 24.4616 35.9096 23.9398C35.9096 23.418 35.7328 22.981 35.3793 22.6286C35.0257 22.2763 34.5887 22.0995 34.0681 22.0983C33.5476 22.097 33.1105 22.2738 32.757 22.6286C32.4034 22.9834 32.2266 23.4205 32.2266 23.9398C32.2266 24.4591 32.4034 24.8968 32.757 25.2528C33.1105 25.6088 33.5476 25.785 34.0681 25.7813C34.5887 25.7776 35.0263 25.6008 35.3811 25.251" fill="white"/> </g> </svg>';
    var linkRun = 0; // bumped on cancel so a stale poll can't repaint the strip
    // The run panel lives outside this iframe, so the demo reports its progress
    // to the shell. Same origin; the shell checks the source.
    function narrate(msg) { try { if (window.parent !== window) window.parent.postMessage(msg, '*'); } catch (err) {} }

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
    // entered under the agent icon top right on the BotShield tab, answered
    // with a bind JWT the gateway trusts. Agents Ask is the inbox the ask lands
    // in afterwards — it is not where you link.
    // Both viewports' copy ships in the markup and CSS picks one, because the
    // shell can flip is-mobile on resize long after the card was built.
    async function startLink() {
      var run = ++linkRun;
      linkBtn.disabled = true;
      try {
        var r = await fetch('/api/agent/link/start', { method: 'POST' });
        var j = await r.json();
        if (run !== linkRun) return;
        if (!r.ok || !j.code) { add('sys', 'Could not start the link: ' + (j.error || r.status)); return; }
        if (window.bsTrack) bsTrack('agent_link_start');
        narrate({ bs: 'step', n: 1 });
        // Same browser: the deep link opens the app's Link screen with the code
        // filled in. Phone: scan the QR of that same link. Typing is the fallback.
        var claim = (j.claim_url && String(j.claim_url).indexOf('https://app.botshield.ai/') === 0) ? j.claim_url : null;
        linkEl.classList.add('linking');
        linkText.innerHTML =
          '<div class="lk-wrap">' +
            '<div class="lk-h">Link ' + AGENT_NAME + ' Agent with BotShield.</div>' +
            '<div class="lk-sub">' +
              /* The chip below already says "Secured with Passkey", so this line
                 names the consequence instead: where the agent's asks land. */
              '<span class="desktop-only">Scan to link it. Its requests then land in your Agents Ask inbox, and wait for your yes.</span>' +
              '<span class="mobile-only">Link this agent. Its requests then land in your Agents Ask inbox, and wait for your yes.</span>' +
            '</div>' +
            (claim ? '<a class="lk-open" data-cta="app" href="' + claim + '" target="_blank" rel="noopener">' +
                       '<span class="desktop-only">Open the web app</span>' +
                       '<span class="mobile-only">Open BotShield on this phone</span>' +
                     '</a>' : '') +
            '<div class="lk-row">' +
              '<img class="lk-qr" src="/api/agent/link/qr?code=' + encodeURIComponent(j.code) + '" alt="QR: open BotShield to link" width="128" height="128">' +
              '<div><div class="lk-label">LINK CODE</div><div class="lk-code">' + j.code + '</div></div>' +
            '</div>' +
            '<div class="lk-hint">' +
              '<span class="desktop-only">Scan it, or tap</span>' +
              '<span class="mobile-only">Already in the app? Tap</span>' +
              ' the agent icon, top right, and enter the code.' +
            '</div>' +
            '<div class="lk-foot">' +
              '<div class="lk-chip">' + ROBOT_SVG +
                '<div><div class="t1">Link with</div><div class="t2">BotShield</div></div>' +
              '</div>' +
              '<div class="lk-pk">' + PASSKEY_SVG +
                '<div><div class="p1">Secured with</div><div class="p2">Passkey</div></div>' +
              '</div>' +
            '</div>' +
          '</div>';
        linkBtn.textContent = 'Cancel'; linkBtn.className = 'ghost'; linkBtn.disabled = false;
        for (var i = 0; i < 18; i++) { // ~6 min of 20s long-polls
          var s = await fetch('/api/agent/link/status?code=' + encodeURIComponent(j.code));
          var sj = await s.json();
          if (run !== linkRun) return;
          if (sj.status === 'bound' && sj.token) {
            bindToken = sj.token; sessionStorage.setItem(LINK_KEY, bindToken);
            if (window.bsTrack) bsTrack('agent_linked');
            narrate({ bs: 'step', n: 2 });
            add('sys', 'Linked. Purchases will be proposed to your phone.');
            return;
          }
          if (sj.status === 'expired' || sj.status === 'denied') { add('sys', 'Link ' + sj.status + ' \u2014 try again.'); return; }
        }
        add('sys', 'Link timed out \u2014 try again.');
      } catch (e) { if (run === linkRun) add('sys', 'Link failed \u2014 try again.'); }
      // A cancel bumps linkRun, so a superseded poll never repaints the strip.
      finally { if (run === linkRun) { linkEl.classList.remove('linking'); linkBtn.disabled = false; renderLink(); } }
    }
    linkBtn.addEventListener('click', function() {
      if (linkEl.classList.contains('linking')) { linkRun++; linkEl.classList.remove('linking'); linkBtn.disabled = false; renderLink(); }
      else if (bindToken) { bindToken = null; sessionStorage.removeItem(LINK_KEY); renderLink(); add('sys', 'Unlinked.'); narrate({ bs: 'reset' }); }
      else startLink();
    });

    // Tiny markdown for agent replies: **bold**, inline code, "- " bullets. Escaped first.
    // A markdown table (if the model still writes one) → stacked rows: first
    // cell bold, the rest as "label value" lines. Reads on a phone; a pipe grid does not.
    function tableToRows(block) {
      var lines = block.split('\\n').filter(function(l) { return /^\\s*\\|/.test(l); });
      if (lines.length < 2) return block;
      var cells = function(l) { return l.replace(/^\\s*\\|/, '').replace(/\\|\\s*$/, '').split('|').map(function(c) { return c.trim(); }); };
      var head = cells(lines[0]);
      var rows = lines.slice(1).filter(function(l) { return !/^\\s*\\|?\\s*:?-{2,}/.test(l); }).map(cells);
      return rows.map(function(r) {
        var first = '<div class="trow"><div class="tname">' + r[0] + '</div>';
        var rest = r.slice(1).map(function(c, i) { return '<div class="tcell"><span>' + (head[i + 1] || '') + '</span>' + c + '</div>'; }).join('');
        return first + rest + '</div>';
      }).join('');
    }
    function mdLite(t) {
      var e = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      e = e.replace(/\\*\\*([^*]+)\\*\\*/g, '<b>$1</b>').replace(/\\x60([^\\x60]+)\\x60/g, '<code>$1</code>');
      e = e.replace(/^#{1,3} (.*)$/gm, '<b>$1</b>');
      e = e.replace(/(?:^\\s*\\|.*(?:\\n|$))+/gm, function(block) { return tableToRows(block.replace(/\\n$/, '')); });
      e = e.replace(/^- (.*)$/gm, '\u2022 $1');
      return e;
    }
    function summarize(name, result) {
      if (!result) return '';
      try { var j = JSON.parse(result); if (Array.isArray(j.events)) return j.events.length + ' events'; if (j.status) return String(j.status); if (j.total) return 'total ' + j.total; } catch (e) {}
      return (result.length > 60 ? result.slice(0, 57) + '\\u2026' : result).replace(/\\s+/g, ' ');
    }
    function addTool(ev) {
      // Same tool, same outcome, back to back (the model retrying a pending
      // checkout) → one line with a counter, not a column of identical boxes.
      var sig = ev.name + '|' + (ev.summary || '');
      var lastEl = log.lastElementChild;
      if (lastEl && lastEl.classList.contains('tool') && lastEl.getAttribute('data-sig') === sig) {
        var n = (Number(lastEl.getAttribute('data-n')) || 1) + 1;
        lastEl.setAttribute('data-n', String(n));
        var c = lastEl.querySelector('.tcount'); if (c) c.textContent = '\\u00d7' + n;
        return lastEl;
      }
      var d = document.createElement('div');
      d.className = 'msg tool';
      d.setAttribute('data-sig', sig); d.setAttribute('data-n', '1');
      var det = document.createElement('details');
      var sum = document.createElement('summary');
      sum.innerHTML = '<span class="tname"></span><span class="tsum"></span><span class="tcount"></span>';
      sum.querySelector('.tname').textContent = ev.name + '(' + (ev.args && ev.args !== '{}' ? '\\u2026' : '') + ')';
      sum.querySelector('.tsum').textContent = ev.result ? '\\u2192 ' + (ev.summary || summarize(ev.name, ev.result)) : '';
      var pre = document.createElement('pre');
      pre.textContent = (ev.args && ev.args !== '{}' ? 'args ' + ev.args + '\\n' : '') + (ev.result || '');
      det.appendChild(sum); det.appendChild(pre); d.appendChild(det);
      log.appendChild(d);
      return d;
    }
    var askCard = null;
    function addAsk(ev) {
      if (askCard && askCard.getAttribute('data-req') === (ev.request_id || '')) return askCard;
      var d = document.createElement('div');
      d.className = 'msg ask';
      d.setAttribute('data-req', ev.request_id || '');
      d.innerHTML = '<span class="ph"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></svg></span>'
        + '<span><b>Confirm in BotShield on your phone</b>' + (ev.text || '')
        + '<span class="wait"><i></i><i></i><i></i><span class="wtxt">Waiting for you \\u2014 take your time.</span></span>'
        + '<span class="links"><a data-cta="app" href="https://app.botshield.ai/app/agents-ask" target="_blank" rel="noopener">Open BotShield</a><a class="ghost" data-cta="app_signup" href="https://app.botshield.ai" target="_blank" rel="noopener">New here? Sign up</a></span>'
        + '</span>';
      log.appendChild(d); log.scrollTop = log.scrollHeight;
      askCard = d;
      if (window.bsTrack) bsTrack('agent_ask_sent');
      return d;
    }
    function addClosed(ev) {
      var d = document.createElement('div'); d.className = 'msg closed';
      if (window.bsTrack) bsTrack(/^(denied|declined)$/.test(String(ev.status || '')) ? 'agent_ask_denied' : 'agent_ask_expired');
      d.textContent = 'Purchase ' + (ev.status || 'closed') + (ev.text ? ' \\u2014 ' + ev.text : '') + '. Nothing was charged.';
      log.appendChild(d); log.scrollTop = log.scrollHeight;
    }
    // The page owns the wait: while a checkout is pending, re-ask the agent
    // every ~20s (each check itself waits on the server) until the card is
    // confirmed, declined or expired — up to the card's 10-minute TTL.
    // The card's expiry comes from the server (the partner's TTL policy) — the
    // page never assumes a number. Countdown + re-checks run until it passes.
    var waitTimer = null, waitChecks = 0, waitExpiresAt = 0, waitTick = null;
    function fmtLeft(ms) { var m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000); return m + ':' + (s < 10 ? '0' : '') + s; }
    function stopWaiting() {
      if (waitTimer) clearTimeout(waitTimer); waitTimer = null;
      if (waitTick) clearInterval(waitTick); waitTick = null;
      if (askCard) askCard.classList.add('done');
    }
    function paintWait() {
      var w = askCard && askCard.querySelector('.wtxt'); if (!w) return;
      var left = waitExpiresAt ? waitExpiresAt - Date.now() : 0;
      if (waitExpiresAt && left <= 0) { w.textContent = 'The card expired before you confirmed. Ask me again to send a new one.'; return; }
      w.textContent = (waitChecks ? 'Still waiting \\u2014 checked ' + waitChecks + '\\u00d7 \\u00b7 ' : 'Waiting for you \\u2014 ') + (waitExpiresAt ? fmtLeft(left) + ' left on the card' : 'take your time') + '.';
    }
    function scheduleCheck(reqId, expiresAt) {
      if (expiresAt) waitExpiresAt = Date.parse(expiresAt) || waitExpiresAt;
      if (!waitTick) waitTick = setInterval(paintWait, 1000);
      paintWait();
      if (waitTimer) return;
      if (waitExpiresAt && waitExpiresAt - Date.now() <= 0) { stopWaiting(); paintWait(); return; }
      waitTimer = setTimeout(function() {
        waitTimer = null; waitChecks++;
        ask('Check approval ' + reqId + ' again. If approved, finish the purchase; if still pending, say only "still pending"; if declined or expired, say so.', true);
      }, 20000);
    }
    function addOrder(ev) {
      var d = document.createElement('div');
      d.className = 'msg order';
      if (window.bsTrack) bsTrack('agent_ask_approved');
      narrate({ bs: 'step', n: 3 });
      // The point of the whole demo: a signature, not a card number.
      narrate({ bs: 'result', result: { label: 'What Ticketz received',
        value: 'Proof of Resolution',
        note: 'A signed record that a verified human approved this purchase. Ticketz never sees your card, and BotShield never sees the basket.' } });
      var rows = [['Order', ev.order_id], ['Event', ev.event], ['Seats', ev.seats], ['Total', ev.total]].filter(function(r) { return r[1] != null; });
      d.innerHTML = '<b>Order confirmed \\u2014 approved by you</b>' + rows.map(function(r) { return '<div class="row"><span>' + r[0] + '</span><span></span></div>'; }).join('') + (ev.approved_by ? '<div class="att">approved_by ' + ev.approved_by + (ev.ceremony_id ? ' \\u00b7 ceremony ' + ev.ceremony_id : '') + '</div>' : '');
      var spans = d.querySelectorAll('.row span:last-child');
      rows.forEach(function(r, i) { spans[i].textContent = String(r[1]); });
      log.appendChild(d); log.scrollTop = log.scrollHeight;
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

    async function ask(q, hidden) {
      if (!q || !live) return;
      if (!hidden) { add('user', q); stopWaiting(); waitExpiresAt = 0; waitChecks = 0; if (window.bsTrack) bsTrack('agent_chat_turn'); }
      turns.push({ role: 'user', content: q });
      input.value = '';
      send.disabled = true;
      var pending = document.createElement('div');
      pending.className = 'msg typing';
      if (hidden) pending.style.display = 'none';
      pending.innerHTML = '<i></i><i></i><i></i><small>Ticketz agent is working\\u2026</small>';
      log.appendChild(pending); log.scrollTop = log.scrollHeight;
      var tick = setTimeout(function() { pending.querySelector('small').textContent = 'Talking to Ticketz\\u2026'; }, 6000);
      var tick2 = setTimeout(function() { pending.querySelector('small').textContent = 'Waiting on a tool (this can take a bit)\\u2026'; }, 16000);
      try {
        var headers = { 'Content-Type': 'application/json' };
        if (bindToken) headers['Authorization'] = 'Bearer ' + bindToken;
        var r = await fetch('/api/agent/chat', { method: 'POST', headers: headers, body: JSON.stringify({ messages: turns }) });
        var j = await r.json();
        if (!r.ok) { clearTimeout(tick); clearTimeout(tick2); pending.className = 'msg sys'; pending.innerHTML = ''; pending.textContent = j.error || 'The agent could not answer.'; return; }
        clearTimeout(tick); clearTimeout(tick2); pending.remove();
        var spoke = false;
        var stillPending = hidden && j.awaiting && !(j.events || []).some(function(ev) { return ev.type === 'order' || ev.type === 'closed'; });
        (j.events || []).forEach(function(ev) {
          if (ev.type === 'text') { if (!stillPending) { add('agent', ev.text); spoke = true; } }
          else if (ev.type === 'tool') { if (!stillPending) addTool(ev); }
          else if (ev.type === 'ask') addAsk(ev);
          else if (ev.type === 'order') { stopWaiting(); addOrder(ev); }
          else if (ev.type === 'closed') { stopWaiting(); addClosed(ev); }
        });
        if (!spoke && !stillPending) add('agent', j.reply || '(no reply)');
        turns.push({ role: 'assistant', content: j.reply || '' });
        if (j.awaiting) { addAsk({ request_id: j.awaiting, text: 'The purchase is waiting for your confirmation.' }); scheduleCheck(j.awaiting, j.awaiting_expires_at); }
        setTimeout(function() { log.scrollTop = log.scrollHeight; }, 50);
      } catch (e) {
        clearTimeout(tick); clearTimeout(tick2);
        pending.className = 'msg sys'; pending.innerHTML = ''; pending.textContent = 'Network error \\u2014 try again.';
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
