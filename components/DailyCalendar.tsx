import React from "react";
import { View } from "react-native";
import { Headline, IconButton } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState, ScreenNavigation } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import DateSelect from "./DateSelect";
import Header from "./Header";

export default function DailyCalendar({
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
        <Headline>Daily Calendar</Headline>

        <View
          style={{ flex: 1, alignContent: "center", justifyContent: "center" }}
        >
          <DateSelect navigation={navigation} />
          <IconButton
            icon="arrow-left"
            size={20}
            style={{ backgroundColor: theme.colors.primary }}
            onPress={() => {
              navigation.navigate("GalleryQueue");
            }}
          />
        </View>
      </View>
    </AdSafeAreaView>
  );
}
