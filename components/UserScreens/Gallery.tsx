import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone"; // dependent on utc plugin
import utc from "dayjs/plugin/utc";
import { AdMobInterstitial } from "expo-ads-admob";
import { useState, useCallback } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import Toast from "react-native-root-toast";
import { useDispatch, useSelector } from "react-redux";

import { auth, getDaily } from "../../FirebaseApp";
import { INTERSTITIAL_ID, DAILY_TIMEZONE } from "../../constants";
import { setDailyStatus } from "../../store/reducers/dailyStatus";
import { RootState, DailyContainerProps } from "../../types";
import { Timer } from "../InteractiveElements";
import { AdSafeAreaView } from "../Layout";
AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);

export default function Gallery({
  navigation,
}: DailyContainerProps<"Gallery">): JSX.Element {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const { width, height } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const suggestPixtery = () => {
    if (auth.currentUser && !auth.currentUser?.isAnonymous) {
      navigation.navigate("AddToGallery");
    } else {
      Toast.show(
        "You must be signed in to submit a Daily Pixtery. Go to the Profile menu to sign in.",
        {
          duration: Toast.durations.LONG,
          position: Toast.positions.CENTER,
        }
      );
    }
  };

  const getCountdown = (): number => {
    const now = dayjs().tz(DAILY_TIMEZONE);
    const tomorrow = now.clone().add(1, "day").startOf("day");
    const time = tomorrow.diff(now, "milliseconds");
    if (time <= 1000) setError(null);
    return time;
  };

  // const [time, setTime] = useState<null | number>(getCountdown());
  let time = getCountdown();
  const todayString = dayjs().startOf("day").toString();

  const loadDaily = async () => {
    setLoading(true);
    // AdMobInterstitial.removeAllListeners();
    try {
      // cloud function will tell you today's Daily instead of client
      const daily = (await getDaily()).data as Puzzle;
      if (daily && daily.publicKey) {
        navigation.navigate("LibraryContainer", {
          screen: "AddPuzzle",
          params: { daily, sourceList: "received" },
        });
      } else {
        setError("Sorry! No Daily Pixtery today.");
      }
    } catch (e) {
      setError("Sorry! Something went wrong.");
      console.log(e);
    }
    setLoading(false);
    AsyncStorage.setItem("@dailyStatus", todayString);
    dispatch(setDailyStatus(todayString));
  };

  const showAd = async () => {
    setLoading(true);
    try {
      await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
      await AdMobInterstitial.showAdAsync();
    } catch (error) {
      console.log(error);
    }
    loadDaily();
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      const incrementTime = setInterval(() => {
        time = getCountdown();
      }, 1000);
      return () => clearInterval(incrementTime);
    }, [])
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
      <View
        style={{
          flexDirection: "column",
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <View style={{ flex: 3, alignContent: "center" }}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, margin: 20 }}>
                {error ? (
                  <Text
                    style={{ fontSize: 20, textAlign: "center" }}
                  >{`${error}\nCheck back in:`}</Text>
                ) : (
                  "Today's Pixtery expires in:"
                )}
              </Text>
              {time ? <Timer time={time} /> : null}
            </View>
          )}
        </View>
        <View
          style={{
            flex: 2,
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Button
            icon="ticket"
            mode="contained"
            onPress={showAd}
            style={{
              margin: 10,
              width: width * 0.8,
              paddingTop: height * 0.01,
              paddingBottom: height * 0.01,
            }}
          >
            Solve today&apos;s Daily Pixtery!
          </Button>
          <Text style={{ fontSize: 17 }}> or </Text>
          <Button
            icon="send"
            mode="contained"
            onPress={suggestPixtery}
            style={{
              margin: 10,
              width: width * 0.8,
              paddingTop: height * 0.01,
              paddingBottom: height * 0.01,
            }}
          >
            Submit Your Own Pixtery!
          </Button>
        </View>
      </View>
    </AdSafeAreaView>
  );
}
