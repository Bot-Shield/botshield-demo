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

    .event-artist { font-size: 18px; font-weight: 700; }
    .event-tour { font-size: 14px; color: var(--text-secondary); }
    .event-venue { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
    .event-date { font-size: 13px; color: var(--text-secondary); }

    /* Order Summary */
    .order-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 16px;
    }

    .order-title { font-size: 16px; font-weight: 600; margin-bottom: 14px; }

    .order-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 14px;
    }

    .order-row .label { color: var(--text-secondary); }
    .order-row .value { font-weight: 500; }

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

    /* BotShield Widget (custom — SDK A flow, not the web component) */
    .bs-widget {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 64px;
      padding: 15px 10px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: var(--card-bg-alt);
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      user-select: none;
    }

    .bs-widget:hover { border-color: #147baa; }
    .bs-widget.verified {
      background: rgba(5, 46, 35, 0.1);
      border-color: var(--verified-green);
      cursor: default;
    }
    .bs-widget.verifying { cursor: wait; }
    .bs-widget.failed {
      border-color: #ef4444;
      background: rgba(220,38,38,0.1);
      cursor: pointer;
    }

    .bs-left {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-left: 6px;
    }

    .bs-icon {
      width: 16px;
      height: 16px;
      color: #e5e7eb;
      display: flex;
      align-items: center;
    }

    .bs-label {
      font-size: 13px;
      font-weight: 500;
      color: #e5e7eb;
      white-space: nowrap;
    }

    .bs-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }

    .bs-brand-name {
      font-size: 9.5px;
      font-weight: 600;
      color: #e5e7eb;
    }

    .bs-brand-links {
      font-size: 6px;
      color: var(--text-secondary);
    }

    .bs-brand-links a { color: inherit; text-decoration: none; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .bs-spin { animation: spin 0.8s linear infinite; }

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
    }

    .purchase-btn:hover:not(:disabled) { opacity: 0.92; }
    .purchase-btn:active:not(:disabled) { transform: scale(0.985); }
    .purchase-btn:disabled { opacity: 0.45; cursor: not-allowed; }

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
    .toast.show { transform: translateX(-50%) translateY(0); }

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
    .confirmation.show { opacity: 1; pointer-events: auto; }

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
      width: 28px; height: 28px;
      stroke: white; fill: none;
      stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
    }

    .confirmation h2 { font-size: 20px; margin-bottom: 6px; }
    .confirmation p { font-size: 14px; color: var(--text-secondary); }
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

    <!-- BotShield Widget (SDK A verification flow) -->
    <div class="bs-widget" id="bsWidget" onclick="startVerification()">
      <div class="bs-left">
        <div class="bs-icon" id="bsIcon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.33L2.67 3.67V7.33C2.67 11.23 4.85 14.85 8 15.67C11.15 14.85 13.33 11.23 13.33 7.33V3.67L8 1.33Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="bs-label" id="bsLabel">Verify human presence</span>
      </div>
      <div class="bs-brand">
        <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
          <defs><linearGradient id="bg" x1="12" y1="1" x2="12" y2="25.5" gradientUnits="userSpaceOnUse"><stop stop-color="#1a9bd5"/><stop offset="1" stop-color="#0e6b96"/></linearGradient></defs>
          <path d="M12 1L2 5.5V12C2 18.35 6.27 24.27 12 25.5C17.73 24.27 22 18.35 22 12V5.5L12 1Z" stroke="url(#bg)" stroke-width="1.5" fill="none"/>
          <path d="M12 4.5L5.5 7.5V12C5.5 16.1 8.3 19.85 12 20.8C15.7 19.85 18.5 16.1 18.5 12V7.5L12 4.5Z" fill="rgba(20,123,170,0.12)" stroke="url(#bg)" stroke-width="0.8"/>
          <path d="M9 13L11 15L15 11" stroke="url(#bg)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="bs-brand-name">BotShield</div>
        <div class="bs-brand-links">
          <a href="https://botshield.ai/privacy" target="_blank">Privacy</a> &bull;
          <a href="https://botshield.ai/terms" target="_blank">Terms</a>
        </div>
      </div>
    </div>

    <!-- Site Key Indicator -->
    <div id="keyIndicator" style="font-size:11px; color:#6b7280; text-align:center; font-family:monospace;"></div>

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

  <script>
    // ================================================================
    // CONFIG — site key from ?site_key= URL param, or fallback
    // ================================================================
    var params = new URLSearchParams(window.location.search);
    var SITE_KEY = params.get('site_key') || 'pk_test_demo';
    var SCOPE = params.get('scope') || 'checkout.complete';
    var API_BASE = 'https://api.botshield.ai/operations';

    // Show which key + scope is active
    var keyEl = document.getElementById('keyIndicator');
    var info = [];
    if (params.get('site_key')) {
      info.push(SITE_KEY.slice(0, 20) + '...');
    } else {
      info.push('demo key (pass ?site_key=pk_test_...)');
      keyEl.style.color = '#ca8a04';
    }
    info.push('scope: ' + SCOPE);
    keyEl.textContent = info.join(' | ');

    // ================================================================
    // State
    // ================================================================
    var verifying = false;
    var activeReader = null;

    // ================================================================
    // Countdown timer (cosmetic)
    // ================================================================
    (function() {
      var total = 7 * 60 + 32;
      var el = document.getElementById('countdown');
      setInterval(function() {
        if (total <= 0) return;
        total--;
        var m = Math.floor(total / 60);
        var s = String(total % 60).padStart(2, '0');
        el.textContent = m + ':' + s;
      }, 1000);
    })();

    // ================================================================
    // Widget UI helpers
    // ================================================================
    var widget = document.getElementById('bsWidget');
    var label = document.getElementById('bsLabel');
    var icon = document.getElementById('bsIcon');

    function setWidgetState(state, text) {
      widget.className = 'bs-widget ' + state;
      label.textContent = text;
      if (state === 'verifying') {
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="bs-spin"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="8" stroke-linecap="round"/></svg>';
      } else if (state === 'verified') {
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      } else if (state === 'failed') {
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#dc2626" stroke-width="1.5"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/></svg>';
      } else {
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.33L2.67 3.67V7.33C2.67 11.23 4.85 14.85 8 15.67C11.15 14.85 13.33 11.23 13.33 7.33V3.67L8 1.33Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
    }

    // ================================================================
    // SDK A Verification Flow
    // (same as ClientSdkPlayground: create-session → create-verification-link → SSE)
    // ================================================================
    async function startVerification() {
      if (verifying) return;
      verifying = true;
      setWidgetState('verifying', 'Verifying...');

      try {
        // Step 1: Create session with site key
        var sessionRes = await fetch(API_BASE + '/sdk/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SITE_KEY,
          },
          body: JSON.stringify({
            partner_user_id: 'demo_' + crypto.randomUUID().slice(0, 8),
            metadata: { source: 'ticketz-demo' },
          }),
        });

        var sessionData = await sessionRes.json();
        if (!sessionRes.ok || sessionData?.data?.error) {
          var sessionErr = sessionData?.data?.error?.message || sessionData?.error?.message || 'Session failed: ' + sessionRes.status;
          throw new Error(sessionErr);
        }
        var session = sessionData.data?.data || sessionData.data;
        var sessionToken = session?.anchor_grant_token || session?.session_token;
        if (!sessionToken) throw new Error('No session token returned');

        // Step 2: Create verification link
        var linkRes = await fetch(API_BASE + '/sdk/create-verification-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionToken,
          },
          body: JSON.stringify({
            return_url: window.location.href,
            scope: SCOPE,
            sdk_type: 'signal',
            mode: 'private',
          }),
        });

        var linkData = await linkRes.json();
        if (linkData?.data?.error) {
          throw new Error(linkData.data.error.message || 'Verification link failed');
        }
        var link = linkData.data?.data || linkData.data;
        var requestId = link?.request_id;
        var webUrl = link?.web_url;

        if (!webUrl || !requestId) throw new Error('No verification link returned');

        // Step 3: Open verification in new tab (BotShield app for passkey)
        window.open(webUrl, '_blank');
        setWidgetState('verifying', 'Waiting for verification...');

        // Step 4: Subscribe to status via SSE
        subscribeStatus(requestId);

      } catch (err) {
        console.error('[BotShield]', err.message || err);
        setWidgetState('failed', 'Verification failed — click to retry');
        verifying = false;
      }
    }

    // ================================================================
    // SSE Status Subscription
    // ================================================================
    async function subscribeStatus(requestId) {
      var url = API_BASE.replace('/operations', '') + '/operations/verification/subscribe-status?request_id=' + encodeURIComponent(requestId);

      try {
        var response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'text/event-stream' },
        });

        if (!response.ok || !response.body) throw new Error('Stream failed');

        var reader = response.body.getReader();
        activeReader = reader;
        var decoder = new TextDecoder();
        var buffer = '';

        while (true) {
          var result = await reader.read();
          if (result.done) break;

          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\\n');
          buffer = lines.pop() || '';

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;
            try {
              var parsed;
              if (line.startsWith('data: ')) {
                parsed = JSON.parse(line.slice(6));
              } else {
                parsed = JSON.parse(line);
              }
              var data = parsed.data || parsed;

              if (data.heartbeat) continue;

              if (data.status === 'completed' || data.status === 'verified') {
                onVerified(data);
                reader.cancel();
                return;
              } else if (data.status === 'failed') {
                setWidgetState('failed', 'Verification failed — click to retry');
                verifying = false;
                reader.cancel();
                return;
              } else if (data.status === 'expired') {
                setWidgetState('failed', 'Verification expired — click to retry');
                verifying = false;
                reader.cancel();
                return;
              }
            } catch (e) { /* ignore parse errors */ }
          }
        }
      } catch (err) {
        console.error('[BotShield] SSE error:', err);
        setWidgetState('failed', 'Connection error — click to retry');
        verifying = false;
      } finally {
        activeReader = null;
      }
    }

    // ================================================================
    // Verified handler
    // ================================================================
    function onVerified(data) {
      setWidgetState('verified', 'Human presence verified');
      verifying = false;

      // Enable purchase button
      document.getElementById('purchaseBtn').disabled = false;

      // Show toast
      var toast = document.getElementById('toast');
      toast.classList.add('show');
      setTimeout(function() { toast.classList.remove('show'); }, 3000);
    }

    // ================================================================
    // Purchase button
    // ================================================================
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
