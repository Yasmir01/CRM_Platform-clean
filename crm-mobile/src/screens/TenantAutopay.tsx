import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Switch } from "react-native";
import { Picker } from "react-native";
import { upsert, queueForSync } from "../storage/repository";

export default function TenantAutopay() {
  const [enabled, setEnabled] = useState(false);
  const [amount, setAmount] = useState("1000");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [nextRun, setNextRun] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    // Load current rule if available
  }, []);

  const saveRule = async () => {
    const payload = { leaseId: "lease1", tenantId: "tenant1", amount, frequency, nextRun };
    await upsert("leases", "autopay", payload);
    await queueForSync("autopay", payload);
    setEnabled(true);
    alert("Autopay saved (will sync online)");
  };

  const cancelRule = async () => {
    const payload = { ruleId: "autopay", action: "cancel" };
    await queueForSync("autopay_cancel", payload);
    setEnabled(false);
    alert("Autopay cancelled (pending sync)");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Autopay</Text>
      <Text>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
        keyboardType="numeric"
      />
      <Text>Frequency</Text>
      <Picker selectedValue={frequency} onValueChange={(v) => setFrequency(String(v))}>
        <Picker.Item label="Weekly" value="WEEKLY" />
        <Picker.Item label="Biweekly" value="BIWEEKLY" />
        <Picker.Item label="Monthly" value="MONTHLY" />
      </Picker>
      <Text>Next Run: {nextRun}</Text>

      <View style={{ marginVertical: 20 }}>
        <Switch value={enabled} onValueChange={(v) => (v ? saveRule() : cancelRule())} />
        <Text>{enabled ? "Enabled" : "Disabled"}</Text>
      </View>

      <Button title="Save Autopay" onPress={saveRule} />
      <Button title="Cancel Autopay" onPress={cancelRule} color="red" />
    </View>
  );
}
