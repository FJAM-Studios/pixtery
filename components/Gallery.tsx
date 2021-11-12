import React, { useState } from "react";
import { View } from "react-native";
import { Button, Headline, Text } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState, ScreenNavigation } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

export default function Gallery({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  return (
    <AdSafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
      }}
    >
      <Header
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <View
        style={{
          flexDirection: "column",
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <Headline>Gallery</Headline>
        <View
          style={{ flex: 1, alignContent: "center", justifyContent: "center" }}
        >
          <Text>Gallery Content Here</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            position: "absolute",
            bottom: 10,
            alignItems: "center",
          }}
        >
          <Button
            icon="brush"
            mode="contained"
            onPress={() => {
              navigation.navigate("AddToGallery");
            }}
            // style={{ margin: 5 }}
          >
            Submit To The Gallery!
          </Button>
        </View>
      </View>
    </AdSafeAreaView>
  );
}
