import 'dotenv/config';
import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const isDev = process.argv.includes('--dev');
const port = Number(process.env.PORT || (isDev ? 3001 : 4173));
let apiKey = process.env.GEMINI_API_KEY?.trim();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

app.get('/api/gemini/status', (_req, res) => {
  res.json({ configured: Boolean(apiKey) });
});

app.post('/api/gemini/configure', async (req, res) => {
  const origin = req.get('origin');
  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    return res.status(403).json({ error: 'Key setup must be submitted from the local app.' });
  }
  if (originUrl.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(originUrl.hostname)) {
    return res.status(403).json({ error: 'Key setup is only allowed from the local app.' });
  }

  const key = req.body?.apiKey;
  if (typeof key !== 'string' || key.trim().length < 20 || key.trim().length > 512) {
    return res.status(400).json({ error: 'Enter a valid Gemini API key.' });
  }

  try {
    const envPath = path.join(__dirname, '.env');
    let contents = '';
    try {
      contents = await readFile(envPath, 'utf8');
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }

    const line = `GEMINI_API_KEY=${JSON.stringify(key.trim())}`;
    const keyLine = /^\s*(?:export\s+)?GEMINI_API_KEY\s*=.*$/m;
    const updated = keyLine.test(contents)
      ? contents.replace(keyLine, line)
      : `${contents}${contents && !contents.endsWith('\n') ? '\n' : ''}${line}\n`;
    await writeFile(envPath, updated, { encoding: 'utf8', mode: 0o600 });
    apiKey = key.trim();
    return res.json({ configured: true });
  } catch (error) {
    console.error('Could not save Gemini configuration:', error);
    return res.status(500).json({ error: 'Could not save the key to the local .env file.' });
  }
});

app.post('/api/gemini', async (req, res) => {
  if (!apiKey) return res.status(503).json({ error: 'Gemini API key is not configured on the server.' });

  const { query, grounding, level } = req.body ?? {};
  if (typeof query !== 'string' || !query.trim() || query.length > 4000 ||
      typeof grounding !== 'string' || grounding.length > 20000 ||
      !['simple', 'standard', 'deep'].includes(level)) {
    return res.status(400).json({ error: 'Invalid tutor request.' });
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `You are a patient tutor. Explain at a ${level} level. Use the provided context when relevant, distinguish it from general knowledge, and say when you are unsure. Be clear and concise.` }] },
        contents: [{ role: 'user', parts: [{ text: `Course and note context:\n${grounding || '(No matching local material found)'}\n\nStudent question:\n${query}` }] }],
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const message = result?.error?.message;
      return res.status(502).json({ error: typeof message === 'string' ? `Gemini request failed: ${message}` : `Gemini request failed (${response.status}).` });
    }

    const text = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter((part) => typeof part === 'string')
      .join('\n')
      .trim();
    if (!text) return res.status(502).json({ error: 'Gemini returned no answer. Try rephrasing your question.' });
    return res.json({ text });
  } catch (error) {
    const message = error instanceof Error && error.name === 'TimeoutError'
      ? 'Gemini request timed out.'
      : 'Could not reach Gemini. Check your internet connection and API key.';
    return res.status(502).json({ error: message });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Tutor request is too large.' });
  }
  console.error('Unexpected server error:', error);
  return res.status(500).json({ error: 'Unexpected local server error.' });
});

if (!isDev) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

app.listen(port, '127.0.0.1', () => {
  console.log(`Gemini proxy listening on http://127.0.0.1:${port}`);
});
