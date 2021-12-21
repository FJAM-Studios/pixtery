import * as FirebaseRecaptcha from "expo-firebase-recaptcha";
import React, { useState, useRef } from "react";
import { View } from "react-native";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import {
  phoneProvider,
  firebaseConfig,
  registerOnFirebase,
  checkAdminStatus,
} from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { ScreenNavigation, RootState } from "../../types";
import { goToScreen } from "../../util";

const phoneFormat = require("phone");

export default function PhoneSignIn({
  navigation,
  setVerifyFocused,
}: {
  navigation: ScreenNavigation;
  setVerifyFocused: Function;
}): JSX.Element {
  const recaptchaVerifier = useRef<FirebaseRecaptcha.FirebaseRecaptchaVerifierModal>(
    null
  );

  const profile = useSelector((state: RootState) => state.profile);
  const [name, setName] = useState((profile && profile.name) || "");

  const dispatch = useDispatch();
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [errors, setErrors] = useState("");
  const [resetAllowed, setResetAllowed] = useState(false);
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
        const isGalleryAdmin = await checkAdminStatus(name);
        //update app state
        dispatch(setProfile({ name, isGalleryAdmin }));

        //to Home
        goToScreen(navigation, "Home");
      }
    } catch (e) {
      if (e instanceof Error) setErrors(e.message);
      setResetAllowed(true);
    }
  };

  return (
    <View>
      <FirebaseRecaptcha.FirebaseRecaptchaVerifierModal
        // firebase requires recaptcha for SMS verification.
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        // this seems to crash the app, so no luck on easy captcha
        // attemptInvisibleVerification={true}
      />
      <Headline>Phone Number</Headline>
      <Text>Name</Text>
      <TextInput
        placeholder="Your name will be shown on puzzles you send"
        value={name}
        onChangeText={(name) => setName(name)}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        autoCompleteType="tel"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        placeholder="+1 999 999 9999"
        editable={verificationId.length === 0}
        value={phone}
        onChangeText={(phone) => setPhone(phone)}
        style={{ marginBottom: 2 }}
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
            keyboardType="numeric"
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
    </View>
  );
}
