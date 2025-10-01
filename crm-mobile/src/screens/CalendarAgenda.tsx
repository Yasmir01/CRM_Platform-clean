import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from "react-native";

type Event = {
  id: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  status: string;
};

export default function CalendarAgenda({ navigation }: any) {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);

  async function load(d: Date) {
    const since = new Date(d); since.setHours(0,0,0,0);
    const until = new Date(d); until.setHours(23,59,59,999);
    const res = await fetch(`http://localhost:4000/api/calendar?orgId=demo-org&since=${since.toISOString()}&until=${until.toISOString()}`);
    setEvents(await res.json());
  }

  useEffect(() => { load(date); }, [date]);

  const prevDay = () => setDate(new Date(date.getTime() - 24*60*60*1000));
  const nextDay = () => setDate(new Date(date.getTime() + 24*60*60*1000));

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity onPress={() => navigation.navigate("EventDetail", { id: item.id })} style={styles.row}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{new Date(item.startsAt).toLocaleTimeString()} — {item.location || "No location"}</Text>
      <Text style={styles.meta}>{item.type} · {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Button title="Prev" onPress={prevDay} />
        <Text style={styles.header}>{date.toDateString()}</Text>
        <Button title="Next" onPress={nextDay} />
      </View>
      <FlatList style={styles.list} data={events} keyExtractor={(i) => i.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 18, fontWeight: "bold" },
  list: { marginTop: 12 },
  row: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontWeight: '600' },
  meta: { fontSize: 12, color: 'gray' },
});
