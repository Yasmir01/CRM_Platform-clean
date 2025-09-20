import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, TextInput, StyleSheet } from "react-native";
import { api } from "../services/api";

export default function MaintenanceScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => { api.listMaintenance().then(setItems).catch(console.error); }, []);

  const addRequest = async () => {
    try {
      await api.createMaintenance({ subject, description: desc });
      const updated = await api.listMaintenance();
      setItems(updated);
      setSubject(""); setDesc("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Maintenance Request</Text>
      <TextInput placeholder="Subject" value={subject} onChangeText={setSubject} style={styles.input} />
      <TextInput placeholder="Description" value={desc} onChangeText={setDesc} style={[styles.input, { height: 100 }]} multiline />
      <Button title="Submit" onPress={addRequest} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.subject}</Text>
            <Text style={styles.itemMeta}>{item.status} — {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 18, marginBottom: 8 },
  input: { borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 6 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  itemTitle: { fontWeight: '600' },
  itemMeta: { color: '#666', fontSize: 12 },
});
