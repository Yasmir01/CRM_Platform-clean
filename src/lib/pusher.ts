// src/lib/pusher.ts
// Guarded Pusher client for server-side usage with safe no-op fallback in the browser.

let pusherClient: any | null = null;

async function getPusherClient() {
  if (pusherClient) return pusherClient;
  if (typeof window !== "undefined") return null; // Don't init in browser

  try {
    // Prevent Vite from analyzing import at build time
    const mod = await import(/* @vite-ignore */ "pusher");
    const Pusher = (mod && (mod.default || mod)) as any;
    pusherClient = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
    return pusherClient;
  } catch (err: any) {
    console.warn(
      "Pusher package not available or failed to initialize:",
      err?.message || err
    );
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
      console.error("Pusher trigger failed:", err);
      return null;
    }
  },
};
