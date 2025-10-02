// src/lib/sessionContext.ts
import { AsyncLocalStorage } from 'async_hooks';

type SessionLike = any;

const als = new AsyncLocalStorage<{ session?: SessionLike }>();

export function runWithSession(session: SessionLike | null, fn: () => Promise<any> | any) {
  return als.run({ session: session ?? undefined }, fn as any);
}

export function getSessionFromContext(): SessionLike | null {
  const store = als.getStore();
  return store?.session ?? null;
}
