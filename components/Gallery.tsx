import { AdMobInterstitial } from "expo-ads-admob";
import * as FileSystem from "expo-file-system";
import moment from "moment-timezone";
import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { ActivityIndicator, Button, Headline, Text } from "react-native-paper";
import { useSelector } from "react-redux";

import { functions } from "../FirebaseApp";
import { INTERSTITIAL_ID, DAILY_TIMEZONE } from "../constants";
import { Puzzle, RootState, ScreenNavigation } from "../types";
import { msToTime, convertIntToDoubleDigitString } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);

export default function Gallery({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const { boardSize } = useSelector((state: RootState) => state.screenHeight);
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<Puzzle | null>(null);
  const [time, setTime] = useState<null | number>(null);

  const getCountdown = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    // uncomment the code below to test time/date change, simulates being 1 min before end of day
    //now.setUTCHours(24, -1);
    const time = tomorrow.getTime() - now.getTime();
    if (time <= 1000) loadDaily();
    setTime(time);
  };

  const loadDaily = async () => {
    setLoading(true);
    const getDaily = functions.httpsCallable("getDaily");
    try {
      // daily timezone is currently set to EST
      const todayInDailyTimezone = moment().tz(DAILY_TIMEZONE);
      const res = await getDaily({
        year: todayInDailyTimezone.year().toString(),
        // month is indexed from 0
        month: convertIntToDoubleDigitString(todayInDailyTimezone.month() + 1),
        day: convertIntToDoubleDigitString(todayInDailyTimezone.date()),
      });
      const daily = res.data;
      if (daily) {
        // think we don't need to do this if not showing blurred image here
        // await downloadImage(daily);
        setDaily(daily);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const incrementTime = setInterval(() => {
      getCountdown();
    }, 1000);

    loadDaily();

    return () => clearInterval(incrementTime);
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
        <Headline>Daily Pixtery</Headline>
        <View style={{ flex: 1, alignContent: "center", margin: 10 }}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : daily ? (
            <TouchableOpacity
              onPress={async () => {
                setLoading(true);
                const { publicKey } = daily;
                AdMobInterstitial.addEventListener(
                  "interstitialDidClose",
                  () => {
                    AdMobInterstitial.removeAllListeners();
                    navigation.navigate("AddPuzzle", {
                      publicKey,
                      sourceList: "received",
                    });
                  }
                );
                AdMobInterstitial.addEventListener(
                  "interstitialDidFailToLoad",
                  () => {
                    AdMobInterstitial.removeAllListeners();
                    navigation.navigate("AddPuzzle", {
                      publicKey,
                      sourceList: "received",
                    });
                  }
                );
                try {
                  //make it so we don't have to watch ads in dev
                  if (process.env.NODE_ENV !== "development") {
                    await AdMobInterstitial.requestAdAsync();
                    await AdMobInterstitial.showAdAsync();
                  } else {
                    navigation.navigate("AddPuzzle", {
                      publicKey,
                      sourceList: "received",
                    });
                  }
                } catch (error) {
                  // go to the puzzle if there's an ad error
                  navigation.navigate("AddPuzzle", {
                    publicKey,
                    sourceList: "received",
                  });
                  console.log(error);
                }
              }}
            >
              <View
                style={{
                  width: boardSize * 0.8,
                  height: boardSize * 0.8,
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  backgroundColor: "grey",
                  borderRadius: theme.roundness,
                  opacity: 0.8,
                }}
              >
                <Text style={{ fontSize: 20 }}>Touch to solve!</Text>
                <Text style={{ fontSize: 20 }}>
                  Today&apos;s Pixtery expires in:
                </Text>
                {time ? (
                  <Text style={{ fontSize: 20 }}>{msToTime(time)}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                width: boardSize * 0.8,
                height: boardSize * 0.8,
                alignItems: "center",
                justifyContent: "space-evenly",
                backgroundColor: "grey",
                borderRadius: theme.roundness,
                opacity: 0.8,
              }}
            >
              <Text style={{ fontSize: 20 }}>
                We must be asleep! No Daily today :(
              </Text>
              <Text style={{ fontSize: 20 }}>Check back in:</Text>
              {time ? (
                <Text style={{ fontSize: 20 }}>{msToTime(time)}</Text>
              ) : null}
            </View>
          )}
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
            Suggest a Daily Pixtery!
          </Button>
        </View>
      </View>
    </AdSafeAreaView>
  );
}
