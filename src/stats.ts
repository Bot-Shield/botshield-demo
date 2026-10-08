// /stats?key=<STATS_KEY> — who is using the demos. Reads the Analytics Engine dataset written by
// src/analytics.ts through the SQL API, server-side (the token never reaches the browser).
// Locked: wrong / missing key → 404. Never cached, never indexed. Bots are excluded everywhere.

export interface StatsEnv {
  CF_ACCOUNT_ID?: string;
  CF_ANALYTICS_TOKEN?: string;
  STATS_KEY?: string;
}

const DATASET = 'botshield_demo_events';
const DEMOS: Array<[string, string]> = [
  ['ticketz', 'Ticketz · BotShield Gate'], ['agent', 'Ticketz · Agents Ask'], ['flights', 'Meridian Airlines · Agents Ask Pay'], ['trusted', 'Ticketz · Trusted Accounts'],
  ['vapez', 'Vapez · Age Gate'], ['signup', 'Commons · Sign-up Gate'], ['drop', 'Tread · Add-to-cart Gate'], ['firm', 'Whitlock & Barr · Enquiry Gate'],
  ['salesforce', 'Salesforce · Coral Cloud (click-out)'],
];

type Row = Record<string, string | number>;

async function sql(env: StatsEnv, query: string): Promise<Row[]> {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`, {
    method: 'POST', headers: { Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}` }, body: query,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`SQL API ${r.status}: ${text.slice(0, 160)}`);
  return (JSON.parse(text).data ?? []) as Row[];
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const n = (v: unknown) => Math.round(Number(v) || 0);
const fmt = (v: number) => v.toLocaleString('en-US');

function page(body: string, status = 200): Response {
  return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Demo usage — BotShield Demos</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#0b0c0e;--card:#0e0f12;--line:#1c1f24;--ink:#f5f5f6;--muted:#9a9ea6;--faint:#5f636b;--brand:#147baa;--ok:#00d492;--warn:#f79009;--bad:#f97066}
*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--ink);font-family:Inter,-apple-system,sans-serif;padding:28px 16px 48px;-webkit-font-smoothing:antialiased}
.w{max-width:1040px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
h1{font-size:22px;font-weight:700;letter-spacing:-.01em}.sub{font-family:'Roboto Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-top:6px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px}
.card h2{font-size:14px;font-weight:600;margin-bottom:12px}.note{font-size:12px;color:var(--faint);margin-top:10px}
table{width:100%;border-collapse:collapse;font-size:13.5px}th{font-family:'Roboto Mono',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);font-weight:500;text-align:right;padding:6px 8px;border-bottom:1px solid var(--line)}
th:first-child,td:first-child{text-align:left}td{padding:8px;border-bottom:1px solid #15171b;text-align:right;font-variant-numeric:tabular-nums}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px}
.fun{display:flex;flex-direction:column;gap:8px}.fr{display:grid;grid-template-columns:150px 1fr 56px;gap:10px;align-items:center;font-size:13px}
.bar{height:10px;border-radius:5px;background:#15191f;overflow:hidden}.bar i{display:block;height:100%;background:var(--brand)}.fr b{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.err{color:var(--bad);font-size:13.5px}svg text{fill:var(--faint);font-family:'Roboto Mono',monospace;font-size:9px}
.scroll{overflow-x:auto}
</style></head><body><div class="w">${body}</div></body></html>`, {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' },
  });
}

function funnel(title: string, steps: Array<[string, number]>, note = ''): string {
  const top = Math.max(1, ...steps.map((s) => s[1]));
  return `<div class="card"><h2>${esc(title)}</h2><div class="fun">${steps.map(([label, v]) =>
    `<div class="fr"><span>${esc(label)}</span><span class="bar"><i style="width:${Math.round((v / top) * 100)}%"></i></span><b>${fmt(v)}</b></div>`).join('')}</div>${note ? `<p class="note">${esc(note)}</p>` : ''}</div>`;
}

/** Daily demo views, stacked per demo, last 30 days, as an inline SVG. */
function dailyChart(rows: Row[]): string {
  const days: string[] = [];
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) days.push(new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10));
  const colors: Record<string, string> = { ticketz: '#147baa', agent: '#a884fa', flights: '#1a9fd6', trusted: '#00d492', vapez: '#f79009', signup: '#7dc0e4', drop: '#e879f9', firm: '#fbbf24' };
  const by: Record<string, Record<string, number>> = {};
  for (const r of rows) { const d = String(r.day).slice(0, 10); (by[d] ||= {})[String(r.demo)] = n(r.n); }
  const totals = days.map((d) => Object.values(by[d] || {}).reduce((a, b) => a + b, 0));
  const max = Math.max(1, ...totals);
  const W = 960, H = 160, pad = 24, bw = (W - pad) / days.length;
  const bars = days.map((d, i) => {
    let y = H - 16;
    return Object.keys(colors).map((k) => {
      const v = by[d]?.[k] || 0; if (!v) return '';
      const h = (v / max) * (H - 30); y -= h;
      return `<rect x="${pad + i * bw + 1}" y="${y.toFixed(1)}" width="${Math.max(1, bw - 2).toFixed(1)}" height="${h.toFixed(1)}" fill="${colors[k]}"><title>${d} · ${k}: ${v}</title></rect>`;
    }).join('');
  }).join('');
  const labels = days.map((d, i) => (i % 5 === 0 || i === days.length - 1) ? `<text x="${pad + i * bw}" y="${H - 2}">${d.slice(5)}</text>` : '').join('');
  const legend = Object.entries(colors).map(([k, c]) => `<span style="display:inline-flex;align-items:center;gap:6px;margin-right:14px;font-size:12px;color:var(--muted)"><i style="width:9px;height:9px;border-radius:2px;background:${c};display:inline-block"></i>${k}</span>`).join('');
  return `<div class="card"><h2>Demo views per day · last 30 days</h2><div class="scroll"><svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:600px" role="img" aria-label="Demo views per day">
<text x="0" y="12">${fmt(max)}</text><line x1="${pad}" y1="${H - 16}" x2="${W}" y2="${H - 16}" stroke="#23262c"/>${bars}${labels}</svg></div><div style="margin-top:8px">${legend}</div></div>`;
}

export async function statsPage(env: StatsEnv, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  if (!env.STATS_KEY || !timingSafeEqual(key, env.STATS_KEY)) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
  if (!env.CF_ACCOUNT_ID || !env.CF_ANALYTICS_TOKEN) {
    return page(`<h1>Demo usage</h1><div class="card"><p class="err">Stats not configured — set the CF_ACCOUNT_ID and CF_ANALYTICS_TOKEN Worker secrets.</p></div>`);
  }
  const notBot = `blob5 != 'bot'`;
  try {
    const [byEvent30, byEvent7, daily, countries, devices] = await Promise.all([
      sql(env, `SELECT blob2 AS demo, blob1 AS event, SUM(_sample_interval) AS n FROM ${DATASET} WHERE timestamp > NOW() - INTERVAL '30' DAY AND ${notBot} GROUP BY demo, event`),
      sql(env, `SELECT blob2 AS demo, blob1 AS event, SUM(_sample_interval) AS n FROM ${DATASET} WHERE timestamp > NOW() - INTERVAL '7' DAY AND ${notBot} GROUP BY demo, event`),
      sql(env, `SELECT toStartOfInterval(timestamp, INTERVAL '1' DAY) AS day, blob2 AS demo, SUM(_sample_interval) AS n FROM ${DATASET} WHERE timestamp > NOW() - INTERVAL '30' DAY AND blob1 = 'view' AND blob2 != 'shell' AND ${notBot} GROUP BY day, demo ORDER BY day`),
      sql(env, `SELECT blob4 AS country, SUM(_sample_interval) AS n FROM ${DATASET} WHERE timestamp > NOW() - INTERVAL '30' DAY AND blob1 = 'view' AND ${notBot} GROUP BY country ORDER BY n DESC LIMIT 10`),
      sql(env, `SELECT blob5 AS device, SUM(_sample_interval) AS n FROM ${DATASET} WHERE timestamp > NOW() - INTERVAL '30' DAY AND blob1 = 'view' GROUP BY device ORDER BY n DESC`),
    ]);
    const get = (rows: Row[], demo: string, event: string) => n(rows.find((r) => r.demo === demo && r.event === event)?.n);
    const v30 = (d: string) => (d === 'salesforce' ? get(byEvent30, 'salesforce', 'salesforce_click') : get(byEvent30, d, 'view'));
    const v7 = (d: string) => (d === 'salesforce' ? get(byEvent7, 'salesforce', 'salesforce_click') : get(byEvent7, d, 'view'));

    const totals = `<div class="card"><h2>Which demos people open</h2><table><thead><tr><th>Demo</th><th>7 days</th><th>30 days</th></tr></thead><tbody>
<tr><td>Demos home (shell)</td><td>${fmt(v7('shell'))}</td><td>${fmt(v30('shell'))}</td></tr>
${DEMOS.map(([k, label]) => `<tr><td>${esc(label)}</td><td>${fmt(v7(k))}</td><td>${fmt(v30(k))}</td></tr>`).join('')}
</tbody></table><p class="note">Page views (Salesforce = click-outs). Bots excluded. Cookieless: counts every visitor, including those who decline analytics cookies.</p></div>`;

    const agent = funnel('Agents Ask · 30 days', [
      ['Opened the demo', get(byEvent30, 'agent', 'view')],
      ['Started a link', get(byEvent30, 'agent', 'link_start')],
      ['QR shown', get(byEvent30, 'agent', 'qr_shown')],
      ['Linked BotShield ID', get(byEvent30, 'agent', 'link_bound')],
      ['Chat messages', get(byEvent30, 'agent', 'chat_turn')],
      ['Purchase asked', get(byEvent30, 'agent', 'ask_sent')],
      ['Approved', get(byEvent30, 'agent', 'ask_approved')],
      ['Denied', get(byEvent30, 'agent', 'ask_denied')],
      ['Expired', get(byEvent30, 'agent', 'ask_expired')],
    ], 'Event counts, not people (no ids are kept). Automatic re-checks while waiting for approval are not counted as chat messages.');

    const gate = (d: string, label: string) => funnel(`${label} · 30 days`, [
      ['Opened the demo', get(byEvent30, d, 'view')],
      ['Started verifying', get(byEvent30, d, 'verify_start')],
      ['Verified', get(byEvent30, d, 'verify_complete')],
      ['Unavailable', get(byEvent30, d, 'verify_unavailable')],
      ['Passed the gate', get(byEvent30, d, 'verify_checkout')],
    ]);
    const flights = funnel('Meridian · Agents Ask Pay · 30 days', [
      ['Opened the demo', get(byEvent30, 'flights', 'view')],
      ['Started a link', get(byEvent30, 'flights', 'link_start')],
      ['Linked BotShield ID', get(byEvent30, 'flights', 'link_bound')],
      ['Chat messages', get(byEvent30, 'flights', 'chat_turn')],
      ['Booking asked', get(byEvent30, 'flights', 'ask_sent')],
      ['Approved (card issued)', get(byEvent30, 'flights', 'ask_approved')],
      ['Issuer approved · paid', get(byEvent30, 'flights', 'paid')],
      ['Issuer declined', get(byEvent30, 'flights', 'charge_declined')],
      ['Denied / expired', get(byEvent30, 'flights', 'ask_denied') + get(byEvent30, 'flights', 'ask_expired')],
    ]);

    const countryCard = `<div class="card"><h2>Top countries · 30 days</h2><table><tbody>${countries.map((r) => `<tr><td>${esc(r.country || '—')}</td><td>${fmt(n(r.n))}</td></tr>`).join('') || '<tr><td>No data yet</td><td></td></tr>'}</tbody></table></div>`;
    const deviceCard = `<div class="card"><h2>Devices · 30 days</h2><table><tbody>${devices.map((r) => `<tr><td>${esc(r.device || '—')}</td><td>${fmt(n(r.n))}</td></tr>`).join('') || '<tr><td>No data yet</td><td></td></tr>'}</tbody></table><p class="note">"bot" rows are crawlers and monitors; they are left out of every other number.</p></div>`;

    return page(`<div><h1>Demo usage</h1><div class="sub">demo.botshield.ai · updated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</div></div>
${totals}${dailyChart(daily)}
<div class="grid">${agent}${flights}${gate('ticketz', 'Ticketz · BotShield Gate')}${gate('vapez', 'Vapez · Age Gate')}${gate('signup', 'Commons · Sign-up Gate')}${gate('drop', 'Tread · Add-to-cart Gate')}${gate('firm', 'Whitlock & Barr · Enquiry Gate')}${gate('trusted', 'Ticketz · Trusted Accounts')}</div>
<div class="grid">${countryCard}${deviceCard}${await clickOuts(env)}</div>`);
  } catch (e) {
    return page(`<h1>Demo usage</h1><div class="card"><p class="err">Could not read the stats: ${esc((e as Error).message)}</p></div>`, 502);
  }
}

async function clickOuts(env: StatsEnv): Promise<string> {
  const rows = await sql(env, `SELECT blob1 AS event, blob3 AS target, SUM(_sample_interval) AS n FROM ${DATASET} WHERE timestamp > NOW() - INTERVAL '30' DAY AND blob1 IN ('cta_click', 'salesforce_click') AND blob5 != 'bot' GROUP BY event, target ORDER BY n DESC`);
  const body = rows.map((r) => `<tr><td>${esc(r.event === 'salesforce_click' ? 'Salesforce demo' : r.target || '—')}</td><td>${fmt(n(r.n))}</td></tr>`).join('') || '<tr><td>No click-outs yet</td><td></td></tr>';
  return `<div class="card"><h2>Click-outs · 30 days</h2><table><tbody>${body}</tbody></table><p class="note">Docs, Console, botshield.ai and the BotShield app links; the Salesforce demo.</p></div>`;
}
