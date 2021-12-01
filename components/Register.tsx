import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FirebaseRecaptcha from "expo-firebase-recaptcha";
import firebase from "firebase";
import React, { useState, useRef } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
  phoneProvider,
  firebaseConfig,
  // verifySms,
  registerOnFirebase,
} from "../FirebaseApp";
import { setProfile } from "../store/reducers/profile";
import { RegisterRoute, ScreenNavigation, RootState } from "../types";
import { goToScreen } from "../util";
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
  const dispatch = useDispatch();
  const recaptchaVerifier = useRef<FirebaseRecaptcha.FirebaseRecaptchaVerifierModal>(
    null
  );
  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const [name, setName] = useState((profile && profile.name) || "");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [errors, setErrors] = useState("");
  const [resetAllowed, setResetAllowed] = useState(false);
  const [verifyFocused, setVerifyFocused] = useState(false);
  const [buttonHeight, setButtonHeight] = useState(0);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
      }}
    >
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
        <Text>Name</Text>
        <TextInput
          placeholder="Terry Pix"
          value={name}
          onChangeText={(name) => setName(name)}
        />
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
          onPress={async () => {
            try {
              const formattedPhone = phoneFormat(phone)[0];
              if (
                formattedPhone &&
                recaptchaVerifier &&
                recaptchaVerifier.current
              ) {
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
              setErrors(e.message);
            }
          }}
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
              onPress={async () => {
                try {
                  const authResult = await registerOnFirebase(
                    "phone",
                    verificationId,
                    smsCode
                  );
                  if (authResult) {
                    console.log("GOT AUTH RESULT");
                    //save to local storage
                    await AsyncStorage.setItem(
                      "@pixteryProfile",
                      JSON.stringify({ name })
                    );
                    //update app state
                    dispatch(setProfile({ name }));
                    //send ya on your way, either home or to AddPuzzle if you were redirected here to log in first
                    if (route.params && route.params.url)
                      goToScreen(navigation, "Splash", {
                        url: route.params.url,
                      });
                    else goToScreen(navigation, "Home");
                  }
                } catch (e) {
                  setErrors(e.message);
                  setResetAllowed(true);
                }
              }}
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
