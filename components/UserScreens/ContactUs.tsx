import { useState } from "react";
import { Keyboard, Text, Linking, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, TextInput } from "react-native-paper";
import Toast from "react-native-root-toast";
import { useSelector } from "react-redux";

import { submitFeedbackCallable } from "../../FirebaseApp";
import { SettingsContainerProps, RootState } from "../../types";
import { AdSafeAreaView } from "../Layout";
import { LoadingModal } from "../StaticElements";

export default function ContactUs({
  navigation,
}: SettingsContainerProps<"ContactUs">): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const { height } = useSelector((state: RootState) => state.screenHeight);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");

  const submit = async () => {
    setLoading(true);
    Keyboard.dismiss();
    try {
      // including an email is optional in the contact form so I don't think we even want to validate this

      // if (isEmail(email)) {
      //   Toast.show("Please type in a valid email.", {
      //     duration: Toast.durations.SHORT,
      //   });
      //   return;
      // }
      await submitFeedbackCallable({ subject, email, message });
      setMessage("");
      setEmail("");
      setSubject("");
      navigation.navigate("SettingsContainer", { screen: "Settings" });
      Toast.show("Thank you! Your message has been successfully sent.", {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      console.error(error);
      Toast.show("Your message was not sent. Please try again.", {
        duration: Toast.durations.SHORT,
      });
    }
    setLoading(false);
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
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Text
            style={{
              color: "white",
              fontSize: 20,
              padding: 10,
            }}
          >
            If you have any suggestions for features or encounter any bugs,
            please let us know! We&apos;d love to hear from you via the form
            below.
            {"\n"}(You can also email us directly at{" "}
            <Text
              onPress={() => Linking.openURL("mailto:contact@pixtery.io")}
              style={{
                textDecorationLine: "underline",
                color: "blue",
                fontSize: 20,
              }}
            >
              contact@pixtery.io
            </Text>
            ).
          </Text>
        </View>
        <TextInput
          placeholder="Subject"
          mode="outlined"
          value={subject}
          onChangeText={(subject) => setSubject(subject)}
        />
        <TextInput
          placeholder="Your email (optional)"
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
      <LoadingModal isVisible={loading} />
    </AdSafeAreaView>
  );
}
