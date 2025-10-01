import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useTheme } from "../../src/crm/contexts/ThemeContext";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setOffline(!s.isConnected));
    return () => unsub();
  }, []);

  if (!offline) return null;
  return (
    <View style={{ backgroundColor: "red", padding: 4 }}>
      <Text style={{ color: "white", textAlign: "center" }}>Offline – changes will sync later</Text>
    </View>
  );
}
