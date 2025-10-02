import type { VercelRequest } from '@vercel/node';

export function getClientIp(req: VercelRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.socket as any)?.remoteAddress ||
    'unknown'
  );
}
