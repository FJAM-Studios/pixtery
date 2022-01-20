import React from "react";
import { View } from "react-native";
import { Headline, IconButton } from "react-native-paper";
import Toast from "react-native-root-toast";
import { useSelector } from "react-redux";

import {
  DailyDate,
  RootState,
  ScreenNavigation,
  StatusOfDaily,
} from "../../types";
import { DateSelect } from "../InteractiveElements";
import { AdSafeAreaView, Header } from "../Layout";

export default function DailyCalendar({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );

  const onUnmarkedDayPress = (dailyDate: string) => {
    Toast.show("Nothing on that date", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
    });
  };

  const onMarkedDayPress = (dateString: string, markedDates: DailyDate) => {
    const { puzzle } = markedDates[dateString];
    navigation.navigate("GalleryReview", {
      puzzle,
      statusOfDaily: StatusOfDaily.PUBLISHED,
      publishedDate: dateString,
    });
  };

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
          <DateSelect
            onMarkedDayPress={onMarkedDayPress}
            onUnmarkedDayPress={onUnmarkedDayPress}
          />
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