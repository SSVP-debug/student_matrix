import { generateOnlineTutorReply } from './provider.mjs';

const requests = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 20) {
    requests.set(ip, recent);
    return true;
  }
  recent.push(now);
  requests.set(ip, recent);
  return false;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const forwarded = String(req.headers['x-forwarded-for'] || '');
  const ip = forwarded.split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many AI requests. Please wait a minute and try again.' });

  const body = req.body || {};
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const provider = body.provider;
  const level = ['simple', 'standard', 'deep'].includes(body.level) ? body.level : 'standard';
  if (!question || question.length > 2000) return res.status(400).json({ error: 'Question must contain 1–2000 characters.' });
  if (typeof body.context !== 'string' || body.context.length > 8000) return res.status(400).json({ error: 'Context must be text no longer than 8000 characters.' });
  try {
    const result = await generateOnlineTutorReply({
      provider,
      question,
      context: body.context,
      level,
      learner: body.learner && typeof body.learner === 'object' ? body.learner : {},
    });
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Online AI request failed.';
    const status = message.startsWith('Online AI is not configured') ? 503 :
      message.includes('Choose OpenAI or Gemini') ? 400 :
      message.includes('aborted') ? 504 : 502;
    return res.status(status).json({ error: message });
  }
}
