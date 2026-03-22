export default {
  async fetch(): Promise<Response> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>Ticketz - Checkout</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 100%;
      height: 100%;
      background: #000000;
      color: #ffffff;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
    }

    /* ── Root container: full viewport, flex column, centered ── */
    .page {
      width: 100%;
      height: 100%;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 22px;
      padding: 16px;
      padding-top: env(safe-area-inset-top, 16px);
      padding-bottom: env(safe-area-inset-bottom, 16px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* ── Spacer: pushes content down from top ── */
    .top-spacer {
      flex-shrink: 0;
      height: 34px;
    }

    /* ── Header: Ticketz brand centered ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9.5px;
      flex-shrink: 0;
    }

    .header-logo {
      width: 31px;
      height: 31px;
      border-radius: 50%;
      background: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-logo svg { width: 16px; height: 16px; fill: white; }

    .header-brand {
      font-size: 19px;
      font-weight: 600;
      color: #ffffff;
      line-height: 28.7px;
    }

    /* ── Content section: timer + event + order grouped ── */
    .content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 22px;
      width: 100%;
      flex-shrink: 0;
    }

    /* ── Timer bar: orange accent ── */
    .timer-bar {
      background: rgba(255, 156, 102, 0.15);
      border: 1px solid rgba(255, 156, 102, 0.6);
      border-radius: 12px;
      padding: 17px 19px;
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      height: 58px;
    }

    .timer-icon { width: 24px; height: 24px; flex-shrink: 0; }

    .timer-text {
      flex: 1;
      font-size: 12px;
      font-weight: 400;
      color: #c9c9c9;
      line-height: 18px;
      padding-left: 12px;
    }

    .timer-countdown {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      line-height: 20px;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    /* ── Event card ── */
    .event-card {
      background: #1a1a1a;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      gap: 39px;
      align-items: flex-start;
      width: 100%;
    }

    .event-art {
      width: 72px;
      height: 74px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .event-details {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
      min-width: 0;
    }

    .event-artist {
      font-size: 18px;
      font-weight: 600;
      line-height: 28px;
      color: #ffffff;
    }

    .event-tour {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #ffffff;
    }

    .event-meta {
      display: flex;
      flex-direction: column;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      color: #959595;
    }

    /* ── Order summary ── */
    .order-card {
      background: #1a1a1a;
      border-radius: 8px;
      width: 100%;
      position: relative;
      padding: 25px 28px;
    }

    .order-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999999;
    }

    .order-row + .order-row { margin-top: 17px; }

    .order-row .qty {
      margin-right: 24px;
    }

    .order-divider {
      border: none;
      border-top: 1px solid #2a2a2a;
      margin: 26px 0 19px 0;
    }

    .order-total {
      font-size: 18px;
      font-weight: 600;
      line-height: 28px;
      color: #ffffff;
    }

    .order-total span { color: #ffffff; }

    /* ── BotShield widget ── */
    botshield-verify {
      display: block;
      width: 100%;
    }

    /* ── Actions: purchase button ── */
    .actions {
      width: 100%;
      flex-shrink: 0;
    }

    .purchase-btn {
      width: 100%;
      padding: 10px 16px;
      border: 2px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      background: #7f56d9;
      color: #ffffff;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      box-shadow:
        0px 1px 2px 0px rgba(10, 13, 18, 0.05),
        inset 0px -2px 0px 0px rgba(10, 13, 18, 0.05),
        inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18);
    }

    .purchase-btn:hover:not(:disabled) { opacity: 0.92; }
    .purchase-btn:active:not(:disabled) { transform: scale(0.985); }
    .purchase-btn:disabled { opacity: 0.30; cursor: not-allowed; }

    /* ── Toast ── */
    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: #16a34a;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      transition: transform 0.3s ease;
      white-space: nowrap;
    }
    .toast.show { transform: translateX(-50%) translateY(0); }

    /* ── Confirmation overlay ── */
    .confirmation {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .confirmation.show { opacity: 1; pointer-events: auto; }

    .confirmation-card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      max-width: 340px;
      width: 90%;
    }

    .confirmation-check {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: #16a34a;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .confirmation-check svg {
      width: 28px; height: 28px;
      stroke: white; fill: none;
      stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
    }

    .confirmation h2 { font-size: 20px; margin-bottom: 6px; }
    .confirmation p { font-size: 14px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="page">
    <!-- Top spacer (safe area) -->
    <div class="top-spacer"></div>

    <!-- Header -->
    <div class="header">
      <div class="header-logo">
        <svg viewBox="0 0 24 24"><path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1a3 3 0 000 6v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a3 3 0 000-6V9z"/></svg>
      </div>
      <div class="header-brand">Ticketz</div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Timer -->
      <div class="timer-bar">
        <svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="#c9c9c9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div class="timer-text">Complete purchase within</div>
        <div class="timer-countdown" id="countdown">7:32</div>
      </div>

      <!-- Event -->
      <div class="event-card">
        <div class="event-art" style="background: linear-gradient(135deg, #2a1a3e, #1a1a2e); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:700; color:#7c3aed;">AF</div>
        <div class="event-details">
          <div class="event-artist">Arcade Fire</div>
          <div class="event-tour">World Tour 2025</div>
          <div class="event-meta">
            <span>Madison Square Garden</span>
            <span>Sat, Aug 16 &bull; 8:00pm</span>
          </div>
        </div>
      </div>

      <!-- Order -->
      <div class="order-card">
        <div class="order-row">
          <span>GA Floor</span>
          <div><span class="qty">x2</span><span>$195.00</span></div>
        </div>
        <div class="order-row">
          <span>Service Fee</span>
          <span>$38.90</span>
        </div>
        <hr class="order-divider">
        <div class="order-row order-total">
          <span>Total</span>
          <span>$428.50</span>
        </div>
      </div>
    </div>

    <!-- BotShield Verify -->
    <botshield-verify
      id="bsVerify"
      theme="dark"
      scan-mode="modal"
      signals="true"
    ></botshield-verify>

    <!-- Purchase -->
    <div class="actions">
      <button class="purchase-btn" id="purchaseBtn" disabled>Complete Purchase</button>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast">Human verified — you're good to go!</div>

  <!-- Confirmation -->
  <div class="confirmation" id="confirmation">
    <div class="confirmation-card">
      <div class="confirmation-check">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2>Purchase Complete!</h2>
      <p>Your tickets have been sent to your email. Enjoy the show!</p>
    </div>
  </div>

  <!-- SDK -->
  <script src="https://cdn.botshield.ai/sdk.js"></script>

  <script>
    var params = new URLSearchParams(window.location.search);
    var SITE_KEY = params.get('site_key') || 'pk_test_405c955ab77e440ba0494ef45dc7b244';
    var SCOPE = params.get('scope') || 'checkout';
    var MODE = params.get('mode') || 'private';

    var bsVerify = document.getElementById('bsVerify');
    bsVerify.setAttribute('site-key', SITE_KEY);
    bsVerify.setAttribute('scope', SCOPE);
    bsVerify.setAttribute('mode', MODE);

    // Countdown (cosmetic)
    (function() {
      var total = 7 * 60 + 32;
      var el = document.getElementById('countdown');
      setInterval(function() {
        if (total <= 0) return;
        total--;
        el.textContent = Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
      }, 1000);
    })();

    // BotShield events
    bsVerify.addEventListener('botshield:success', function(e) {
      console.log('[Ticketz] BotShield verified:', e.detail);
      document.getElementById('purchaseBtn').disabled = false;
      var toast = document.getElementById('toast');
      toast.classList.add('show');
      setTimeout(function() { toast.classList.remove('show'); }, 3000);
    });

    bsVerify.addEventListener('botshield:failure', function(e) {
      console.error('[Ticketz] BotShield verification failed:', e.detail);
    });

    bsVerify.addEventListener('botshield:expired', function(e) {
      console.warn('[Ticketz] BotShield token expired:', e.detail);
      document.getElementById('purchaseBtn').disabled = true;
    });

    // Purchase
    document.getElementById('purchaseBtn').addEventListener('click', function() {
      if (this.disabled) return;
      document.getElementById('confirmation').classList.add('show');
    });

    document.getElementById('confirmation').addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('show');
    });
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
} satisfies ExportedHandler;
