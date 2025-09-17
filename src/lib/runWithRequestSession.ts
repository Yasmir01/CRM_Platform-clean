// src/lib/runWithRequestSession.ts
import { getSession } from './auth';
import { runWithSession } from './sessionContext';

export async function runWithRequestSession(req: Request, fn: () => Promise<any> | any) {
  const session = await getSession(req as any);
  return runWithSession(session || null, fn);
}
