import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { DateData } from "react-native-calendars/src/types";
import Toast from "react-native-root-toast";

import { functions } from "../FirebaseApp";
import { Puzzle, ScreenNavigation } from "../types";

interface DailyDate {
  [key: string]: { selected: boolean; puzzle: Puzzle };
}

export default function DateSelect({
  navigation,
  addToCalendar,
}: {
  navigation: ScreenNavigation;
  addToCalendar?: (date: string) => Promise<void>;
}): JSX.Element {
  const [markedDates, setMarkedDates] = useState<DailyDate>({});

  const loadDailies = async (monthData: DateData) => {
    try {
      const getDailyDates = functions.httpsCallable("getDailyDates");
      const res = await getDailyDates(monthData);
      const foundDailies: Puzzle[] = res.data;
      const newDates: DailyDate = {};
      for (let i = 0; i < foundDailies.length; i++) {
        const daily = foundDailies[i];
        if (daily.dailyDate)
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
    <Calendar
      style={{ margin: 10 }}
      markedDates={markedDates}
      onDayPress={(day) => {
        if (addToCalendar) {
          if (!markedDates[day.dateString]) {
            addToCalendar(day.dateString);
          } else {
            Toast.show("Pick unoccupied date", {
              duration: Toast.durations.SHORT,
              position: Toast.positions.CENTER,
            });
          }
        } else {
          if (markedDates[day.dateString]) {
            const { puzzle } = markedDates[day.dateString];
            navigation.navigate("GalleryReview", {
              puzzle,
              daily: true,
            });
          }
        }
      }}
      onVisibleMonthsChange={(months) => {
        loadDailies(months[0]);
      }}
    />
  );
}
