import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { getPendingSync, getFailedSync, markSyncStatus } from "../storage/repository";
import { processPendingSync } from "../sync/syncManager";

export default function SyncCenter() {
  const [pending, setPending] = useState<any[]>([]);
  const [failed, setFailed] = useState<any[]>([]);

  async function load() {
    setPending(await getPendingSync());
    setFailed(await getFailedSync());
  }

  useEffect(() => {
    load();
  }, []);

  const retry = async (item: any) => {
    await markSyncStatus(item.id, "pending");
    await processPendingSync();
    await load();
  };

  const clear = async (item: any) => {
    await markSyncStatus(item.id, "done");
    await load();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>Sync Center</Text>

      <Text>Pending</Text>
      <FlatList
        data={pending}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 6 }}>
            <Text>{item.type}</Text>
            <Text>{item.payload}</Text>
          </View>
        )}
      />

      <Text style={{ marginTop: 16 }}>Failed</Text>
      <FlatList
        data={failed}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 6 }}>
            <Text>{item.type}</Text>
            <Text>Error: {item.error}</Text>
            <Button title="Retry" onPress={() => retry(item)} />
            <Button title="Clear" color="red" onPress={() => clear(item)} />
          </View>
        )}
      />

      <Button title="Process Now" onPress={processPendingSync} />
    </View>
  );
}
