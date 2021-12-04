import { AdMobInterstitial } from "expo-ads-admob";
import React, { useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Headline, Text } from "react-native-paper";
import { useSelector } from "react-redux";

import { functions } from "../FirebaseApp";
import { INTERSTITIAL_ID } from "../constants";
import { RootState, ScreenNavigation } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Clock from "./Clock";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

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
        setError("Sorry! There's no daily today.");
      }
    } catch (e) {
      setError("Sorry! Something went wrong.");
      console.log(e);
    }
    setLoading(false);
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
        <Headline>Daily Pixtery</Headline>
        <View
          style={{
            alignItems: "center",
            flex: 1,
            width: "100%",
          }}
        >
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View
              style={{
                alignItems: "center",
                flex: 1,
                width: "100%",
              }}
            >
              {error ? (
                <Text style={{ fontSize: 20 }}>{error}</Text>
              ) : (
                <Button
                  icon="image-multiple"
                  mode="contained"
                  onPress={loadDaily}
                  style={{ margin: 10, padding: 20 }}
                >
                  Touch to solve!
                </Button>
              )}
              <Text style={{ fontSize: 20 }}>
                {error ? "Check back in:" : "Today's Pixtery expires in:"}
              </Text>
              <Clock setError={setError} />
            </View>
          )}
          <View>
            <Button
              icon="brush"
              mode="contained"
              onPress={() => {
                navigation.navigate("AddToGallery");
              }}
              style={{ margin: 10, padding: 20 }}
            >
              Suggest a Daily Pixtery!
            </Button>
          </View>
        </View>
      </View>
    </AdSafeAreaView>
  );
}
