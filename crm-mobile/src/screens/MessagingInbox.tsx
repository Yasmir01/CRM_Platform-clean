import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

type Thread = {
  id: string;
  subject: string;
  messages: { body: string; createdAt: string }[];
};

export default function MessagingInbox({ navigation }: any) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const userId = "tenant1";

  async function load() {
    const res = await fetch(`http://localhost:4000/api/messages/threads/${userId}`);
    setThreads(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }: { item: Thread }) => (
    <TouchableOpacity onPress={() => navigation.navigate("ThreadView", { id: item.id })} style={styles.row}>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text numberOfLines={1} style={styles.preview}>{item.messages[0]?.body}</Text>
      <Text style={styles.meta}>{item.messages[0]?.createdAt ? new Date(item.messages[0].createdAt).toLocaleString() : ""}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inbox</Text>
      <FlatList data={threads} keyExtractor={(i) => i.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  row: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  subject: { fontWeight: "600" },
  preview: { },
  meta: { fontSize: 12, color: "gray" },
});
