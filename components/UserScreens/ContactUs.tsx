import { useEffect, useRef, useState } from "react";
import { Keyboard, Text, Linking, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, TextInput } from "react-native-paper";
import Toast from "react-native-root-toast";
import { useSelector } from "react-redux";

import { submitFeedbackCallable } from "../../FirebaseApp";
import { SettingsContainerProps, RootState } from "../../types";
import { isEmail } from "../../util";
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

  // trying this approach to avoid unmounted component state update error
  // https://stackoverflow.com/questions/56442582/react-hooks-cant-perform-a-react-state-update-on-an-unmounted-component
  const isMounted = useRef(true);
  useEffect(() => {
    console.log("...ContactUs component mounted...");
    return () => {
      console.log("...UNmounted ContactUs component...");
      isMounted.current = false;
    };
  }, []);

  const submit = async () => {
    Keyboard.dismiss();

    setLoading(true);
    // default message is an error
    let toastMessage = "Your message was not sent. Please try again.";
    let success = false;

    try {
      if (email.length && !isEmail(email)) {
        // different error if not valid email
        toastMessage = "Please type in a valid email.";
        throw new Error("invalid email");
      }

      // try to send email
      await submitFeedbackCallable({ subject, email, message });
      toastMessage = "Thank you! Your message has been successfully sent.";
      success = true;
    } catch (error) {
      console.log(error);
    }

    // show message
    Toast.show(toastMessage, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
    });

    // trying this approach to avoid unmounted component state update error
    // if the message was sent and the component is still mounted, set input form state
    if (success && isMounted.current) {
      setMessage("");
      setEmail("");
      setSubject("");
    }
    // set loading if still mounted, regardless of success
    if (isMounted.current) setLoading(false);
    // if succeeded, navigate
    if (success)
      navigation.navigate("SettingsContainer", { screen: "Settings" });
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
