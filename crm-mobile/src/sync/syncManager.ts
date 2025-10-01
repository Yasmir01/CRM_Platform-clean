import NetInfo from "@react-native-community/netinfo";
import { getPendingSync, clearPendingSync } from "../storage/repository";

const API_URL = (process.env.EXPO_PUBLIC_API_URL as string) || "http://localhost:4000";

async function sendToServer(item: { id: number; type: string; payload: string }) {
  try {
    const payload = JSON.parse(item.payload);
    const res = await fetch(`${API_URL}/api/sync/${item.type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await clearPendingSync(item.id);
    } else {
      console.warn("Sync failed", res.status);
    }
  } catch (err) {
    console.error("Sync error", err);
  }
}

export async function processPendingSync() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const items = await getPendingSync();
  for (const i of items) {
    await sendToServer(i);
  }
}
