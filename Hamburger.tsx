import React from "react";
import { View } from "react-native";
import { IconButton, Title } from "react-native-paper";

export default ({ notifications }: { notifications: number }) => {
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <Title>Pixtery!</Title>
      <IconButton icon="menu" />
    </View>
  );
};
