import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignSelf: "center",
        backgroundColor: "red",
        width: "95%",
      }}
    >
      <Text>Test</Text>
    </SafeAreaView>
  );
};
