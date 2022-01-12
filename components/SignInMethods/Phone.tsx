import * as FirebaseRecaptcha from "expo-firebase-recaptcha";
import React, { useState, useRef } from "react";
import { View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Subheading,
  Headline,
} from "react-native-paper";

import {
  phoneProvider,
  firebaseConfig,
  signInOnFireBase,
} from "../../FirebaseApp";
import { SignInOptions } from "../../types";

const phoneFormat = require("phone");

export default function Phone({
  onFinish,
  url,
}: {
  onFinish: () => void;
  url?: string;
}): JSX.Element {
  const recaptchaVerifier = useRef<FirebaseRecaptcha.FirebaseRecaptchaVerifierModal>(
    null
  );

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
      await signInOnFireBase(SignInOptions.PHONE, verificationId, smsCode);
      onFinish();
    } catch (e) {
      if (e instanceof Error) setErrors(e.message);
      setResetAllowed(true);
    }
  };

  return (
    <View>
      <Headline style={{ textAlign: "center" }}>Sign In</Headline>
      <FirebaseRecaptcha.FirebaseRecaptchaVerifierModal
        // firebase requires recaptcha for SMS verification.
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        // this seems to crash the app, so no luck on easy captcha
        // attemptInvisibleVerification={true}
      />
      <Subheading>Phone Number</Subheading>
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
        disabled={!phone || verificationId.length > 0}
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