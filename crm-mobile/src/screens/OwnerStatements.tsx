import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { upsert, all } from "../storage/repository";

type Statement = {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
};

export default function OwnerStatements() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const ownerId = "owner1";

  async function load() {
    try {
      const res = await fetch(`http://localhost:4000/api/owner-statements/${ownerId}`);
      const json = await res.json();
      setStatements(json);
      await upsert("leases", `owner-statements-${ownerId}`, json);
    } catch {
      const cached = await all("leases");
      const fallback = cached.find((x: any) => Array.isArray(x) && x[0] && x[0].id) || [];
      setStatements(fallback);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const exportCSV = async (s: Statement) => {
    try {
      const csv = `Owner Statement\nPeriod,${s.periodStart} to ${s.periodEnd}\nIncome,${s.totalIncome}\nExpense,${s.totalExpense}\nNet,${s.netIncome}`;
      const path = `${FileSystem.documentDirectory}statement-${s.id}.csv`;
      await FileSystem.writeAsStringAsync(path, csv);
      await Sharing.shareAsync(path);
    } catch (e: any) {
      Alert.alert("Export failed", e?.message || "Could not export CSV");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Owner Statements</Text>
      <FlatList
        data={statements}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => exportCSV(item)} style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
            <Text>
              {new Date(item.periodStart).toLocaleDateString()} – {new Date(item.periodEnd).toLocaleDateString()}
            </Text>
            <Text>Net: ${item.netIncome}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
