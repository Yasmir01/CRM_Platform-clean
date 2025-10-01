import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { queueForSync } from "../storage/repository";

type Message = {
  id: string;
  author?: string;
  body: string;
  createdAt: string;
  attachmentUrl?: string;
};

export default function WorkOrderChat({ route }: any) {
  const { workOrderId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setMessages([
      {
        id: "m1",
        author: "Tenant",
        body: "Please fix ASAP",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Math.random().toString(),
      author: "Me",
      body: text,
      createdAt: new Date().toISOString(),
    };
    setMessages([msg, ...messages]);
    await queueForSync("workorder_message", { workOrderId, body: text });
    setText("");
  };

  const sendPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const msg: Message = {
        id: Math.random().toString(),
        author: "Me",
        body: "[Photo]",
        createdAt: new Date().toISOString(),
        attachmentUrl: result.assets[0].uri,
      };
      setMessages([msg, ...messages]);
      await queueForSync("workorder_message", {
        workOrderId,
        file: result.assets[0].uri,
      });
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        inverted
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}>
              {item.author || "User"} — {new Date(item.createdAt).toLocaleString()}
            </Text>
            {item.attachmentUrl ? (
              <Image source={{ uri: item.attachmentUrl }} style={{ width: 120, height: 120 }} />
            ) : null}
            <Text>{item.body}</Text>
          </View>
        )}
      />

      <TextInput
        placeholder="Write a message..."
        value={text}
        onChangeText={setText}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <Button title="Send" onPress={sendMessage} />
      <Button title="Send Photo" onPress={sendPhoto} />
    </View>
  );
}
