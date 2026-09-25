// demo.botshield.ai — BotShield Demos.
//
//   /            the Demos shell (rail + framed demo; #key selects one)
//   /ticketz     Ticketz · BotShield Gate at checkout (Human Gate, inline passkey beta)
//   /agent       Ticketz · Agents Ask (chat with the Ticketz agent; purchases wait for the human)
//   /vapez       Vapez · Age Gate at the door (enter_site_age_check, 18+)
//   /salesforce  → Coral Cloud on salesforce-demo.botshield.ai
//   /api/agent/* the chat page's only backend: health + a proxy to the BotShield
//                agentgateway (AGENT_GATEWAY_URL + AGENT_GATEWAY_TOKEN). Unset → 503,
//                and the page says the agent is not connected. No fake replies.
//
// Every demo page runs against PRODUCTION (cdn.botshield.ai + the prod Ticketz
// site key); the gates are the ones in the Ticketz org's Console.
import { ticketzHtml } from './pages/ticketz';
import { vapezHtml } from './pages/vapez';
import { agentHtml } from './pages/agent';
import { shellHtml } from './shell';

interface Env {
  AGENT_GATEWAY_URL?: string;   // e.g. https://gateway.botshield.ai (the LLM route host)
  AGENT_GATEWAY_TOKEN?: string; // secret — bearer the gateway expects from this demo
  AGENT_MODEL?: string;         // e.g. anthropic/claude-opus-5
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

/** Chat proxy: OpenAI-compatible completion through the agentgateway's LLM route (tools live behind the gateway). */
async function agentChat(env: Env, messages: ChatMessage[]): Promise<Response> {
  if (!env.AGENT_GATEWAY_URL || !env.AGENT_GATEWAY_TOKEN) {
    return json({ error: 'The Ticketz agent is not connected to a gateway yet.' }, 503);
  }
  const clean = messages.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!clean.length) return json({ error: 'Nothing to send.' }, 400);
  const system = 'You are the Ticketz agent: you help people find shows and buy tickets on Ticketz. Use the Ticketz tools for real data. You never complete a purchase yourself — any purchase is proposed and waits for the human to confirm it in the BotShield app; say so plainly when that happens. Keep replies short.';
  const upstream = await fetch(`${env.AGENT_GATEWAY_URL.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AGENT_GATEWAY_TOKEN}` },
    body: JSON.stringify({ model: env.AGENT_MODEL || 'anthropic/claude-opus-5', messages: [{ role: 'system', content: system }, ...clean], max_tokens: 600 }),
  });
  const text = await upstream.text();
  if (!upstream.ok) {
    console.error('[agent] gateway', upstream.status, text.slice(0, 300));
    return json({ error: `The gateway answered ${upstream.status}.` }, 502);
  }
  let data: any = {};
  try { data = JSON.parse(text); } catch { return json({ error: 'The gateway answered something that was not JSON.' }, 502); }
  const choice = data?.choices?.[0];
  const reply: string = choice?.message?.content ?? '';
  const events = (choice?.message?.tool_calls ?? []).map((t: any) => ({ type: 'tool', name: t?.function?.name ?? 'tool', args: (t?.function?.arguments ?? '').slice(0, 200) }));
  return json({ reply, events, usage: data?.usage ?? null });
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
      const ok = !!(env.AGENT_GATEWAY_URL && env.AGENT_GATEWAY_TOKEN);
      return json(ok ? { ok, model: env.AGENT_MODEL || 'anthropic/claude-opus-5' } : { ok, reason: 'The Ticketz agent is not connected to a gateway yet — the production gateway is being brought up.' });
    }
    if (path === '/api/agent/chat') {
      if (request.method !== 'POST') return json({ error: 'POST only.' }, 405);
      let body: any;
      try { body = await request.json(); } catch { return json({ error: 'Bad request.' }, 400); }
      return agentChat(env, Array.isArray(body?.messages) ? body.messages : []);
    }

    // Old deep links (?event=21 etc.) and anything else → the shell.
    return Response.redirect(`${url.origin}/#ticketz`, 302);
  },
};
