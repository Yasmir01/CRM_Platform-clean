import NetInfo from "@react-native-community/netinfo";
import { getPendingSync, clearPendingSync, markSyncStatus } from "../storage/repository";

const API_URL = (process.env.EXPO_PUBLIC_API_URL as string) || "http://localhost:4000";

async function sendToServer(item: { id: number; type: string; payload: string }) {
  try {
    const payload = JSON.parse(item.payload);
    const res = await fetch(`${API_URL}/api/sync/${item.type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Origin": "offline-sync" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await clearPendingSync(item.id);
    } else {
      await markSyncStatus(item.id, "failed", `HTTP ${res.status}`);
    }
  } catch (err: any) {
    await markSyncStatus(item.id, "failed", err?.message || String(err));
  }
}

export async function processPendingSync() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const items = await getPendingSync();
  for (const i of items) {
    if (i.status === "pending") {
      await sendToServer(i);
    }
  }
}
