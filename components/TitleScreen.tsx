// this component is purely presentational to give the stack navigator something to show while it waits for the navigation container to finish initializing

import React from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import Logo from "./Logo";
import Title from "./Title";

export default function TiteScreen({ theme }: { theme: any }): JSX.Element {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Logo width="100" height="100" />
      <Title width="100" height="35" />
      <ActivityIndicator animating color={theme.colors.text} size="large" />
    </View>
  );
}