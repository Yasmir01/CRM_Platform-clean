import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { queueForSync } from "../storage/repository";

type WorkOrder = {
  id: string;
  title: string;
  status: string;
};

const STATUSES = ["NEW", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"];

export default function VendorTaskBoard() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    setOrders([
      { id: "wo1", title: "Fix leaking sink", status: "NEW" },
      { id: "wo2", title: "Replace light fixture", status: "ASSIGNED" },
    ]);
  }, []);

  const moveTo = async (wo: WorkOrder, newStatus: string) => {
    setOrders(orders.map((o) => (o.id === wo.id ? { ...o, status: newStatus } : o)));
    await queueForSync("workorder_status", { id: wo.id, status: newStatus });
  };

  return (
    <View style={styles.container}>
      {STATUSES.map((status) => (
        <View key={status} style={styles.column}>
          <Text style={styles.columnTitle}>{status}</Text>
          <FlatList
            data={orders.filter((o) => o.status === status)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  const currentIndex = STATUSES.indexOf(item.status);
                  const next = STATUSES[(currentIndex + 1) % STATUSES.length];
                  moveTo(item, next);
                }}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>Tap → {item.status}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", flex: 1, padding: 5 },
  column: { flex: 1, margin: 5, backgroundColor: "#f5f5f5", borderRadius: 8, padding: 5 },
  columnTitle: { fontWeight: "bold", marginBottom: 5 },
  card: { backgroundColor: "white", padding: 10, borderRadius: 6, marginBottom: 8, elevation: 2 },
  cardTitle: { fontWeight: "bold" },
  cardSub: { fontSize: 12, color: "gray" },
});
