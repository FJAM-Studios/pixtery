import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Headline,
  Text,
  TextInput,
  Button,
  Switch,
  IconButton,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { signOut } from "../FirebaseApp";
import { VERSION_NUMBER } from "../constants";
import { setProfile } from "../store/reducers/profile";
import { setReceivedPuzzles } from "../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../store/reducers/sentPuzzles";
import { setTutorialFinished } from "../store/reducers/tutorialFinished";
import { ScreenNavigation, RootState } from "../types";
import {
  safelyDeletePuzzleImage,
  restorePuzzles,
  deactivateAllPuzzlesOnServer,
} from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import ThemeSelector from "./ThemeSelector";

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
  const [name, setName] = useState((profile && profile.name) || "");
  const [noSound, setNoSound] = useState((profile && profile.noSound) || false);
  const [errors, setErrors] = useState("");
  const [restoring, setRestoring] = useState(false);

  const toggleSound = async () => {
    //save to local storage
    await AsyncStorage.setItem(
      "@pixteryProfile",
      JSON.stringify({ ...profile, noSound: !noSound })
    );
    //update app state
    dispatch(setProfile({ ...profile, noSound: !noSound }));
    setNoSound(!noSound);
  };
  const [selectingTheme, setSelectingTheme] = useState(false);

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
        <View
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            marginVertical: 10,
          }}
        >
          <IconButton icon="volume-high" />
          <Text>Off</Text>
          <Switch
            value={!noSound}
            onValueChange={toggleSound}
            style={{ marginHorizontal: 10 }}
          />
          <Text>On</Text>
        </View>
        <Button
          icon="palette"
          mode="contained"
          onPress={() => setSelectingTheme(true)}
          style={{ margin: 10 }}
        >
          Change Theme
        </Button>
        <Button
          icon="camera-iris"
          mode="contained"
          onPress={async () => {
            //probably want to do some further username error checking
            if (name.length) {
              //save to local storage
              await AsyncStorage.setItem(
                "@pixteryProfile",
                JSON.stringify({ name, noSound })
              );
              //update app state
              dispatch(setProfile({ name, noSound }));
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
            //sign out of Firebase account
            await signOut();
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
            //delete local images
            for (const receivedPuzzle of receivedPuzzles) {
              //only delete a recvd puzzle image if the image isn't also in sent list
              await safelyDeletePuzzleImage(
                receivedPuzzle.imageURI,
                sentPuzzles
              );
            }
            //update app state
            dispatch(setReceivedPuzzles([]));
            deactivateAllPuzzlesOnServer("received");
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
            //delete local images
            for (const sentPuzzle of sentPuzzles) {
              //only delete a sent puzzle image if the image isn't also in recvd list
              await safelyDeletePuzzleImage(
                sentPuzzle.imageURI,
                receivedPuzzles
              );
            }
            //update app state
            dispatch(setSentPuzzles([]));
            deactivateAllPuzzlesOnServer("sent");
            //send you to splash
          }}
          style={{ margin: 10 }}
        >
          Delete Sent Puzzles
        </Button>
        <Button
          icon="cloud-download"
          mode="contained"
          disabled={restoring}
          onPress={async () => {
            try {
              setRestoring(true);
              const [
                mergedReceivedPuzzles,
                mergedSentPuzzles,
              ] = await restorePuzzles(receivedPuzzles, sentPuzzles);
              dispatch(setReceivedPuzzles(mergedReceivedPuzzles));
              dispatch(setSentPuzzles(mergedSentPuzzles));
              setRestoring(false);
            } catch (error) {
              setRestoring(false);
              console.log(error);
            }
          }}
          style={{ margin: 10 }}
        >
          Restore Puzzles
        </Button>
        <Button
          icon="cursor-pointer"
          mode="contained"
          onPress={async () => {
            dispatch(setTutorialFinished(false));
            navigation.navigate("Tutorial");
          }}
          style={{ margin: 10 }}
        >
          Tutorial
        </Button>

        <Text>v{VERSION_NUMBER}</Text>
        {selectingTheme ? (
          <ThemeSelector setSelectingTheme={setSelectingTheme} />
        ) : null}
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
