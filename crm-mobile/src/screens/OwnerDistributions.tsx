import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";

type Distribution = {
  id: string;
  amount: number;
  method: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  statement?: { periodStart: string; periodEnd: string };
};

export default function OwnerDistributions() {
  const [dists, setDists] = useState<Distribution[]>([]);
  const ownerId = "owner1";

  async function load() {
    const res = await fetch(`http://localhost:4000/api/distributions/${ownerId}`);
    setDists(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Owner Distributions</Text>
      <FlatList
        data={dists}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
            <Text>Amount: ${item.amount}</Text>
            <Text>Method: {item.method}</Text>
            <Text>Status: {item.status}</Text>
            {item.statement && (
              <Text>
                For Statement: {new Date(item.statement.periodStart).toLocaleDateString()} – {new Date(item.statement.periodEnd).toLocaleDateString()}
              </Text>
            )}
            {item.paidAt && <Text>Paid at: {new Date(item.paidAt).toLocaleString()}</Text>}
          </View>
        )}
      />
    </View>
  );
}
