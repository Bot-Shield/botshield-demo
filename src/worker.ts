export default {
  async fetch(): Promise<Response> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticketz - Checkout</title>
  <style>
    :root {
      --page-bg: #000000;
      --card-bg: #1a1a1a;
      --card-bg-alt: #0e0e0e;
      --card-border: #2a2a2a;
      --text-primary: #ffffff;
      --text-secondary: #9ca3af;
      --ticketz-purple: #7c3aed;
      --ticketz-purple-dark: #6d28d9;
      --timer-accent: #10b981;
      --verified-green: #16a34a;
      --radius: 12px;
    }

    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: var(--page-bg);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 0;
    }

    .page {
      width: 100%;
      max-width: 430px;
      min-height: 100vh;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Ticketz Header */
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 0;
    }

    .header-logo {
      width: 36px;
      height: 36px;
      background: var(--ticketz-purple);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-logo svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .header-brand {
      font-size: 22px;
      font-weight: 700;
      color: var(--ticketz-purple);
      letter-spacing: -0.5px;
    }

    /* Countdown Timer */
    .timer-bar {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .timer-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--timer-accent);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .timer-text {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .timer-text span {
      color: var(--timer-accent);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    /* Event Card */
    .event-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 16px;
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .event-art {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      flex-shrink: 0;
      object-fit: cover;
    }

    .event-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .event-artist {
      font-size: 18px;
      font-weight: 700;
    }

    .event-tour {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .event-venue {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .event-date {
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* Order Summary */
    .order-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 16px;
    }

    .order-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 14px;
    }

    .order-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 14px;
    }

    .order-row .label {
      color: var(--text-secondary);
    }

    .order-row .value {
      font-weight: 500;
    }

    .order-divider {
      border: none;
      border-top: 1px solid var(--card-border);
      margin: 10px 0;
    }

    .order-total .label,
    .order-total .value {
      color: var(--text-primary);
      font-size: 16px;
      font-weight: 700;
    }

    /* BotShield Widget Area */
    .botshield-area {
      background: var(--card-bg-alt);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-height: 64px;
    }

    /* Purchase Button */
    .purchase-btn {
      width: 100%;
      padding: 16px 24px;
      border: none;
      border-radius: var(--radius);
      background: linear-gradient(135deg, var(--ticketz-purple), var(--ticketz-purple-dark));
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      letter-spacing: -0.2px;
    }

    .purchase-btn:hover:not(:disabled) {
      opacity: 0.92;
    }

    .purchase-btn:active:not(:disabled) {
      transform: scale(0.985);
    }

    .purchase-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* Toast */
    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: var(--verified-green);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 1000;
      transition: transform 0.3s ease;
      white-space: nowrap;
    }

    .toast.show {
      transform: translateX(-50%) translateY(0);
    }

    /* Confirmation Overlay */
    .confirmation {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .confirmation.show {
      opacity: 1;
      pointer-events: auto;
    }

    .confirmation-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      max-width: 340px;
      width: 90%;
    }

    .confirmation-check {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--verified-green);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .confirmation-check svg {
      width: 28px;
      height: 28px;
      stroke: white;
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .confirmation h2 {
      font-size: 20px;
      margin-bottom: 6px;
    }

    .confirmation p {
      font-size: 14px;
      color: var(--text-secondary);
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-logo">
        <svg viewBox="0 0 24 24"><path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1a3 3 0 000 6v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a3 3 0 000-6V9z"/></svg>
      </div>
      <div class="header-brand">Ticketz</div>
    </div>

    <!-- Countdown Timer -->
    <div class="timer-bar">
      <div class="timer-dot"></div>
      <div class="timer-text">Complete purchase within <span id="countdown">7:32</span></div>
    </div>

    <!-- Event Card -->
    <div class="event-card">
      <img class="event-art" src="https://placehold.co/80x80/1a1a1a/ffffff?text=AF" alt="Arcade Fire" width="80" height="80">
      <div class="event-details">
        <div class="event-artist">Arcade Fire</div>
        <div class="event-tour">World Tour 2025</div>
        <div class="event-venue">Madison Square Garden</div>
        <div class="event-date">Sat, Aug 16 &bull; 8:00pm</div>
      </div>
    </div>

    <!-- Order Summary -->
    <div class="order-card">
      <div class="order-title">Order Summary</div>
      <div class="order-row">
        <span class="label">GA Floor x2</span>
        <span class="value">$195.00</span>
      </div>
      <div class="order-row">
        <span class="label">Service Fee</span>
        <span class="value">$38.90</span>
      </div>
      <hr class="order-divider">
      <div class="order-row order-total">
        <span class="label">Total</span>
        <span class="value">$428.50</span>
      </div>
    </div>

    <!-- BotShield Widget -->
    <div class="botshield-area">
      <botshield-verify site-key="pk_test_demo" theme="dark"></botshield-verify>
    </div>

    <!-- Purchase Button -->
    <button class="purchase-btn" id="purchaseBtn" disabled>Complete Purchase</button>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast">Human verified — you're good to go!</div>

  <!-- Confirmation Overlay -->
  <div class="confirmation" id="confirmation">
    <div class="confirmation-card">
      <div class="confirmation-check">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2>Purchase Complete!</h2>
      <p>Your tickets have been sent to your email. Enjoy the show!</p>
    </div>
  </div>

  <!-- BotShield SDK -->
  <script src="https://cdn.botshield.ai/sdk.js"></script>

  <script>
    // Countdown timer
    (function() {
      let total = 7 * 60 + 32;
      const el = document.getElementById('countdown');
      const tick = () => {
        if (total <= 0) return;
        total--;
        const m = Math.floor(total / 60);
        const s = String(total % 60).padStart(2, '0');
        el.textContent = m + ':' + s;
      };
      setInterval(tick, 1000);
    })();

    // BotShield success handler
    document.addEventListener('botshield:success', () => {
      const btn = document.getElementById('purchaseBtn');
      btn.disabled = false;

      const toast = document.getElementById('toast');
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    });

    // Purchase button
    document.getElementById('purchaseBtn').addEventListener('click', function() {
      if (this.disabled) return;
      document.getElementById('confirmation').classList.add('show');
    });

    // Dismiss confirmation
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
