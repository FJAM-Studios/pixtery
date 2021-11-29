import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { DateData } from "react-native-calendars/src/types";
import { ActivityIndicator, Text } from "react-native-paper";

import { functions } from "../FirebaseApp";
import { DailyDate, Puzzle } from "../types";
import { convertIntToDoubleDigitString } from "../util";

export default function DateSelect({
  onMarkedDayPress,
  onUnmarkedDayPress,
}: {
  onMarkedDayPress: (date: string, markedDates: DailyDate) => void;
  onUnmarkedDayPress: (date: string) => void;
}): JSX.Element {
  const [markedDates, setMarkedDates] = useState<DailyDate>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDailies = async (visibleMonthData: DateData) => {
    try {
      const getDailyDates = functions.httpsCallable("getDailyDates");
      // pass in year / month as strings formatted as in firestore
      const formattedDates = {
        year: visibleMonthData.year.toString(),
        // need to add 0 at the front of string if single digit to match firestore
        month: convertIntToDoubleDigitString(visibleMonthData.month),
      };
      const res = await getDailyDates(formattedDates);
      const foundDailies: { puzzleData: Puzzle; day: string }[] = res.data;
      const newDates: DailyDate = {};
      for (let i = 0; i < foundDailies.length; i++) {
        const dailyPixteryWithDay = foundDailies[i];
        const { puzzleData, day } = dailyPixteryWithDay;
        const dateOfDaily = `${formattedDates.year}-${formattedDates.month}-${day}`;
        newDates[dateOfDaily] = { selected: true, puzzle: puzzleData };
      }
      setMarkedDates(newDates);
    } catch (e) {
      console.log(e);
      setError(true);
    }
    setLoading(false);
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
  if (loading) return <ActivityIndicator size="small" />;
  if (error) return <Text>Sorry, something went wrong.</Text>;
  return (
    <Calendar
      style={{ margin: 10 }}
      markedDates={markedDates}
      onDayPress={(day) => {
        if (markedDates[day.dateString])
          onMarkedDayPress(day.dateString, markedDates);
        else onUnmarkedDayPress(day.dateString);
      }}
      onVisibleMonthsChange={(months) => {
        loadDailies(months[0]);
      }}
    />
  );
}
