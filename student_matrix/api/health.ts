import { providerConfigured } from './provider.mjs';

export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  return res.status(200).json({
    onlineProviders: {
      openai: providerConfigured('openai'),
      gemini: providerConfigured('gemini'),
    },
  });
}
