import React, { useState } from "react";
import { Keyboard, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, TextInput } from "react-native-paper";
import { useSelector } from "react-redux";

import { functions } from "../FirebaseApp";
import { ScreenNavigation, RootState } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";

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
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");

  const submit = async () => {
    Keyboard.dismiss();
    const handleEmailCallable = functions.httpsCallable("handleEmail");
    try {
      await handleEmailCallable({ subject, email, message });
      setMessage("");
      setEmail("");
      setSubject("");
      alert("Thank you! Your message has been successfully sent.");
    } catch (error) {
      console.error(error);
      alert("Your message was not sent. Please try again.");
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
        enableOnAndroid
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            padding: 10,
          }}
        >
          If you have any suggestions for features or encounter any bugs, please
          let us know! We&apos;d love to hear from you.
        </Text>
        <TextInput
          placeholder="Subject"
          multiline
          mode="outlined"
          value={subject}
          onChangeText={(subject) => setSubject(subject)}
        />
        <TextInput
          placeholder="Your email"
          multiline
          mode="outlined"
          value={email}
          onChangeText={(email) => setEmail(email)}
        />
        <TextInput
          placeholder="Write your message here!"
          multiline
          mode="outlined"
          value={message}
          onChangeText={(message) => setMessage(message)}
        />
        <Button
          icon="send"
          mode="contained"
          onPress={submit}
          style={{ margin: height * 0.01 }}
          disabled={message.length === 0}
        >
          Submit Feedback
        </Button>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
