import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import React, { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { Puzzle as PuzzleType, Profile as ProfileType } from "../types";
import Logo from "./Logo";
import Title from "./Title";

export default function Splash({
  theme,
  setReceivedPuzzles,
  setSentPuzzles,
  profile,
  setProfile,
  navigation,
  route,
}: {
  theme: any;
  setReceivedPuzzles: (puzzles: PuzzleType[]) => void;
  setSentPuzzles: (puzzles: PuzzleType[]) => void;
  profile: ProfileType | null;
  setProfile: (profile: ProfileType) => void;
  navigation: any;
  route?: any;
}): JSX.Element {
  useEffect(() => {
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      return url;
    };

    const loadProfile = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@pixteryProfile");
        const loadedProfile = jsonValue != null ? JSON.parse(jsonValue) : null;
        return loadedProfile;
      } catch (e) {
        console.log(e);
      }
    };
    const loadPuzzles = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@pixteryPuzzles");
        const jsonValueSent = await AsyncStorage.getItem("@pixterySentPuzzles");
        const loadedPuzzles = jsonValue != null ? JSON.parse(jsonValue) : [];
        const loadedSentPuzzles =
          jsonValueSent != null ? JSON.parse(jsonValueSent) : [];
        //should probably do something here to make sure all local puzzles also have local images
        //and, if not, try to get them from server, and if they don't exist there, then delete puzzle
        //or otherwise mark it as invalid somehow
        setReceivedPuzzles(loadedPuzzles);
        setSentPuzzles(loadedSentPuzzles);
      } catch (e) {
        console.log(e);
      }
    };

    const loadAppData = async () => {
      //first get the url that was either passed in by the url event listener or by the url used to open the app, this will be sed regardless of whether you have a profile
      const url =
        route.params && route.params.url
          ? route.params.url
          : await getInitialUrl();
      //if you are logged in, load local puzzles, then either navigate to AddPuzzle or Home if there is no url
      if (profile) {
        await loadPuzzles();
        console.log("params", route.params)
        if (url)
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "AddPuzzle", params: { url } }],
            })
          );
        else {
          // navigation.navigate("Home");
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          );
        }
      } else {
        //otherwise, load profile from local storage if it exists
        const loadedProfile = await loadProfile();
        if (loadedProfile) {
          setProfile(loadedProfile);
        } else {
          //or navigate to createprofile if it doesn't exist, pass the url to create profile so it can be forwarded along, and you can go directly to the puzzle after signing in.
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "CreateProfile", params: { url } }],
            })
          );
        }
      }
    };

    loadAppData();
  }, [profile]);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Logo width="100" height="100" />
      <Title width="100" height="35" />
      <ActivityIndicator animating color={theme.colors.text} size="large" />
    </View>
  );
};
