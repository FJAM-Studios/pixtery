import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FirebaseRecaptcha from "expo-firebase-recaptcha";
import React, { useState, useRef } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import {
  phoneProvider,
  firebaseConfig,
  registerOnFirebase,
  functions,
} from "../FirebaseApp";
import { setProfile } from "../store/reducers/profile";
import { RegisterRoute, ScreenNavigation, RootState } from "../types";
import { goToScreen } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import Logo from "./Logo";
import Title from "./Title";

const phoneFormat = require("phone");

export default function Register({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: RegisterRoute;
}): JSX.Element {
  const recaptchaVerifier = useRef<FirebaseRecaptcha.FirebaseRecaptchaVerifierModal>(
    null
  );
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const [name, setName] = useState((profile && profile.name) || "");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [errors, setErrors] = useState("");
  const [resetAllowed, setResetAllowed] = useState(false);
  const [verifyFocused, setVerifyFocused] = useState(false);
  const [buttonHeight, setButtonHeight] = useState(0);
  const attemptPhoneSignIn = async () => {
    try {
      const formattedPhone = phoneFormat(phone)[0];
      if (formattedPhone && recaptchaVerifier && recaptchaVerifier.current) {
        setPhone(formattedPhone);
        const id = await phoneProvider.verifyPhoneNumber(
          formattedPhone,
          recaptchaVerifier.current
        );
        setVerificationId(id);
        setErrors("");
      } else {
        throw new Error(
          `Please check the number that you entered and try again.`
        );
      }
    } catch (e) {
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
  };
  const completeSignIn = async () => {
    try {
      const authResult = await registerOnFirebase(
        "phone",
        verificationId,
        smsCode
      );
      if (authResult) {
        try {
          // get whether or not pixtery admin
          const checkGalleryAdmin = functions.httpsCallable(
            "checkGalleryAdmin"
          );
          const res = await checkGalleryAdmin();
          const isGalleryAdmin = res.data;

          //save to local storage
          await AsyncStorage.setItem(
            "@pixteryProfile",
            JSON.stringify({ name, isGalleryAdmin })
          );
          //update app state
          dispatch(setProfile({ name, isGalleryAdmin }));
        } catch (e) {
          console.log("could not verify admin status");
        }

        //back to profile
        goToScreen(navigation, "Profile");
      }
    } catch (e) {
      if (e instanceof Error) setErrors(e.message);
      setResetAllowed(true);
    }
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
        <FirebaseRecaptcha.FirebaseRecaptchaVerifierModal
          // firebase requires recaptcha for SMS verification.
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          // this seems to crash the app, so no luck on easy captcha
          // attemptInvisibleVerification={true}
        />
        <Logo width="100" height="100" />
        <Title width="100" height="35" />
        <Headline>Sign In</Headline>
      </View>
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={verifyFocused ? buttonHeight + 40 : 0}
        enableOnAndroid
      >
        <Text>Phone Number</Text>
        <TextInput
          autoCompleteType="tel"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          placeholder="+1 999 999 9999"
          editable={verificationId.length === 0}
          value={phone}
          onChangeText={(phone) => setPhone(phone)}
        />
        <Button
          icon="camera-iris"
          mode="contained"
          disabled={!name || !phone || verificationId.length > 0}
          onPress={attemptPhoneSignIn}
          style={{ margin: 10 }}
        >
          Sign In
        </Button>
        {verificationId.length ? (
          <View>
            <TextInput
              value={smsCode}
              editable={!!verificationId}
              placeholder="123456"
              onChangeText={(verificationCode: string) =>
                setSmsCode(verificationCode)
              }
              onFocus={() => setVerifyFocused(true)}
              onBlur={() => setVerifyFocused(false)}
            />
            <Button
              icon="check-decagram"
              mode="contained"
              style={{ margin: 10 }}
              onLayout={(ev) => setButtonHeight(ev.nativeEvent.layout.height)}
              onPress={completeSignIn}
            >
              Verify
            </Button>
          </View>
        ) : null}
        {errors.length ? <Text>{errors}</Text> : null}
        {resetAllowed ? (
          <Button
            icon="repeat"
            mode="contained"
            style={{ margin: 10 }}
            onPress={() => {
              setName("");
              setPhone("");
              setVerificationId("");
              setErrors("");
              setSmsCode("");
              setResetAllowed(false);
            }}
          >
            Reset
          </Button>
        ) : null}
        <Button
          icon="close-box"
          mode="contained"
          style={{ margin: 10 }}
          onLayout={(ev) => setButtonHeight(ev.nativeEvent.layout.height)}
          onPress={() => {
            //back to profile
            goToScreen(navigation, "Profile");
          }}
        >
          Cancel
        </Button>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
