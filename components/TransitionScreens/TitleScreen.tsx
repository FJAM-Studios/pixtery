// this component is purely presentational to give the stack navigator something to show while it waits for the navigation container to finish initializing

import React from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";

import { RootState } from "../../types";
import { Logo, Title } from "../StaticElements";

export default function TitleScreen(): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
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
    </View>
  );
}
