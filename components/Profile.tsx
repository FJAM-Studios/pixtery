import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Headline, Text, TextInput, Button } from "react-native-paper";

import { MIN_NAME_LENGTH } from "../constants";
import { Profile as ProfileType, Puzzle } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

export default function Profile({
  theme,
  profile,
  setProfile,
  navigation,
  receivedPuzzles,
  sentPuzzles,
  setSentPuzzles,
  setReceivedPuzzles,
}: {
  theme: any;
  profile: ProfileType | null;
  setProfile: (profile: ProfileType | null) => void;
  navigation: any;
  receivedPuzzles: Puzzle[];
  sentPuzzles: Puzzle[];
  setReceivedPuzzles: (puzzles: Puzzle[]) => void;
  setSentPuzzles: (puzzles: Puzzle[]) => void;
}): JSX.Element {
  const [name, setName] = useState((profile && profile.name) || "");
  const [errors, setErrors] = useState("");
  // we can use the same pattern for rotation enable and any other profile features
  const updateName = (name: string) => {
    setName(name);
    if (name.length >= MIN_NAME_LENGTH && profile) {
      setProfile({ ...profile, name });
      setErrors("");
    } else
      setErrors(
        `Must enter at least ${MIN_NAME_LENGTH} character${
          MIN_NAME_LENGTH > 1 ? "s" : ""
        }!`
      );
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
        theme={theme}
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flexDirection: "column",
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Headline>Change Your Pixtery Profile</Headline>
        </View>
        <Text>Name</Text>
        <TextInput value={name} onChangeText={(name) => updateName(name)} />
        {errors.length ? (
          <Text
            style={{ color: "red", fontSize: 20, backgroundColor: "white" }}
          >
            {errors}
          </Text>
        ) : null}
        <Button
          icon="logout"
          mode="contained"
          onPress={async () => {
            //delete local storage
            await AsyncStorage.removeItem("@pixteryProfile");
            //update app state
            setProfile(null);
            //send you to splash
            navigation.navigate("Splash");
          }}
          style={{ margin: 10 }}
        >
          Log Out
        </Button>
        <Button
          icon="delete"
          mode="contained"
          disabled={receivedPuzzles.length === 0}
          onPress={async () => {
            //delete local storage
            await AsyncStorage.removeItem("@pixteryPuzzles");
            //update app state
            setReceivedPuzzles([]);
            //send you to splash
          }}
          style={{ margin: 10 }}
        >
          Delete Received Puzzles
        </Button>
        <Button
          icon="delete"
          mode="contained"
          disabled={sentPuzzles.length === 0}
          onPress={async () => {
            //delete local storage
            await AsyncStorage.removeItem("@pixterySentPuzzles");
            //update app state
            setSentPuzzles([]);
            //send you to splash
          }}
          style={{ margin: 10 }}
        >
          Delete Sent Puzzles
        </Button>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
