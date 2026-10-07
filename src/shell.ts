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
  /* What the run panel says beside this demo: the line it proves, and the
     steps to run it. Without this every demo inherits Ticketz's pitch. */
  /* `cta` only where the person genuinely has to go somewhere — the gates
     finish with a passkey on the device in their hand. */
  run?: { line: string; what: string; steps: string[]; cta?: { label: string; sub: string } };
}

export const DEMOS: DemoEntry[] = [
  { key: 'signup', group: 'Commons', label: 'Human Gate', hint: 'At sign-up \u00b7 one account per human', path: '/signup',
    run: {
      line: 'A feed is only worth reading if the people in it are people.',
      what: 'A script fills all four in a second, and again tomorrow under another name. The Gate is the one it cannot.',
      steps: [
        'Tap <b>Verify you\u2019re human</b>.',
        'A passkey answers it. No new account, no second password.',
        'You land in the feed. Every account in it is one person.',
      ],
    } },
  { key: 'vapez', group: 'Vapez', label: 'Age Gate', hint: 'At the door \u00b7 18+ to enter', path: '/vapez', platforms: ['iOS', 'Android'],
    run: {
      line: 'Proof of age without proof of identity.',
      what: 'The device already knows. Vapez receives <b>verified</b> or <b>unavailable</b> \u2014 never a birthdate, never a document.',
      steps: [
        'Tap <b>Verify you\u2019re over 18</b>.',
        'The device answers. No upload, no form.',
        'The store opens. No age on the device, and the door stays shut.',
      ],
    } },
  // Via the worker's /salesforce redirect so the click-out is counted (same destination).
  { key: 'agent', group: 'Ticketz', label: 'Agents Ask\u2122', hint: 'An agent asks, a human answers', path: '/agent',
    run: {
      line: 'The agent can ask. It cannot pay.',
      what: 'Claude runs the Ticketz tools through the BotShield gateway. It has no way to pay, so nothing starts without your yes.',
      steps: [
        'Tap <b>Link</b> and scan the code, or open the web app.',
        'Ask for tickets. It comes back with a request.',
        'Say yes with a passkey. Ticketz checks the signature, never your card.',
      ],
      cta: { label: 'Open BotShield', sub: 'You answer the request there' },
    } },
  { key: 'trusted', group: 'Ticketz', label: 'Trusted Accounts', hint: 'One account, secured with BotShield', path: '/trusted',
    run: {
      line: 'Signing in proves the password. It never proved the person.',
      what: 'Ticketz knows the address. It cannot tell whether these four are four people or one.',
      steps: [
        'Tap <b>Secure your account with BotShield</b>.',
        'A passkey confirms it. Ticketz gets a handle, not your name.',
        'Try a <b>second account</b>. One per person, so it is refused.',
      ],
      cta: { label: 'Open BotShield', sub: 'You confirm the account there' },
    } },
  { key: 'drop', group: 'Tread', label: 'Human Gate', hint: 'At add to cart \u00b7 one pair per person', path: '/drop',
    run: {
      line: 'Bots don\u2019t attack checkout. They attack add to cart.',
      what: '900 pairs, one each. Inventory is held at the cart, so that is where the drop is decided.',
      steps: [
        'Pick a size and tap <b>Add to cart</b>.',
        'A passkey answers it. No raffle, no queue, no account.',
        'The pair is held. Come back with a new account and card \u2014 the cart still says no.',
      ],
    } },
  { key: 'firm', group: 'Whitlock & Barr', label: 'Human Gate', hint: 'On the form that gets spammed', path: '/firm',
    run: {
      line: 'A person reads every enquiry. Now a person sends them too.',
      what: 'A solicitor reads every enquiry, so the junk is already being paid for \u2014 in someone\u2019s morning.',
      steps: [
        'The enquiry is written. Tap <b>Verify you\u2019re human</b>.',
        'A passkey answers it. No account, no password.',
        'It lands marked as a person. The next thousand fakes cost a human each.',
      ],
    } },
  { key: 'salesforce', group: 'Salesforce', label: 'Coral Cloud', hint: 'Agentforce + Flow on AppExchange', href: '/salesforce' },
];

export function shellHtml(): string {
  const groups: Record<string, DemoEntry[]> = {};
  for (const d of DEMOS) (groups[d.group] ||= []).push(d);
  const nav = Object.entries(groups).map(([group, items]) => `
      <div class="grp">
        <div class="grp-h">${group}</div>
        ${items.map((d) => d.href
          ? `<a class="it" data-key="${d.key}" data-cta="${d.key}" href="${d.href}" target="_blank" rel="noopener"><span class="it-l">${d.label}<span class="ext">&#8599;</span></span><span class="it-h">${d.hint}</span></a>`
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
    /* the filed mark sits small and high, never at label size */
    .tm { font-size: .62em; vertical-align: .5em; letter-spacing: 0; font-weight: 500; }
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
    .main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
    .top { display: none; }
    .crumb { display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 22px; border-bottom: 1px solid var(--line); font-family: 'Roboto Mono', monospace; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--faint); }
    .crumb b { color: var(--ink); font-weight: 500; }
    .crumb .sep { color: #33373f; }
    .crumb .right { margin-left: auto; text-transform: none; letter-spacing: 0; font-family: 'Inter', sans-serif; font-size: 12.5px; color: var(--muted); }
    /* Desktop: the demo runs in a phone-sized frame, centred — the same
       composition as the app's web rail. Phone: it IS the screen. */
    .frame { flex: 1; min-height: 0; background: var(--bg); display: flex; align-items: center; justify-content: center; gap: 28px; padding: 28px 24px; }
    /* The phone is the iframe. The sell lives beside it, where the real pixels are. */
    .runpanel { display: none; width: 360px; flex-shrink: 0; flex-direction: column; justify-content: center; gap: 18px;
                background: #0b0e12; border: 1px solid #373a41; border-radius: 20px; padding: 34px 30px; }
    .rp-mark { width: 88px; height: auto; aspect-ratio: 33 / 35.6743; flex: none; align-self: center; margin-bottom: 4px; }
    /* Names the demo you are in, so the panel answers "where am I" before
       it answers "what do I do". */
    .rp-eyebrow { align-self: center; font-family: 'Roboto Mono', monospace; font-size: 9px;
                  letter-spacing: .18em; text-transform: uppercase; color: var(--faint);
                  border: 1px solid #22262f; border-radius: 999px; padding: 6px 13px; margin: 0; }
    .rp-h { font-size: 29px; line-height: 33px; font-weight: 600; letter-spacing: -.9px; color: #fff;
            text-align: center; margin: 0; text-wrap: balance; }
    /* A measure, so the sell never runs the full width of the column. */
    .rp-s { font-size: 13.5px; line-height: 21px; color: #94979c; text-align: center; margin: 0 auto;
            max-width: 36ch; text-wrap: pretty; }
    .rp-steps { display: flex; flex-direction: column; gap: 15px; margin: 4px 0; padding-top: 22px; border-top: 1px solid #22262f; }
    .rp-steps .rp-k { font-family: 'Roboto Mono', monospace; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: #61656c; margin-bottom: 3px; }
    .rp-step { display: flex; gap: 12px; align-items: flex-start; font-size: 13px; line-height: 20px; color: #94979c; }
    .rp-step i { flex: none; width: 18px; height: 18px; border-radius: 50%; background: #1c2027; color: #e6e8ea;
                 font-family: 'Roboto Mono', monospace; font-size: 10px; font-style: normal; display: flex;
                 align-items: center; justify-content: center; margin-top: 1px; }
    .rp-step b { color: #e6e8ea; font-weight: 600; }
    /* The panel narrates: a step dims and ticks once the demo passes it. */
    .rp-step.done { color: #61656c; }
    .rp-step.done b { color: #61656c; font-weight: 400; }
    .rp-step.done i { background: #16302a; color: #23cb78; }
    .rp-step.now i { background: #1a9fd6; color: #fff; }
    .rp-result { display: none; margin-top: 2px; padding: 15px 16px; border-radius: 12px;
                 background: rgba(35,203,120,.08); border: 1px solid rgba(35,203,120,.35); }
    .rp-result.on { display: block; }
    .rp-result .k { font-family: 'Roboto Mono', monospace; font-size: 9px; letter-spacing: .14em;
                    text-transform: uppercase; color: #61656c; }
    .rp-result .v { font-family: 'Roboto Mono', monospace; font-size: 14px; color: #23cb78; margin-top: 5px; }
    .rp-result .n { font-size: 11.5px; line-height: 16px; color: #61656c; margin-top: 7px; }
    .rp-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
    /* The site's .btn and .btn.ghost — one button, the ghost just drops the ground. */
    .rp-primary, .rp-secondary { display: block; text-align: center; text-decoration: none; color: #fff;
                                 border: 1px solid #373a41; border-radius: 10px; padding: 14px 22px; font-size: 15px;
                                 font-weight: 600; line-height: 1; transition: border-color .15s, box-shadow .15s; }
    .rp-primary { background: linear-gradient(180deg, #16181b, #0e1013); }
    .rp-primary:hover, .rp-primary:active, .rp-secondary:hover, .rp-secondary:active {
      border-color: #1a9fd6; box-shadow: 0 0 0 1px rgba(26,159,214,.12), 0 0 22px -4px rgba(26,159,214,.5); }
    .rp-primary small { display: block; font-size: 10.5px; font-weight: 400; color: #94979c; margin-top: 4px; }
    .rail-col { display: none; flex-direction: column; width: 360px; flex-shrink: 0;
                max-height: 100%; overflow-y: auto; scrollbar-width: none; }
    .rail-col::-webkit-scrollbar { display: none; }
    @media (min-width: 1100px) { .rail-col { display: flex; } }
    .rp-trust { font-family: 'Roboto Mono', monospace; font-size: 8.5px; letter-spacing: .12em; text-transform: uppercase; color: #61656c; text-align: center; margin: 0; }
    @media (min-width: 1100px) { .runpanel { display: flex; width: 100%; } }

    /* The how-to drawer. On a phone the demo owns the screen and the
       instructions are raised on a tap, so neither competes with the other. */
    /* On a phone the crumb is hidden, so this strip does two jobs: it says which
       demo you are in, and it is the way into the how-to. */
    .rp-open { display: none; width: 100%; align-items: center; justify-content: space-between; gap: 12px;
               padding: 0 24px; height: 46px; flex-shrink: 0; background: var(--rail);
               border: 0; border-bottom: 1px solid var(--line); cursor: pointer;
               font-family: 'Roboto Mono', monospace; font-size: 10.5px; letter-spacing: .14em;
               text-transform: uppercase; color: var(--faint); text-align: left; }
    .rp-open .rpo-where { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rp-open .rpo-cta { display: inline-flex; align-items: center; gap: 7px; flex: none; color: #e6e8ea; }
    .rp-open .rpo-cta i { width: 6px; height: 6px; border-radius: 50%; background: #1a9fd6; display: block; }
    .rp-scrim { display: none; position: fixed; inset: 0; z-index: 55; background: rgba(0,0,0,.6);
                opacity: 0; transition: opacity .22s ease; pointer-events: none; }
    .rp-scrim.show { opacity: 1; pointer-events: auto; }
    .rp-grab { display: none; }

    @media (max-width: 1099px) {
      .rp-open { display: flex; }
      .rp-scrim { display: block; }
      .rail-col { display: contents; }
      /* the demo, full screen */
      .frame { flex-direction: column; align-items: stretch; justify-content: stretch; gap: 0; padding: 0; }
      .bezel { height: 100%; max-height: none; padding: 0; border: 0; border-radius: 0;
               box-shadow: none; background: transparent; width: 100%; }
      .frame iframe { width: 100%; height: 100%; max-height: none; border: 0; border-radius: 0; }
      /* the drawer */
      .runpanel { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 56;
                  width: 100%; border-radius: 22px 22px 0 0; border-left: 0; border-right: 0; border-bottom: 0;
                  max-height: 86dvh; overflow-y: auto; -webkit-overflow-scrolling: touch;
                  padding: 14px 24px calc(env(safe-area-inset-bottom, 0px) + 80px);
                  transform: translateY(101%); transition: transform .26s cubic-bezier(.32,.72,0,1); }
      .runpanel.open { transform: none; }
      .rp-grab { display: block; width: 38px; height: 4px; border-radius: 2px; background: #373a41;
                 margin: 0 auto 10px; flex: none; }
      .rp-mark { width: 72px; }
      .rp-h { font-size: 24px; line-height: 28px; letter-spacing: -.6px; }
      /* the strip above already says which demo this is */
      .rp-eyebrow { display: none; }
    }
    @media (prefers-reduced-motion: reduce) { .runpanel, .rp-scrim { transition: none; } }
    .bezel { flex-shrink: 0; height: 100%; max-height: 900px; padding: 11px; border-radius: 42px; background: #15181c;
             border: 1.5px solid #454a52; box-shadow: 0 28px 64px -10px rgba(0,0,0,.7); box-sizing: border-box; display: flex; }
    .frame iframe { width: 430px; max-width: 100%; height: 100%; border: 1px solid #23262c; border-radius: 32px; display: block; background: #08090b; }

    @media (max-width: 767px) {
      .app { grid-template-columns: 1fr; }
      /* Open, this is the site's own menu (botshield.ai .menu/.grp): big items,
         mono group labels, air. The cramped desktop rail stays on desktop. */
      .rail { position: fixed; inset: 0; z-index: 50; transform: translateX(-100%); transition: transform .22s ease;
              background: var(--bg); border-right: 0; gap: 0;
              padding: calc(env(safe-area-inset-top, 0px) + 78px) 28px calc(env(safe-area-inset-bottom, 0px) + 40px); }
      .rail.open { transform: none; }
      .rail .brand { display: none; }
      .rail .grp { padding-top: 0; margin-bottom: 22px; }
      .rail .grp-h { font-size: 10px; letter-spacing: .18em; color: var(--faint); padding: 0 0 10px; }
      .rail .it { display: block; padding: 8px 0; border: 0; background: none; border-radius: 0; }
      .rail .it:hover { background: none; }
      .rail .it.on { background: none; }
      .rail .it-l { font-size: 20px; font-weight: 600; color: var(--muted); }
      .rail .it.on .it-l { color: var(--ink); }
      /* Three rows read "Human Gate" — the hint is the only thing that tells
         them apart, so it is load-bearing here, not decoration. */
      .rail .it-h { display: block; font-size: 13px; line-height: 1.35; color: var(--faint); margin-top: 2px; }
      .rail .spacer { display: none; }
      .rail .foot { margin-top: 10px; padding-top: 22px; }
      .rail .foot a { font-size: 15px; padding: 7px 0; }
      .rail .pill { margin: 10px 0 0; }
      /* The run-panel pill must not sit on top of the open menu. */
      /* The site's own header, to the letter (botshield.ai .topbar/.mlogo/.burger).
         The only change: the word is Demo, and the mark carries BotShield. */
      .top { display: flex; align-items: center; justify-content: space-between; gap: 16px;
             height: calc(env(safe-area-inset-top, 0px) + 64px); padding: env(safe-area-inset-top, 0px) 24px 0;
             background: rgba(10, 11, 13, .82); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
             border-bottom: 1px solid rgba(255, 255, 255, .07); }
      .top .logo { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 17px; color: #f4f5f7; white-space: nowrap; }
      .tb-mark { width: 26px; height: auto; flex: none; }
      .top .menu { display: flex; flex-direction: column; gap: 4px; padding: 8px; background: none; border: 0; cursor: pointer; }
      .top .menu span { width: 22px; height: 2px; background: #f4f5f7; border-radius: 2px; display: block; }
      .crumb { display: none; }
      .frame { padding: 16px 0 0; gap: 16px; }
      .bezel { padding: 0; border: 0; border-radius: 0; box-shadow: none; background: transparent; max-height: none; width: 100%; }
      /* The demo still owns the first screen; the sell sits one scroll below. */
      .frame iframe { width: 100%; height: calc(100dvh - 52px - env(safe-area-inset-top, 0px)); max-height: none; border: 0; border-radius: 0; box-shadow: none; }
      .runpanel { border-radius: 0; border-left: 0; border-right: 0; max-width: none; padding-left: 20px; padding-right: 20px; }
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
        <a data-cta="docs" href="https://docs.botshield.ai" target="_blank" rel="noopener">Documentation &#8599;</a>
        <a data-cta="console" href="https://console.botshield.ai" target="_blank" rel="noopener">Partner Console &#8599;</a>
        <a data-cta="botshield" href="https://botshield.ai" target="_blank" rel="noopener">botshield.ai &#8599;</a>
        <a data-cta="pricing" href="https://botshield.ai/pricing" target="_blank" rel="noopener">Pricing &#8599;</a>
        <a href="#" data-cookie-settings>Cookie settings</a>
        <span class="pill">Live on production</span>
      </div>
    </nav>
    <div class="main">
      <div class="top">
        <div class="logo"><svg class="tb-mark" viewBox="0 0 150 163" fill="none" aria-hidden="true"><path d="M147.597 30.2247C147.5 29.7539 147.288 29.3145 146.979 28.9457C146.671 28.5768 146.277 28.2899 145.831 28.1106L76.0714 0.19552C75.3809 -0.0651734 74.6191 -0.0651734 73.9286 0.19552L4.16945 28.1106C3.72348 28.2899 3.32881 28.5768 3.02062 28.9457C2.71243 29.3145 2.50029 29.7539 2.40311 30.2247C-9.17993 84.5204 22.0944 141.654 75 162.156C127.906 141.683 159.18 84.5204 147.597 30.2247ZM75 147.677C31.5345 131.084 5.84927 84.0569 15.3183 39.5199C15.4198 39.051 15.6335 38.6137 15.9412 38.2455C16.2488 37.8773 16.6412 37.5893 17.0846 37.4061L73.9286 14.6745C74.6191 14.4138 75.3809 14.4138 76.0714 14.6745L132.915 37.4062C133.359 37.5894 133.751 37.8775 134.059 38.2456C134.367 38.6138 134.58 39.0511 134.682 39.5201C144.151 84.0569 118.466 131.084 75 147.677Z" fill="url(#paint0_tb)"/>
<path d="M74.915 40.7707C77.7023 40.7707 79.9619 42.7078 79.9619 45.0969C79.9618 46.8223 78.783 48.3108 77.0781 49.0051V53.7482H80.8857C83.0961 53.7482 84.8877 55.5408 84.8877 57.7512C84.8877 57.8603 84.8826 57.9684 84.874 58.0754H88.6143C98.361 58.0755 106.695 64.1205 110.075 72.6652C110.372 72.6104 110.678 72.5803 110.991 72.5803C113.763 72.5803 116.011 74.8278 116.011 77.5998C116.011 80.1522 114.105 82.2574 111.64 82.5754C110.902 94.6517 100.876 104.218 88.6143 104.218H61.2168C48.9548 104.218 38.9282 94.6518 38.1904 82.5754C35.7252 82.2569 33.8203 80.1518 33.8203 77.5998C33.8204 74.8278 36.0678 72.5803 38.8398 72.5803C39.1524 72.5803 39.4581 72.6105 39.7549 72.6652C43.1346 64.1202 51.4698 58.0755 61.2168 58.0754H65.1387C65.1301 57.9684 65.125 57.8603 65.125 57.7512C65.125 55.5408 66.9166 53.7482 69.127 53.7482H72.752V49.0051C71.0475 48.3107 69.8693 46.8221 69.8691 45.0969C69.8691 42.7079 72.128 40.7709 74.915 40.7707ZM60.4961 69.6096C53.7273 69.6099 48.2404 75.0976 48.2402 81.8664C48.2403 88.6353 53.7272 94.1229 60.4961 94.1232H89.3359C96.1048 94.123 101.592 88.6353 101.592 81.8664C101.592 75.0975 96.1048 69.6098 89.3359 69.6096H60.4961ZM63.2266 78.2609C65.1324 78.2609 66.6777 79.8063 66.6777 81.7121C66.6776 83.6178 65.1323 85.1623 63.2266 85.1623C61.321 85.1621 59.7765 83.6177 59.7764 81.7121C59.7764 79.8064 61.3209 78.2611 63.2266 78.2609ZM86.7549 78.2609C88.6605 78.2611 90.2051 79.8064 90.2051 81.7121C90.205 83.6177 88.6605 85.1621 86.7549 85.1623C84.8491 85.1623 83.3038 83.6178 83.3037 81.7121C83.3037 79.8063 84.8491 78.2609 86.7549 78.2609Z" fill="url(#paint1_tb)"/>
<defs>
<linearGradient id="paint0_tb" x1="137.232" y1="162.811" x2="129.859" y2="-28.35" gradientUnits="userSpaceOnUse">
<stop stop-color="#0F5E82"/>
<stop offset="0.163462" stop-color="#0F5E82"/>
<stop offset="0.509615" stop-color="#147BAA"/>
<stop offset="1" stop-color="#147BAA"/>
</linearGradient>
<linearGradient id="paint1_tb" x1="109.015" y1="104.474" x2="106.953" y2="29.6236" gradientUnits="userSpaceOnUse">
<stop stop-color="#0F5E82"/>
<stop offset="0.163462" stop-color="#0F5E82"/>
<stop offset="0.509615" stop-color="#147BAA"/>
<stop offset="1" stop-color="#147BAA"/>
</linearGradient>
</defs></svg> BotShield Demos</div>
        <button type="button" class="menu" id="menu" aria-label="Open menu"><span></span><span></span><span></span></button>
      </div>
      <button type="button" class="rp-open" id="rpOpen" aria-controls="runpanel" aria-expanded="false">
        <span class="rpo-where" id="rpoWhere"></span>
        <span class="rpo-cta"><i></i>How this works</span>
      </button>
      <div class="crumb"><span>Demos</span><span class="sep">&middot;</span><b id="crumbGroup"></b><span class="sep">&middot;</span><span id="crumbLabel"></span><span class="right" id="crumbHint"></span></div>
      <div class="frame">
        <div class="rp-scrim" id="rpScrim"></div>
        <div class="rail-col">
        <aside class="runpanel" id="runpanel" aria-label="Run this demo">
          <span class="rp-grab" aria-hidden="true"></span>
          <svg class="rp-mark" aria-hidden="true" viewBox="0 0 33 35.6743" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="Group"> <path id="Vector" d="M32.4713 6.64943C32.4499 6.54586 32.4033 6.4492 32.3355 6.36805C32.2677 6.28689 32.1808 6.22378 32.0827 6.18433L16.7357 0.0430144C16.5838 -0.0143381 16.4162 -0.0143381 16.2643 0.0430144L0.91728 6.18433C0.819167 6.22378 0.73234 6.28689 0.664537 6.36805C0.596735 6.4492 0.550064 6.54586 0.528686 6.64943C-2.01959 18.5945 4.86076 31.1638 16.5 35.6743C28.1392 31.1702 35.0196 18.5945 32.4713 6.64943ZM16.5 32.4889C6.93759 28.8385 1.28684 18.4925 3.37002 8.69438C3.39235 8.59122 3.43938 8.49501 3.50706 8.41401C3.57474 8.33301 3.66106 8.26964 3.75862 8.22934L16.2643 3.22839C16.4162 3.17104 16.5838 3.17104 16.7357 3.22839L29.2414 8.22937C29.339 8.26968 29.4253 8.33304 29.493 8.41404C29.5606 8.49504 29.6077 8.59125 29.63 8.69441C31.7132 18.4925 26.0624 28.8385 16.5 32.4889Z" fill="#1A9FD6"/> <path id="Vector_2" d="M13.91 17.2172C14.329 17.2174 14.6691 17.5573 14.6691 17.9764C14.6691 18.3955 14.3291 18.7353 13.91 18.7355C13.4907 18.7355 13.1508 18.3956 13.1508 17.9764C13.1509 17.5571 13.4907 17.2172 13.91 17.2172Z" fill="#1A9FD6"/> <path id="Vector_3" d="M19.0853 17.2172C19.5046 17.2172 19.8445 17.5571 19.8445 17.9764C19.8445 18.3956 19.5046 18.7355 19.0853 18.7355C18.6662 18.7354 18.3262 18.3956 18.3262 17.9764C18.3262 17.5572 18.6662 17.2174 19.0853 17.2172Z" fill="#1A9FD6"/> <path id="Vector_4" fill-rule="evenodd" clip-rule="evenodd" d="M16.4811 8.96938C17.0943 8.96941 17.5912 9.39546 17.5912 9.92102C17.5912 10.3007 17.3316 10.6277 16.9565 10.7804V11.8243H17.7944C18.2807 11.8243 18.6753 12.2189 18.6753 12.7052C18.6753 12.7293 18.6737 12.7532 18.6717 12.7768H19.4945C21.6385 12.7768 23.4703 14.1068 24.2142 15.9863C24.28 15.974 24.348 15.9675 24.4174 15.9675C25.0272 15.9675 25.5221 16.4623 25.5221 17.0722C25.5219 17.6337 25.1023 18.0955 24.5597 18.1653C24.3979 20.8226 22.1925 22.9279 19.4945 22.9279H13.4677C10.7697 22.9279 8.56335 20.8226 8.40158 18.1653C7.85937 18.0952 7.44026 17.6334 7.44009 17.0722C7.44009 16.4625 7.93426 15.9677 8.54392 15.9675C8.6132 15.9675 8.6814 15.9741 8.74714 15.9863C9.49094 14.1066 11.3236 12.7768 13.4677 12.7768H14.3307C14.3288 12.7532 14.3272 12.7293 14.3272 12.7052C14.3272 12.2191 14.7211 11.8245 15.2072 11.8243H16.0048V10.7796C15.6302 10.6267 15.371 10.3004 15.371 9.92102C15.371 9.39544 15.8679 8.96938 16.4811 8.96938ZM13.3093 15.3148C11.8201 15.3148 10.6128 16.5221 10.6128 18.0113C10.6132 19.5001 11.8203 20.7068 13.3093 20.7068H19.6538C21.1426 20.7067 22.3498 19.5 22.3503 18.0113C22.3503 16.5222 21.1429 15.315 19.6538 15.3148H13.3093Z" fill="#1A9FD6"/> </g> </svg>
          <p class="rp-eyebrow" id="rpEyebrow"></p>
          <h2 class="rp-h" id="rpH">Live Demo is Ready</h2>
          <p class="rp-s" id="rpS"></p>
          <div class="rp-steps" id="rpSteps"></div>
          <div class="rp-result" id="rpResult"></div>
          <div class="rp-actions" id="rpActions"></div>
          <p class="rp-trust">Built on passkeys &middot; FIDO Alliance member</p>
        </aside>
        </div>
        <div class="bezel"><iframe id="frame" title="Selected demo" allow="publickey-credentials-get *; publickey-credentials-create *; clipboard-write"></iframe></div>
      </div>
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
      var vp = (window.innerWidth < 1024) ? 'm=1' : 'm=0';
      if (frame.getAttribute('data-key') !== d.key) {
        frame.src = d.path + '?' + ((qs ? qs + '&' : '') + vp);
        frame.setAttribute('data-key', d.key);
      }
      var rpH = document.getElementById('rpH'), rpS = document.getElementById('rpS'), rpSteps = document.getElementById('rpSteps');
      document.getElementById('rpEyebrow').textContent = d.group + ' \u00b7 ' + d.label;
      document.getElementById('rpoWhere').textContent = d.group + ' \u00b7 ' + d.label;
      if (d.run) {
        rpH.textContent = d.run.line;
        rpS.innerHTML = d.run.what;
        rpSteps.innerHTML = '<div class="rp-k">How to run it</div>' + d.run.steps.map(function(t, i) {
          return '<div class="rp-step"><i>' + (i + 1) + '</i><div>' + t + '</div></div>';
        }).join('');
        var acts = document.getElementById('rpActions');
        acts.innerHTML = d.run.cta
          ? '<a class="rp-primary" href="https://app.botshield.ai" target="_blank" rel="noopener">' +
            d.run.cta.label + '<small>' + d.run.cta.sub + '</small></a>'
          : '';
        rpSteps.style.display = '';
        markStep(0);
        showResult(null);
        setDrawer(false);
      } else {
        rpH.textContent = 'Live Demo is Ready';
        rpS.textContent = 'Open the web app and a passkey answers the check, right in the browser.';
        document.getElementById('rpActions').innerHTML = '';
        rpSteps.style.display = 'none';
      }
      document.getElementById('crumbGroup').textContent = d.group;
      document.getElementById('crumbLabel').textContent = d.label;
      document.getElementById('crumbHint').textContent = d.hint;
      document.title = d.group + ' \\u00b7 ' + d.label + ' \\u2014 BotShield Demos';
      if (push && window.location.hash !== '#' + d.key) history.replaceState(null, '', '#' + d.key);
      setMenu(false);
    }
    Array.prototype.forEach.call(document.querySelectorAll('.it[href^="#"]'), function(a) {
      a.addEventListener('click', function(e) { e.preventDefault(); pick(a.getAttribute('data-key'), true); });
    });
    function setMenu(open) {
      rail.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    }
    document.getElementById('menu').addEventListener('click', function() { setMenu(true); });
    document.getElementById('close').addEventListener('click', function() { setMenu(false); });
    window.addEventListener('hashchange', function() { pick(window.location.hash.slice(1), false); });

    // The demo inside the iframe reports where it has got to, so the panel
    // beside it stops being a manual and becomes the commentary.
    function markStep(n) {
      var rows = document.querySelectorAll('#rpSteps .rp-step');
      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.toggle('done', i < n);
        rows[i].classList.toggle('now', i === n);
        var num = rows[i].querySelector('i');
        if (num) num.textContent = i < n ? '\u2713' : String(i + 1);
      }
    }
    function showResult(r) {
      var el = document.getElementById('rpResult');
      if (!r) { el.classList.remove('on'); el.innerHTML = ''; return; }
      el.innerHTML = '<div class="k">' + r.label + '</div><div class="v">' + r.value + '</div>' +
                     (r.note ? '<div class="n">' + r.note + '</div>' : '');
      el.classList.add('on');
    }
    // The drawer lives in the shell: only it sees the real viewport and only it
    // can cover the demo. Closed by default so the demo owns the first screen.
    var panel = document.getElementById('runpanel');
    var scrim = document.getElementById('rpScrim');
    var opener = document.getElementById('rpOpen');
    function setDrawer(open) {
      panel.classList.toggle('open', open);
      scrim.classList.toggle('show', open);
      opener.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    opener.addEventListener('click', function() { setDrawer(!panel.classList.contains('open')); });
    scrim.addEventListener('click', function() { setDrawer(false); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') setDrawer(false); });

    window.addEventListener('message', function(e) {
      if (e.source !== frame.contentWindow) return;      // only the demo we are showing
      var d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.bs === 'step') markStep(d.n);
      else if (d.bs === 'result') showResult(d.result);
      else if (d.bs === 'reset') { markStep(0); showResult(null); }
    });
    // Same origin, so set the flag directly. Reloading the iframe would wipe the chat.
    function syncViewport() {
      var m = window.innerWidth < 1024;
      try {
        var d = frame.contentDocument;
        if (d && d.documentElement) d.documentElement.classList.toggle('is-mobile', m);
      } catch (e) {}
      frame.setAttribute('data-vp', m ? 'm=1' : 'm=0');
    }
    window.addEventListener('resize', syncViewport);
    frame.addEventListener('load', syncViewport);
    var initial = (new URLSearchParams(window.location.search).get('demo')) || window.location.hash.slice(1) || DEMOS[0].key;
    pick(initial, true);
  </script>
</body>
</html>`;
}
