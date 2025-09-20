import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { api } from "../services/api";

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    api.listContacts().then(setContacts).catch(console.error);
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Refresh" onPress={() => api.listContacts().then(setContacts).catch(console.error)} />
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ paddingVertical: 8 }}>{item.firstName} {item.lastName} — {item.email}</Text>
        )}
      />
    </View>
  );
}
