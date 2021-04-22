import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import * as FirebaseRecaptcha from "expo-firebase-recaptcha";
import React, { useState, useRef, LegacyRef } from "react";
import { View } from "react-native";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { phoneProvider, firebaseConfig, verifySms } from "../FirebaseApp";
import { Profile as ProfileType } from "../types";
import Logo from "./Logo";
import Title from "./Title";

const phoneFormat = require("phone");

export default ({
  theme,
  profile,
  setProfile,
  navigation,
}: {
  theme: any;
  profile: ProfileType | null;
  setProfile: (profile: ProfileType) => void;
  navigation: any;
}) => {
  const recaptchaVerifier = useRef<FirebaseRecaptcha.FirebaseRecaptchaVerifierModal>(
    null
  );
  const [name, setName] = useState((profile && profile.name) || "");
  const [phone, setPhone] = useState((profile && profile.phone) || "");
  const [smsCode, setSmsCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [errors, setErrors] = useState("");
  const [resetAllowed, setResetAllowed] = useState(false);
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
          // @ts-ignore
          firebaseConfig={firebaseConfig}
          // this seems to crash the app, so no luck on easy captcha
          // attemptInvisibleVerification={true}
        />
        <Logo width="100" height="100" />
        <Title width="100" height="35" />
        <Headline>Sign In</Headline>
      </View>
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
          />
          <Button
            icon="check-decagram"
            mode="contained"
            style={{ margin: 10 }}
            onPress={async () => {
              try {
                const authResult = await verifySms(verificationId, smsCode);
                if (authResult) {
                  //save to local storage
                  await AsyncStorage.setItem(
                    "@pixteryProfile",
                    JSON.stringify({ name, phone })
                  );
                  //update app state
                  setProfile({ name, phone });
                  //send ya on your way
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "Home" }],
                    })
                  );
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
    </SafeAreaView>
  );
};
