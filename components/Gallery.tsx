import { AdMobInterstitial } from "expo-ads-admob";
import firebase from "firebase";
import { DateTime } from "luxon";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { ActivityIndicator, Button, Headline, Text } from "react-native-paper";
import Toast from "react-native-root-toast";
import { useSelector } from "react-redux";

import { functions } from "../FirebaseApp";
import { INTERSTITIAL_ID, DAILY_TIMEZONE } from "../constants";
import { RootState, ScreenNavigation, SignInOptions } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import Timer from "./Timer";

AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);

export default function Gallery({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const { width, height } = useSelector(
    (state: RootState) => state.screenHeight
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const suggestPixtery = () => {
    if (
      firebase.auth().currentUser &&
      !firebase.auth().currentUser?.isAnonymous
    ) {
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
    const now = DateTime.now().setZone(DAILY_TIMEZONE);
    const tomorrow = now.plus({ days: 1 }).startOf("day");
    const time = tomorrow.diff(now, "milliseconds").toMillis();
    if (time <= 1000) setError(null);
    return time;
  };

  const [time, setTime] = useState<null | number>(getCountdown());

  const loadDaily = async () => {
    setLoading(true);
    const getDaily = functions.httpsCallable("getDaily");
    try {
      // cloud function will tell you today's Daily instead of client
      const res = await getDaily();
      const daily = res.data;
      if (daily && daily.publicKey) {
        const { publicKey } = daily;
        AdMobInterstitial.addEventListener("interstitialDidClose", () => {
          AdMobInterstitial.removeAllListeners();
          navigation.navigate("AddPuzzle", {
            publicKey,
            sourceList: "received",
          });
        });
        AdMobInterstitial.addEventListener("interstitialDidFailToLoad", () => {
          AdMobInterstitial.removeAllListeners();
          navigation.navigate("AddPuzzle", {
            publicKey,
            sourceList: "received",
          });
        });

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
      } else {
        setError("Sorry! No Daily Pixtery today.");
      }
    } catch (e) {
      setError("Sorry! Something went wrong.");
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const incrementTime = setInterval(() => {
      setTime(getCountdown());
    }, 1000);
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
        <View style={{ flex: 1, alignContent: "center" }}>
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
              {time ? (
                <TouchableOpacity
                  onPress={loadDaily}
                  style={{
                    backgroundColor: theme.colors.primary,
                    padding: 15,
                    borderRadius: theme.roundness,
                  }}
                >
                  <Timer time={time} />
                  <Text
                    style={{ fontSize: 20, marginTop: 15, textAlign: "center" }}
                  >
                    Touch To Solve!
                  </Text>
                </TouchableOpacity>
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
            onPress={suggestPixtery}
            style={{
              margin: 20,
              width: width * 0.8,
              paddingTop: height * 0.01,
              paddingBottom: height * 0.01,
            }}
          >
            Submit a Daily Pixtery!
          </Button>
        </View>
      </View>
    </AdSafeAreaView>
  );
}
