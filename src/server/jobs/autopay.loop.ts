import { runAutopayOnce } from "./autopay";

async function loop() {
  while (true) {
    try {
      const res = await runAutopayOnce({ windowDays: 1 });
      // eslint-disable-next-line no-console
      console.log(`[autopay] processed=${res.processed} ok=${res.succeeded} fail=${res.failed}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[autopay] error:", e);
    }
    await new Promise((r) => setTimeout(r, 60_000)); // run every 60s in dev
  }
}

loop();
