import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { api, setToken } from "../services/api";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const doLogin = async () => {
    try {
      const user = await api.login(email, password);
      // if backend returned token via cookie only, try fetch session endpoint (best-effort)
      // navigation to Contacts
      navigation.replace("Contacts");
    } catch (e: any) {
      setError(e.message || "Login failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 6 }}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
      <Text style={{ marginBottom: 6 }}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
      {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}
      <Button title="Login" onPress={doLogin} />
    </View>
  );
}
