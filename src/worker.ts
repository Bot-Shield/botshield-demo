// demo.botshield.ai — BotShield Demos.
//
//   /            the Demos shell (rail + framed demo; #key selects one)
//   /ticketz     Ticketz · BotShield Gate at checkout (Human Gate, inline passkey beta)
//   /agent       Ticketz · Agents Ask (chat with the Ticketz agent; purchases wait for the human)
//   /flights     Meridian Airlines · Agents Ask Pay (the card issuer asks BotShield before the charge)
//   /trusted     Ticketz · Trusted Accounts (secure the account with a BotShield ID; ticketz_account gate, notarize)
//   /vapez       Vapez · Age Gate at the door (enter_site_age_check, 18+)
//   /salesforce  → Coral Cloud on salesforce-demo.botshield.ai (counted as a click-out)
//   /api/e       same-origin analytics beacon (allowlisted browser steps; src/analytics.ts)
//   /stats       demo usage dashboard (?key=STATS_KEY; src/stats.ts)
//   /api/agent/* and /api/flights/* — the chat pages' only backend: health · Link ceremony passthrough ·
//                chat = Claude (Messages API, MCP connector → the demo gateway's /mcp,
//                the visitor's bind JWT as the connector bearer). Unset → 503, and the
//                page says the agent is not connected. No fake replies.
//
// Every demo page runs against PRODUCTION (cdn.botshield.ai + the prod Ticketz
// site key); the gates are the ones in the Ticketz org's Console.
import { ticketzHtml } from './pages/ticketz';
import { vapezHtml } from './pages/vapez';
import { agentHtml, flightsHtml } from './pages/agent';
import { trustedHtml } from './pages/trusted';
import { signupHtml } from './pages/signup';
import { dropHtml } from './pages/drop';
import { firmHtml } from './pages/firm';
import { shellHtml } from './shell';
import { FAVICON_ICO_B64 } from './favicon';
import { OG_PNG_B64 } from './og';
import qrcode from 'qrcode-generator';
import { record, beacon, withAnalytics, type AnalyticsEnv } from './analytics';
import { statsPage, type StatsEnv } from './stats';

const APP_URL = 'https://app.botshield.ai';

interface Env extends AnalyticsEnv, StatsEnv {
  AGENT_GATEWAY_URL?: string;  // https://gateway-demo.botshield.ai — MCP at /mcp, Link ceremony at /oauth/link/*
  MERIDIAN_GATEWAY_URL?: string; // https://gateway-meridian.botshield.ai — same shape, the Meridian Airlines target
  ANTHROPIC_API_KEY?: string;  // secret — the demo's own Claude key (the agent runs here, tools run behind the gateway)
  AGENT_MODEL?: string;        // default claude-opus-5
}

const SALESFORCE_DEMO = 'https://salesforce-demo.botshield.ai';

const html = (body: string) => new Response(body, {
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    // Demo pages are framed by the shell on this origin only.
    'Content-Security-Policy': "frame-ancestors 'self'",
  },
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const SYSTEM = `You are the Ticketz agent. You help people find shows and buy tickets.

WHAT YOU ALWAYS DO
- You always go for the lowest price available unless the person asks for something else.
- Say which one you picked and that it is the cheapest, in one short line. Example: "Cheapest is Coral Bay, Sat 13 Mar, $89.50 each."
- Never present a long menu of options when one is clearly cheapest. Pick it, say why, and offer to buy it.

HOW YOU WRITE
- Two or three short sentences. Never a wall of text.
- No markdown tables, headings or bold. For events, one line each: "Coral Bay Music Festival — Sat 13 Mar — from $89.50".
- Plain language. No exclamation marks, no filler, no "Great question".

NEVER NARRATE YOURSELF
- Never mention tools, tool names, retries, errors, or what you can and cannot call.
- Never correct or apologise for your own earlier message. If you were wrong, just say the right thing once.
- Never explain why something did not work. Say what happens next instead.
- Never tell the person to tap a button or point at parts of the page. The page handles itself.

BOTSHIELD — BE SHORTEST AND SUREST HERE
This is the part people are watching. Be calm and plain, never technical, never apologetic.
- You have no card and no way to pay. You cannot buy anything. What you can do is send the request to the person's phone; their yes is what makes the purchase happen.
- NEVER say a request has gone to the person's phone unless a tool call has actually returned one. If you have no tool that can send it, you have not sent it, and saying so is the one thing that breaks this. Say instead: "I can find shows and hold seats, but I can't send a purchase to your phone yet." Then STOP.
- When a tool HAS returned the request, say exactly one line, for example: "Sent to your phone — say yes there and I'll finish up." Then STOP. Do not call checkout again. The page waits and continues for you.
- When it comes back approved, confirm in one line with the order and the total.
- If they have not linked with BotShield yet, say one line: "I can't send a purchase to you until you link with BotShield." Nothing more — do not explain how, do not describe the button.
- Never say: Proof of Resolution, gateway, MCP, token, signature, approval_sent, "not available to me", "attached", or any internal name. The person does not need them and they make a simple thing sound complicated.

If you are unsure, ask one short question.`;

const MERIDIAN_SYSTEM = `You are the Meridian Airlines agent. You help people find a fare, hold it, and pay for it.

WHAT YOU ALWAYS DO
- You always go for the lowest fare unless the person asks for something else. Say which one you picked and that it is the cheapest, in one short line. Example: "Cheapest is MA 212, Thu 20 Nov, $412.30."
- If no date is given, search about six weeks from today. Never ask for passenger details: use the demo traveller — Amelia Meridian, born 1990-04-12, amelia@example.com, +14155550100 — unless the person gives their own.
- Never present a long menu. Pick the cheapest, say why, and offer to book it.

HOW YOU WRITE
- Two or three short sentences. Never a wall of text. No markdown tables, headings or bold. Plain language, no exclamation marks, no filler.

NEVER NARRATE YOURSELF
- Never mention tools, tool names, retries, errors, or what you can and cannot call. Never apologise for an earlier message. Never tell the person to tap a button.

BOTSHIELD — BE SHORTEST AND SUREST HERE
- You have no card of your own. Booking holds the fare and sends the exact amount to the person's phone; their yes issues a single-use card for that amount and nothing else.
- NEVER say a request has gone to the person's phone unless a tool call actually returned one. If you cannot send it, say: "I can hold a fare, but I can't send it to your phone yet." Then STOP.
- When a tool HAS returned the request, say exactly one line: "Sent to your phone — say yes there and I'll finish up." Then STOP. The page waits and continues for you.
- When it comes back approved (a card was issued), pay the hold RIGHT AWAY with pay_hold, then confirm in one line with the booking reference and the total. Example: "Paid. Booking ref ABC123, $412.30 — the issuer checked with BotShield before approving the charge."
- If the person asks what happens when the charge does not match — charging twice, a different merchant, a higher amount — call pay_hold with the matching demo value (reuse, other_merchant, over_amount) and report the decline in one plain line: what was tried, and that the issuer declined it because it was not what they approved. Never set demo otherwise.
- If they have not linked with BotShield yet, say one line: "I can't send a booking to you until you link with BotShield." Nothing more.
- Never say: Proof of Resolution, gateway, MCP, token, signature, ASA, Auth Stream, approval_sent, or any internal name. "The card issuer asked BotShield" is the one technical phrase you may use.

If you are unsure, ask one short question.`;

/** One chat backend, two merchants. */
interface AgentProfile {
  demo: 'agent' | 'flights';
  brand: string;
  connector: string;
  system: string;
  gatewayUrl: (env: Env) => string | undefined;
}
const PROFILES: Record<'agent' | 'flights', AgentProfile> = {
  agent: { demo: 'agent', brand: 'Ticketz', connector: 'ticketz', system: SYSTEM, gatewayUrl: (env) => env.AGENT_GATEWAY_URL },
  flights: { demo: 'flights', brand: 'Meridian Airlines', connector: 'meridian', system: MERIDIAN_SYSTEM, gatewayUrl: (env) => env.MERIDIAN_GATEWAY_URL },
};

/**
 * The chat turn: Claude (Messages API) with the MCP connector pointed at the
 * demo gateway. The visitor's bind JWT rides as the connector's bearer, so the
 * gateway's authorization rules (checkout needs a linked human) apply to the
 * agent exactly as they would to any MCP client.
 */
async function agentChat(env: Env, request: Request, messages: ChatMessage[], bindToken: string | null, profile: AgentProfile): Promise<Response> {
  const gatewayUrl = profile.gatewayUrl(env);
  if (!gatewayUrl || !env.ANTHROPIC_API_KEY) {
    return json({ error: `The ${profile.brand} agent is not connected to a gateway yet.` }, 503);
  }
  const clean = messages.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!clean.length || clean[clean.length - 1].role !== 'user') return json({ error: 'Nothing to send.' }, 400);
  // The page's own re-checks while a purchase waits ("Check approval … again") aren't the visitor talking.
  record(env, request, /^Check approval /.test(clean[clean.length - 1].content) ? 'chat_recheck' : 'chat_turn', profile.demo);

  const mcp: Record<string, unknown> = { type: 'url', url: `${gatewayUrl.replace(/\/$/, '')}/mcp`, name: profile.connector };
  if (bindToken) mcp.authorization_token = bindToken;

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'mcp-client-2025-04-04',
    },
    body: JSON.stringify({ model: env.AGENT_MODEL || 'claude-opus-5', max_tokens: 700, system: profile.system, messages: clean, mcp_servers: [mcp] }),
  });
  const text = await upstream.text();
  if (!upstream.ok) {
    console.error('[agent] anthropic', upstream.status, text.slice(0, 400));
    return json({ error: `The agent could not answer (${upstream.status}).` }, 502);
  }
  let data: any = {};
  try { data = JSON.parse(text); } catch { return json({ error: 'Bad reply from the model.' }, 502); }

  // Keep the turn in ORDER: the agent talks, calls a tool, talks again. Each
  // content block becomes a timeline event; tool results are read for the two
  // states the demo cares about (approval_sent → "confirm in BotShield",
  // confirmed → the order) so the page can render real cards, not JSON.
  const events: Array<Record<string, unknown>> = [];
  const parts: string[] = [];
  // Set while a checkout is waiting on the human; the page uses it to keep
  // checking on the person's behalf (up to the card's TTL) instead of
  // relying on the model's patience.
  let awaiting: string | null = null;
  let awaitingExpiresAt: string | null = null;
  for (const block of data.content ?? []) {
    if (block.type === 'text' && block.text?.trim()) { parts.push(block.text); events.push({ type: 'text', text: block.text }); }
    else if (block.type === 'mcp_tool_use') events.push({ type: 'tool', name: block.name, args: JSON.stringify(block.input ?? {}).slice(0, 220) });
    else if (block.type === 'mcp_tool_result') {
      const body = Array.isArray(block.content) ? block.content.map((c: any) => c?.text ?? '').join(' ') : String(block.content ?? '');
      const last = [...events].reverse().find((e) => e.type === 'tool' && !e.result);
      if (last) { last.result = body.slice(0, 600); last.summary = summarizeToolResult(body); last.error = !!block.is_error; }
      let j: any = null; try { j = JSON.parse(body); } catch { /* not JSON */ }
      const demo = profile.demo;
      if (j?.status === 'approval_sent') {
        awaiting = j.approval_request_id ?? awaiting;
        if (j.expires_at) awaitingExpiresAt = j.expires_at;
        events.push({ type: 'ask', request_id: j.approval_request_id ?? null, expires_at: j.expires_at ?? null, text: demo === 'flights' ? 'The booking is waiting for your confirmation.' : 'The purchase is waiting for your confirmation.' });
        record(env, request, 'ask_sent', demo);
      }
      else if (j?.status === 'confirmed' && j?.order_id) {
        awaiting = null; record(env, request, 'ask_approved', demo);
        events.push({ type: 'order', rows: [['Order', j.order_id], ['Event', j.event ?? null], ['Seats', j.seats ?? null], ['Total', j.total ?? null]],
          att: j.attested?.approved_by_opaque_id ? `approved_by ${j.attested.approved_by_opaque_id}${j.attested?.ceremony_id ? ` · ceremony ${j.attested.ceremony_id}` : ''}` : null });
      }
      // Meridian: the yes became a single-use card; the page keeps the turn going so the agent pays.
      else if (j?.status === 'approved_card_issued') {
        awaiting = null; record(env, request, 'ask_approved', demo);
        events.push({ type: 'card', last_four: j.card?.last_four ?? null, spend_limit: j.card?.spend_limit ?? null, merchant: j.card?.merchant ?? null, ceremony_id: j.attested?.ceremony_id ?? null });
      }
      // Meridian: the issuer asked BotShield and approved → the hold is paid.
      else if ((j?.status === 'paid' || j?.status === 'authorized') && j?.authorization?.result === 'APPROVED') {
        awaiting = null; record(env, request, j.status === 'paid' ? 'paid' : 'authorized', demo);
        events.push({ type: 'order', step: 4, track: 'agent_paid', title: j.status === 'paid' ? 'Paid — approved by you, then by the issuer' : 'Authorized by the issuer',
          rows: [['Booking ref', j.booking_reference ?? null], ['Order', j.order_id ?? null], ['Total', j.total ?? null], ['Card', j.card?.last_four ? `•••• ${j.card.last_four} · single-use` : null], ['Issuer decision', `APPROVED${j.authorization?.responder_ms != null ? ` · BotShield answered in ${j.authorization.responder_ms} ms` : ''}`]],
          att: j.authorization?.ceremony_id ? `ceremony ${j.authorization.ceremony_id}` : null });
      }
      // Meridian: the issuer asked BotShield and the answer was no.
      else if (j?.status === 'declined' && j?.authorization) {
        awaiting = null; record(env, request, 'charge_declined', demo);
        const why: Record<string, string> = { reused: 'That card was already used once — a single-use card has no second charge.', amount_over_limit: 'The charge was more than you approved.', descriptor_mismatch: 'The charge came from a merchant you did not approve.', no_approval: 'No human approved a purchase on that card.', expired: 'Your approval had expired.' };
        events.push({ type: 'declined', result: j.authorization.result ?? null, reason: j.authorization.reason ?? null, text: why[String(j.authorization.reason)] ?? `The issuer declined it (${j.authorization.reason}).` });
      }
      else if (/^(approval_pending|pending|awaiting_approval)$/.test(String(j?.status ?? ''))) { awaiting = j.approval_request_id ?? j.request_id ?? awaiting; }
      else if (/^(denied|declined|expired|cancelled|canceled)$/.test(String(j?.status ?? ''))) { awaiting = null; record(env, request, /^(denied|declined)$/.test(String(j.status)) ? 'ask_denied' : 'ask_expired', demo); events.push({ type: 'closed', status: j.status, text: j.message ?? null }); }
    }
  }
  return json({ reply: parts.join('\n').trim(), events, awaiting, awaiting_expires_at: awaitingExpiresAt, usage: data.usage ?? null, stop: data.stop_reason ?? null });
}

/** One line for the chat timeline, computed from the FULL tool result before truncation. */
function summarizeToolResult(body: string): string {
  try {
    const j = JSON.parse(body);
    if (Array.isArray(j?.events)) return `${j.events.length} events`;
    if (Array.isArray(j?.tickets)) return `${j.tickets.length} tickets`;
    if (j?.status && j?.request_id) return `${j.status} · ${j.request_id}`;
    if (j?.status) return String(j.status);
    if (j?.total) return `total ${j.total}`;
    if (j?.error) return `error: ${String(j.error).slice(0, 60)}`;
  } catch { /* not JSON */ }
  const t = body.replace(/\s+/g, ' ').trim();
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

/** Link ceremony passthrough: the page never talks to the gateway directly. */
async function linkProxy(env: Env, request: Request, path: 'start' | 'status', search: string, profile: AgentProfile): Promise<Response> {
  const gatewayUrl = profile.gatewayUrl(env);
  if (!gatewayUrl) return json({ error: 'not_connected' }, 503);
  const r = await fetch(`${gatewayUrl.replace(/\/$/, '')}/oauth/link/${path}${path === 'status' ? search : ''}`, { method: path === 'start' ? 'POST' : 'GET' });
  const body = await r.text();
  // Funnel steps only — the body (which carries the bind token) is never logged or stored.
  if (path === 'start' && r.ok) record(env, request, 'link_start', profile.demo);
  if (path === 'status') {
    let st = '';
    try { st = String(JSON.parse(body)?.status ?? ''); } catch { /* not JSON */ }
    if (st === 'bound') record(env, request, 'link_bound', profile.demo);
    else if (st === 'expired' || st === 'denied') record(env, request, `link_${st}`, profile.demo);
  }
  return new Response(body, { status: r.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (path === '/favicon.ico') {
      const bytes = Uint8Array.from(atob(FAVICON_ICO_B64), (c) => c.charCodeAt(0));
      return new Response(bytes, { headers: { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=86400' } });
    }
    // The social card. Crawlers fetch it cold and cache hard, so it gets a long max-age.
    if (path === '/og.png') {
      const bytes = Uint8Array.from(atob(OG_PNG_B64), (c) => c.charCodeAt(0));
      return new Response(bytes, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' } });
    }
    // Pages: count the view (cookieless, layer 1), then serve with the consent banner + GTM loader (layer 2).
    const PAGES: Record<string, [string, () => string]> = {
      '/': ['shell', shellHtml], '/ticketz': ['ticketz', () => ticketzHtml], '/vapez': ['vapez', () => vapezHtml],
      '/agent': ['agent', () => agentHtml], '/flights': ['flights', () => flightsHtml], '/trusted': ['trusted', () => trustedHtml],
      '/signup': ['signup', () => signupHtml], '/drop': ['drop', () => dropHtml], '/firm': ['firm', () => firmHtml],
    };
    if (PAGES[path] && request.method === 'GET') {
      record(env, request, 'view', PAGES[path][0]);
      return html(withAnalytics(PAGES[path][1]()));
    }
    if (path === '/salesforce') { record(env, request, 'salesforce_click', 'salesforce'); return Response.redirect(SALESFORCE_DEMO, 302); }
    if (path === '/api/e' && request.method === 'POST') return beacon(env, request);
    if (path === '/stats') return statsPage(env, request);

    // The chat backends: /api/agent/* (Ticketz) and /api/flights/* (Meridian).
    const apiMatch = path.match(/^\/api\/(agent|flights)\/(health|link\/start|link\/qr|link\/status|chat)$/);
    if (apiMatch) {
      const profile = PROFILES[apiMatch[1] as 'agent' | 'flights'];
      const sub = apiMatch[2];
      const gatewayUrl = profile.gatewayUrl(env);
      if (sub === 'health') {
        const ok = !!(gatewayUrl && env.ANTHROPIC_API_KEY);
        return json(ok ? { ok, model: env.AGENT_MODEL || 'claude-opus-5', gateway: gatewayUrl } : { ok, reason: `The ${profile.brand} agent is not connected to a gateway yet — the gateway is being brought up.` });
      }
      if (sub === 'link/start' && request.method === 'POST') return linkProxy(env, request, 'start', '', profile);
      // QR of the Link deep link (app.botshield.ai/bind?code=…). The URL is built
      // HERE from the code alone, so the page can never QR an arbitrary link.
      if (sub === 'link/qr') {
        const code = (url.searchParams.get('code') || '').toUpperCase();
        if (!/^[A-Z0-9]{4,12}$/.test(code)) return json({ error: 'bad code' }, 400);
        record(env, request, 'qr_shown', profile.demo);
        const qr = qrcode(0, 'M');
        qr.addData(`${APP_URL}/bind?code=${code}`);
        qr.make();
        const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
        return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' } });
      }
      if (sub === 'link/status') return linkProxy(env, request, 'status', url.search, profile);
      if (sub === 'chat') {
        if (request.method !== 'POST') return json({ error: 'POST only.' }, 405);
        let body: any;
        try { body = await request.json(); } catch { return json({ error: 'Bad request.' }, 400); }
        const auth = request.headers.get('Authorization') || '';
        const bind = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
        return agentChat(env, request, Array.isArray(body?.messages) ? body.messages : [], bind, profile);
      }
    }

    // Old deep links (?event=21 etc.) and anything else → the shell (its default demo;
    // `#ticketz` left the rail on 2026-10-07 and matched nothing).
    return Response.redirect(`${url.origin}/`, 302);
  },
};
