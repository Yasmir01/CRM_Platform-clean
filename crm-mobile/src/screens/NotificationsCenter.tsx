import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userId = "tenant1";

  async function load() {
    const res = await fetch(`http://localhost:4000/api/notifications/${userId}`);
    setNotifications(await res.json());
  }

  async function markRead(id: string) {
    await fetch(`http://localhost:4000/api/notifications/${id}/read`, { method: "POST" });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => markRead(item.id)} style={[styles.card, item.read ? styles.cardRead : styles.cardUnread]}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody}>{item.message}</Text>
      <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Notifications</Text>
      <FlatList data={notifications} keyExtractor={(i) => i.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerText: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  card: { padding: 12, marginBottom: 8, borderRadius: 6 },
  cardUnread: { backgroundColor: "#e0f2fe" },
  cardRead: { backgroundColor: "#f9f9f9" },
  cardTitle: { fontWeight: "600", marginBottom: 2 },
  cardBody: { marginBottom: 4 },
  cardMeta: { fontSize: 12, color: "gray" },
});
