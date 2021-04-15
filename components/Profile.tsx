import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AdMobBanner } from "expo-ads-admob";

import Header from "./Header";

import { Profile as ProfileType, Puzzle } from "../types";
import { View } from "react-native";
import { BANNER_ID } from "../constants";

export default ({
  theme,
  profile,
  setProfile,
  navigation,
  receivedPuzzles,
  setReceivedPuzzles,
}: {
  theme: any;
  profile: ProfileType | null;
  setProfile: (profile: ProfileType | null) => void;
  navigation: any;
  receivedPuzzles: Puzzle[];
  setReceivedPuzzles: (puzzles: Puzzle[]) => void;
}) => {
  const [name, setName] = useState((profile && profile.name) || "");
  const [phone, setPhone] = useState((profile && profile.phone) || "");
  const [errors, setErrors] = useState("");
  return (
    <SafeAreaView
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
      <TextInput value={name} onChangeText={(name) => setName(name)} />
      <Text>Phone Number</Text>
      <TextInput value={phone} onChangeText={(phone) => setPhone(phone)} />
      <Button
        icon="camera-iris"
        mode="contained"
        onPress={async () => {
          //probably want to do some further username error checking, nicer phone # entry, etc.
          if (name.length && phone.length) {
            //save to local storage
            await AsyncStorage.setItem(
              "@pixteryProfile",
              JSON.stringify({ name, phone })
            );
            //update app state
            setProfile({ name, phone });
          } else {
            setErrors("Must enter name and number!");
          }
        }}
        style={{ margin: 10 }}
      >
        Save
      </Button>
      {errors.length ? <Text>{errors}</Text> : null}
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
        Delete Local Puzzle Store
      </Button>
      <AdMobBanner bannerSize="smartBannerPortrait" adUnitID={BANNER_ID} />
    </SafeAreaView>
  );
};
