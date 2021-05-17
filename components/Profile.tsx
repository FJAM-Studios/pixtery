import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { setProfile } from "../store/reducers/profile";
import { setReceivedPuzzles } from "../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../store/reducers/sentPuzzles";
import { ScreenNavigation, RootState } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

export default function Profile({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const profile = useSelector((state: RootState) => state.profile);
  console.log(profile);
  const [name, setName] = useState((profile && profile.name) || "");
  const [errors, setErrors] = useState("");
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
        <TextInput value={name} onChangeText={(name) => setName(name)} />
        <Button
          icon="camera-iris"
          mode="contained"
          onPress={async () => {
            //probably want to do some further username error checking
            if (name.length) {
              //save to local storage
              await AsyncStorage.setItem(
                "@pixteryProfile",
                JSON.stringify({ name })
              );
              //update app state
              dispatch(setProfile({ name }));
            } else {
              setErrors("You must enter a name!");
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
            dispatch(setProfile(null));
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
            dispatch(setReceivedPuzzles([]));
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
            dispatch(setSentPuzzles([]));
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
