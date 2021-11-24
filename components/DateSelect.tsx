import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { DateData } from "react-native-calendars/src/types";
import Toast from "react-native-root-toast";

import { functions } from "../FirebaseApp";
import { ScreenNavigation } from "../types";

export default function DateSelect({
  navigation,
  addToCalendar,
}: {
  navigation: ScreenNavigation;
  addToCalendar?: (date: string) => Promise<void>;
}): JSX.Element {
  const [markedDates, setMarkedDates] = useState<any>({});

  const loadDailies = async (visibleMonthData: DateData) => {
    try {
      const getDailyDates = functions.httpsCallable("getDailyDates");
      // need to add 0 at the front of string if single digit to match firestore
      const monthOfDaily =
        visibleMonthData.month >= 10
          ? visibleMonthData.month.toString()
          : `0${visibleMonthData.month}`;
      // pass in year / month as strings formatted as in firestore
      const res = await getDailyDates({
        year: visibleMonthData.year.toString(),
        month: monthOfDaily,
      });
      const foundDailies = res.data;
      const newDates: any = {};
      for (let i = 0; i < foundDailies.length; i++) {
        const dailyPixteryWithDay = foundDailies[i];
        const daily = dailyPixteryWithDay.puzzleData;
        const dayOfDaily = dailyPixteryWithDay.day;

        const dateOfDaily = `${visibleMonthData.year}-${monthOfDaily}-${dayOfDaily}`;
        newDates[dateOfDaily] = { selected: true, puzzle: daily };
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
