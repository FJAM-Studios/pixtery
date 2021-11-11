import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { DateData } from "react-native-calendars/src/types";
import { Headline, IconButton } from "react-native-paper";
import { useSelector } from "react-redux";

import { functions } from "../FirebaseApp";
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

  const [markedDates, setMarkedDates] = useState<any>({});

  const loadDailies = async (monthData: DateData) => {
    try {
      const getDailyDates = functions.httpsCallable("getDailyDates");
      const res = await getDailyDates(monthData);
      const foundDailies = res.data;
      const newDates: any = {};
      for (let i = 0; i < foundDailies.length; i++) {
        const daily = foundDailies[i];
        newDates[daily.dailyDate] = { selected: true, puzzle: daily };
      }
      setMarkedDates(newDates);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthData: DateData = {
      dateString: firstDay.toISOString().split("T")[0],
      day: firstDay.getDay(),
      month: firstDay.getMonth() + 1,
      year: firstDay.getFullYear(),
      timestamp: 0,
    };
    loadDailies(monthData);
  }, []);
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
