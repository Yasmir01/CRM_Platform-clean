import type { VercelRequest, VercelResponse } from '@vercel/node';

export function requireCsrf(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return true;
  const token = req.headers['x-csrf-token'] as string | undefined;
  if (!token || token.length < 10) {
    res.status(403).json({ error: 'csrf_required' });
    return false;
  }
  return true;
}
