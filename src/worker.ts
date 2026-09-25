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
Rules: use the tools for anything factual (events, prices, availability). You never complete a purchase yourself — a checkout is PROPOSED and waits for the human to confirm it on their phone in the BotShield app (Agents Ask); tell the person that plainly and wait for the tool result. If a tool says the human is not linked yet, ask them to tap "Link your BotShield ID" above the chat. Keep replies short and concrete.`;

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

  // Flatten the content blocks: text → reply; mcp_tool_use / mcp_tool_result → timeline events.
  const events: Array<Record<string, unknown>> = [];
  const parts: string[] = [];
  for (const block of data.content ?? []) {
    if (block.type === 'text') parts.push(block.text);
    else if (block.type === 'mcp_tool_use') events.push({ type: 'tool', name: block.name, args: JSON.stringify(block.input ?? {}).slice(0, 220) });
    else if (block.type === 'mcp_tool_result') {
      const body = Array.isArray(block.content) ? block.content.map((c: any) => c?.text ?? '').join(' ') : String(block.content ?? '');
      const last = events[events.length - 1];
      if (last && last.type === 'tool' && !last.result) last.result = body.slice(0, 220);
      // A proposed checkout waiting on the phone reads as an "ask" for the timeline.
      if (/propos|pending|waiting|approve|confirm/i.test(body) && /human|phone|BotShield|card/i.test(body)) events.push({ type: 'ask', text: body.slice(0, 300) });
    }
  }
  return json({ reply: parts.join('\n').trim(), events, usage: data.usage ?? null, stop: data.stop_reason ?? null });
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
