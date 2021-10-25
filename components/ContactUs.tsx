import React, { useState } from "react";
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
import { useSelector } from "react-redux";
import theme from "../store/reducers/theme";
import { ScreenNavigation, RootState } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { functions } from "../FirebaseApp";

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
  const [message, setMessage] = useState("");

  const submit = async () => {
    const handleEmailCallable = functions.httpsCallable("handleEmail");
    try {
      await handleEmailCallable({ message });
      // handleEmailCallable().then((result) => console.log(result.data));
      // console.log('result', result.data)
      // return result;
      // return puzzleData.data; // get just nested data from returned JSON
    } catch (error) {
      console.log("in contact us");
      console.error(error);
      throw new Error(error); //rethrow the error so it can be caught by outer method
    }
  };

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
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        // extraScrollHeight={
        //   Platform.OS === "ios" ? 0 : buttonHeight + height * 0.2
        // }
        enableOnAndroid
      >
        <TextInput
          placeholder="Subject"
          multiline
          // maxLength={messageLimit}
          mode="outlined"
          value={message}
          onChangeText={(message) => setMessage(message)}
          // onFocus={() => setTextFocus(true)}
          // onBlur={() => setTextFocus(false)}
          style={{
            minHeight: height * 0.09,
            justifyContent: "center",
          }}
        />
        <Button
          icon="send"
          mode="contained"
          onPress={submit}
          style={{ margin: height * 0.01 }}
          disabled={message.length === 0}
          // onLayout={(ev) => setButtonHeight(ev.nativeEvent.layout.height)}
        >
          Submit Feedback
        </Button>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
