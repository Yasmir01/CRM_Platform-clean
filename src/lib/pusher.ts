import Pusher from "pusher";

<<<<<<< HEAD
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
=======
// Guarded pusher client: lazy-load the pusher package on the server only and
// export a safe stub so client-side bundlers (Vite) don't try to resolve the
// dependency during import analysis. Use pusher.trigger(...) which returns a
// Promise. If Pusher isn't available, calls become no-ops.

let pusherClient: any | null = null;

async function getPusherClient() {
  if (pusherClient) return pusherClient;
  if (typeof window !== 'undefined') return null; // don't init in browser

  try {
    // In some environments Vite/Rollup attempt to statically analyze imports.
    // `/* @vite-ignore */` prevents that. The package may not be installed in
    // every environment (eg. editor preview), so guard with try/catch.
    const mod = await import(/* @vite-ignore */ 'pusher');
    const Pusher = (mod && (mod.default || mod)) as any;
    pusherClient = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
    return pusherClient;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Pusher package not available or failed to initialize:', err?.message || err);
    pusherClient = null;
    return null;
  }
}

export const pusher = {
  async trigger(channel: string, event: string, data: any) {
    const client = await getPusherClient();
    if (!client) return null;
    try {
      return client.trigger(channel, event, data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Pusher trigger failed:', err);
      return null;
    }
  },
};
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
