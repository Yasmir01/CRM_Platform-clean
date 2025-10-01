import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import { upsert, all } from "../storage/repository";

type Doc = { id: string; filename: string; mimeType?: string; storageKey: string; createdAt: string };

export default function TenantLeaseDocs({ navigation }: any) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const leaseId = "lease1";

  async function load() {
    try {
      const res = await fetch(`http://localhost:4000/api/leases/${leaseId}/documents`);
      const json = await res.json();
      setDocs(json);
      await upsert("leases", `docs-${leaseId}`, json);
    } catch {
      const cached = await all("leases");
      const fallback = cached.find((x: any) => Array.isArray(x) && x[0] && x[0].id) || [];
      setDocs(fallback);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const openDoc = async (doc: Doc) => {
    try {
      const r = await fetch(`http://localhost:4000/api/leases/${leaseId}/documents/${doc.id}/download`);
      const { url } = await r.json();
      const localPath = `${FileSystem.documentDirectory}${doc.id}-${doc.filename}`;
      const info = await FileSystem.getInfoAsync(localPath);
      if (!info.exists) {
        const downloadRes = await FileSystem.downloadAsync(`http://localhost:4000${url}`, localPath);
        if (downloadRes.status !== 200) throw new Error("Download failed");
      }
      navigation.navigate("DocViewer", { localPath, title: doc.filename });
    } catch (e: any) {
      Alert.alert("Open failed", e?.message || "Could not open document");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Lease Documents</Text>
      <FlatList
        data={docs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openDoc(item)}
            style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.filename}</Text>
            <Text style={{ color: "#666" }}>{new Date(item.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
