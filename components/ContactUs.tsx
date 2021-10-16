import React from "react";
import { useSelector } from "react-redux";
import theme from "../store/reducers/theme";
import { ScreenNavigation, RootState } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import {
  Button,
  IconButton,
  Text,
  Surface,
  Headline,
  TextInput,
  ActivityIndicator,
  Modal,
  Portal,
} from "react-native-paper";

export default function ContactUs({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const { height } = useSelector((state: RootState) => state.screenHeight);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );

  return (
    <AdSafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: height * 0.015,
        backgroundColor: theme.colors.background,
        justifyContent: "space-between",
      }}
    >
      <Header
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
      <TextInput
        placeholder="Subject"
        multiline
        // maxLength={messageLimit}
        mode="outlined"
        // value={message}
        // onChangeText={(message) => setMessage(message)}
        // onFocus={() => setTextFocus(true)}
        // onBlur={() => setTextFocus(false)}
        style={{
          minHeight: height * 0.09,
          justifyContent: "center",
        }}
      />
    </AdSafeAreaView>
  );
}
