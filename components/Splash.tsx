import React, { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

import Logo from "./Logo";
import Title from "./Title";

import { Puzzle as PuzzleType, Profile as ProfileType } from "../types";

export default ({
  theme,
  setReceivedPuzzles,
  setSentPuzzles,
  profile,
  setProfile,
  navigation,
}: {
  theme: any;
  setReceivedPuzzles: (puzzles: PuzzleType[]) => void;
  setSentPuzzles: (puzzles: PuzzleType[]) => void;
  profile: ProfileType | null;
  setProfile: (profile: ProfileType) => void;
  navigation: any;
}) => {
  useEffect(() => {
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
      //load the puzzles stored locally
      await loadPuzzles();
      //if you have a profile, navigate home
      if (profile) {
        // navigation.navigate("Home");
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );
      } else {
        //otherwise, load profile from local storage if it exists
        const loadedProfile = await loadProfile();
        if (loadedProfile) {
          setProfile(loadedProfile);
          // navigation.navigate("Home");
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          );
        } else {
          //or navigate to createprofile if it doesn't exist
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "CreateProfile" }],
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
      <ActivityIndicator
        animating={true}
        color={theme.colors.text}
        size="large"
      />
    </View>
  );
};
