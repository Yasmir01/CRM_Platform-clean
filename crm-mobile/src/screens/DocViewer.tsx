import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function DocViewer({ route }: any) {
  const { localPath } = route.params;
  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: localPath }} />
    </View>
  );
}
