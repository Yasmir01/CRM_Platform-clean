import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, StyleSheet } from "react-native";
import { queueForSync } from "../storage/repository";

type Message = {
  id: string;
  body: string;
  author: { name: string };
  createdAt: string;
};

export default function ThreadView({ route }: any) {
  const { id } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const userId = "tenant1";

  async function load() {
    const res = await fetch(`http://localhost:4000/api/messages/thread/${id}`);
    setMessages(await res.json());
  }

  async function send() {
    try {
      const res = await fetch(`http://localhost:4000/api/messages/thread/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: userId, body: text }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      await queueForSync("message_send", { threadId: id, authorId: userId, body: text });
    }
    setText("");
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageBlock}>
      <Text style={styles.author}>{item.author.name}</Text>
      <Text>{item.body}</Text>
      <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={messages} keyExtractor={(i) => i.id} renderItem={renderItem} />
      <TextInput value={text} onChangeText={setText} placeholder="Type message..." style={styles.input} />
      <Button title="Send" onPress={send} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  messageBlock: { marginVertical: 6 },
  author: { fontWeight: "bold" },
  meta: { fontSize: 12, color: "gray" },
  input: { borderWidth: 1, borderColor: "#ccc", marginVertical: 8, padding: 8 },
});
