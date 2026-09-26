// demo.botshield.ai — BotShield Demos.
//
//   /            the Demos shell (rail + framed demo; #key selects one)
//   /ticketz     Ticketz · BotShield Gate at checkout (Human Gate, inline passkey beta)
//   /agent       Ticketz · Agents Ask (chat with the Ticketz agent; purchases wait for the human)
//   /vapez       Vapez · Age Gate at the door (enter_site_age_check, 18+)
//   /salesforce  → Coral Cloud on salesforce-demo.botshield.ai
//   /api/agent/* the chat page's only backend: health · Link ceremony passthrough ·
//                chat = Claude (Messages API, MCP connector → the demo gateway's /mcp,
//                the visitor's bind JWT as the connector bearer). Unset → 503, and the
//                page says the agent is not connected. No fake replies.
//
// Every demo page runs against PRODUCTION (cdn.botshield.ai + the prod Ticketz
// site key); the gates are the ones in the Ticketz org's Console.
import { ticketzHtml } from './pages/ticketz';
import { vapezHtml } from './pages/vapez';
import { agentHtml } from './pages/agent';
import { shellHtml } from './shell';
import { FAVICON_ICO_B64 } from './favicon';
import qrcode from 'qrcode-generator';

const APP_URL = 'https://app.botshield.ai';

interface Env {
  AGENT_GATEWAY_URL?: string;  // https://gateway-demo.botshield.ai — MCP at /mcp, Link ceremony at /oauth/link/*
  ANTHROPIC_API_KEY?: string;  // secret — the demo's own Claude key (the agent runs here, tools run behind the gateway)
  AGENT_MODEL?: string;        // default claude-opus-5
}

const SALESFORCE_DEMO = 'https://salesforce-demo.botshield.ai/coralcloud/s/';

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

const SYSTEM = `You are the Ticketz agent. You help people find shows and buy tickets on Ticketz using the Ticketz tools.
Rules: use the tools for anything factual (events, prices, availability). You never complete a purchase yourself — a checkout is PROPOSED and waits for the human to confirm it on their phone in the BotShield app (Agents Ask); tell the person that plainly and wait for the tool result. If a tool says the human is not linked yet, ask them to tap "Link your BotShield ID" above the chat. Keep replies short and concrete. You are shown in a phone-width chat bubble: never use markdown tables or headings — for lists of events use one short bullet per event ("Coral Bay Music Festival — Sat Sep 12 — from $89.50").`;

/**
 * The chat turn: Claude (Messages API) with the MCP connector pointed at the
 * demo gateway. The visitor's bind JWT rides as the connector's bearer, so the
 * gateway's authorization rules (checkout needs a linked human) apply to the
 * agent exactly as they would to any MCP client.
 */
async function agentChat(env: Env, messages: ChatMessage[], bindToken: string | null): Promise<Response> {
  if (!env.AGENT_GATEWAY_URL || !env.ANTHROPIC_API_KEY) {
    return json({ error: 'The Ticketz agent is not connected to a gateway yet.' }, 503);
  }
  const clean = messages.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!clean.length || clean[clean.length - 1].role !== 'user') return json({ error: 'Nothing to send.' }, 400);

  const mcp: Record<string, unknown> = { type: 'url', url: `${env.AGENT_GATEWAY_URL.replace(/\/$/, '')}/mcp`, name: 'ticketz' };
  if (bindToken) mcp.authorization_token = bindToken;

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'mcp-client-2025-04-04',
    },
    body: JSON.stringify({ model: env.AGENT_MODEL || 'claude-opus-5', max_tokens: 700, system: SYSTEM, messages: clean, mcp_servers: [mcp] }),
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
      if (j?.status === 'approval_sent') {
        awaiting = j.approval_request_id ?? awaiting;
        if (j.expires_at) awaitingExpiresAt = j.expires_at;
        events.push({ type: 'ask', request_id: j.approval_request_id ?? null, expires_at: j.expires_at ?? null, text: 'The purchase is waiting for your confirmation.' });
      }
      else if (j?.status === 'confirmed' && j?.order_id) { awaiting = null; events.push({ type: 'order', order_id: j.order_id, event: j.event ?? null, seats: j.seats ?? null, total: j.total ?? null, approved_by: j.attested?.approved_by_opaque_id ?? null, ceremony_id: j.attested?.ceremony_id ?? null }); }
      else if (/^(approval_pending|pending|awaiting_approval)$/.test(String(j?.status ?? ''))) { awaiting = j.approval_request_id ?? j.request_id ?? awaiting; }
      else if (/^(denied|declined|expired|cancelled|canceled)$/.test(String(j?.status ?? ''))) { awaiting = null; events.push({ type: 'closed', status: j.status, text: j.message ?? null }); }
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
async function linkProxy(env: Env, path: 'start' | 'status', search: string): Promise<Response> {
  if (!env.AGENT_GATEWAY_URL) return json({ error: 'not_connected' }, 503);
  const r = await fetch(`${env.AGENT_GATEWAY_URL.replace(/\/$/, '')}/oauth/link/${path}${path === 'status' ? search : ''}`, { method: path === 'start' ? 'POST' : 'GET' });
  const body = await r.text();
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
    if (path === '/') return html(shellHtml());
    if (path === '/ticketz') return html(ticketzHtml);
    if (path === '/vapez') return html(vapezHtml);
    if (path === '/agent') return html(agentHtml);
    if (path === '/salesforce') return Response.redirect(SALESFORCE_DEMO, 302);

    if (path === '/api/agent/health') {
      const ok = !!(env.AGENT_GATEWAY_URL && env.ANTHROPIC_API_KEY);
      return json(ok ? { ok, model: env.AGENT_MODEL || 'claude-opus-5', gateway: env.AGENT_GATEWAY_URL } : { ok, reason: 'The Ticketz agent is not connected to a gateway yet — the production gateway is being brought up.' });
    }
    if (path === '/api/agent/link/start' && request.method === 'POST') return linkProxy(env, 'start', '');
    // QR of the Link deep link (app.botshield.ai/bind?code=…). The URL is built
    // HERE from the code alone, so the page can never QR an arbitrary link.
    if (path === '/api/agent/link/qr') {
      const code = (url.searchParams.get('code') || '').toUpperCase();
      if (!/^[A-Z0-9]{4,12}$/.test(code)) return json({ error: 'bad code' }, 400);
      const qr = qrcode(0, 'M');
      qr.addData(`${APP_URL}/bind?code=${code}`);
      qr.make();
      const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
      return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' } });
    }
    if (path === '/api/agent/link/status') return linkProxy(env, 'status', url.search);
    if (path === '/api/agent/chat') {
      if (request.method !== 'POST') return json({ error: 'POST only.' }, 405);
      let body: any;
      try { body = await request.json(); } catch { return json({ error: 'Bad request.' }, 400); }
      const auth = request.headers.get('Authorization') || '';
      const bind = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
      return agentChat(env, Array.isArray(body?.messages) ? body.messages : [], bind);
    }

    // Old deep links (?event=21 etc.) and anything else → the shell.
    return Response.redirect(`${url.origin}/#ticketz`, 302);
  },
};
