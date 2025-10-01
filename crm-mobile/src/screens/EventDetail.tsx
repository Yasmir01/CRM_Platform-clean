import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";

export default function EventDetail({ route }: any) {
  const { id } = route.params;
  const [event, setEvent] = useState<any>(null);
  const userId = "tenant1";

  async function load() {
    const res = await fetch(`http://localhost:4000/api/calendar?orgId=demo-org`);
    const list = await res.json();
    setEvent(list.find((e: any) => e.id === id));
  }

  useEffect(() => { load(); }, []);

  const rsvp = async (answer: "yes" | "no" | "maybe") => {
    await fetch(`http://localhost:4000/api/calendar/${id}/rsvp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, rsvp: answer }),
    });
    Alert.alert("RSVP saved", `You responded: ${answer}`);
  };

  if (!event) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text>{new Date(event.startsAt).toLocaleString()} — {new Date(event.endsAt).toLocaleString()}</Text>
      {event.location ? <Text>Location: {event.location}</Text> : null}
      {event.description ? <Text style={styles.description}>{event.description}</Text> : null}
      <View style={styles.actions}>
        <Button title="RSVP Yes" onPress={() => rsvp("yes")} />
        <Button title="RSVP Maybe" onPress={() => rsvp("maybe")} />
        <Button title="RSVP No" color="red" onPress={() => rsvp("no")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', fontSize: 18 },
  description: { marginTop: 8 },
  actions: { marginTop: 16, gap: 8 },
});
