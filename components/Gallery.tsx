import * as FileSystem from "expo-file-system";
import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { ActivityIndicator, Button, Headline, Text } from "react-native-paper";
import { useSelector } from "react-redux";

import { functions } from "../FirebaseApp";
import { Puzzle, RootState, ScreenNavigation } from "../types";
import { downloadImage } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

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
  useEffect(() => {
    const loadDaily = async () => {
      const getDaily = functions.httpsCallable("getDaily");
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await getDaily({ today });
        const daily = res.data[0];
        if (daily) {
          await downloadImage(daily);
          setDaily(daily);
        }
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    loadDaily();
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
        {!loading && daily ? (
          <Text style={{ fontSize: 20 }}>Touch to solve!</Text>
        ) : null}
        <View style={{ flex: 1, alignContent: "center", margin: 10 }}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : daily ? (
            <TouchableOpacity
              onPress={() => {
                const { publicKey } = daily;
                navigation.navigate("AddPuzzle", {
                  publicKey,
                  sourceList: "received",
                });
              }}
            >
              <Image
                source={{
                  uri: FileSystem.documentDirectory + daily.imageURI,
                }}
                style={{
                  width: boardSize * 0.8,
                  height: boardSize * 0.8,
                }}
                blurRadius={boardSize * 0.03}
              />
            </TouchableOpacity>
          ) : (
            <Text>We must be asleep! No Daily today :(</Text>
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
