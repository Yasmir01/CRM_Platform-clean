import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemedButton({ title, onPress }: { title: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, { backgroundColor: theme.accent }]}>
      <Text style={[styles.text, { color: "#fff" }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 6 },
  text: { fontSize: 16, fontWeight: "600" },
});
