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

import { setTutorialFinished } from "../store/reducers/tutorialFinished";
import { ScreenNavigation, RootState } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import { VERSION_NUMBER } from "../constants";

export default function Help({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
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
          <Headline>Help</Headline>
        </View>
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
        <Button
          icon="email"
          mode="contained"
          onPress={() => {
            navigation.navigate("ContactUs");
          }}
          style={{ margin: 10 }}
        >
          Contact Us
        </Button>
        <Text>v{VERSION_NUMBER}</Text>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
