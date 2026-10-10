import { createServer } from 'node:http';
import { generateOnlineTutorReply, providerConfigured } from '../api/provider.mjs';

const port = Number(process.env.API_PORT || 8787);
const requests = new Map();

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function limited(ip) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 20) { requests.set(ip, recent); return true; }
  recent.push(now); requests.set(ip, recent); return false;
}

createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/health' && req.method === 'GET') {
    return send(res, 200, { onlineProviders: { openai: providerConfigured('openai'), gemini: providerConfigured('gemini') } });
  }
  if (url.pathname !== '/api/tutor') return send(res, 404, { error: 'Not found.' });
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (limited(req.socket.remoteAddress || 'local')) return send(res, 429, { error: 'Too many AI requests. Please wait a minute and try again.' });

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) return send(res, 413, { error: 'Request is too large.' });
  }
  let body;
  try { body = JSON.parse(raw || '{}'); } catch { return send(res, 400, { error: 'Invalid JSON body.' }); }
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question || question.length > 2000) return send(res, 400, { error: 'Question must contain 1–2000 characters.' });
  if (typeof body.context !== 'string' || body.context.length > 8000) return send(res, 400, { error: 'Context must be text no longer than 8000 characters.' });
  try {
    const result = await generateOnlineTutorReply({
      provider: body.provider,
      question,
      context: body.context,
      level: ['simple', 'standard', 'deep'].includes(body.level) ? body.level : 'standard',
      learner: body.learner && typeof body.learner === 'object' ? body.learner : {},
    });
    return send(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Online AI request failed.';
    const status = message.startsWith('Online AI is not configured') ? 503 :
      message.includes('Choose OpenAI or Gemini') ? 400 :
      message.includes('aborted') ? 504 : 502;
    return send(res, status, { error: message });
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`student_matrix AI API listening on http://127.0.0.1:${port}`);
  console.log('Configured providers:', ['openai', 'gemini'].filter(providerConfigured).join(', ') || 'none');
});
