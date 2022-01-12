import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, Button, Headline } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { anonSignIn } from "../FirebaseApp";
import {
  CreateProfileRoute,
  ScreenNavigation,
  RootState,
  SignInOptions,
} from "../types";
import Logo from "./Logo";
import SignInModal from "./SignInMethods/SignInModal";
import Title from "./Title";

export default function CreateProfile({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: CreateProfileRoute;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const [modalVisible, setModalVisible] = useState(false);
  const [signInType, setSignInType] = useState<SignInOptions | null>(null);

  const signIn = (signInType: SignInOptions) => {
    switch (signInType) {
      case SignInOptions.ANON:
        signInAnonymously();
        break;
      case SignInOptions.EMAIL:
        signInWithEmail();
        break;
      case SignInOptions.PHONE:
        signInWithPhone();
        break;
    }
  };

  const signInAnonymously = async () => {
    try {
      await anonSignIn();
      navigation.navigate("EnterName", {
        loginMethod: SignInOptions.ANON,
        url: route.params.url,
      });
    } catch (e) {
      console.log("error signing in anonymously");
    }
  };

  const signInWithEmail = async () => {
    setModalVisible(true);
    setSignInType(SignInOptions.EMAIL);
  };

  const signInWithPhone = async () => {
    setModalVisible(true);
    setSignInType(SignInOptions.PHONE);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 20,
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
        <Logo width="100" height="100" />
        <Title width="100" height="35" />
      </View>
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <Headline style={{ textAlign: "center" }}>Welcome to Pixtery!</Headline>

        <Button
          icon="email"
          mode="contained"
          onPress={() => signIn(SignInOptions.EMAIL)}
          style={{ margin: 10 }}
        >
          Sign In / Register By Email
        </Button>
        <Button
          icon="phone"
          mode="contained"
          onPress={() => signIn(SignInOptions.PHONE)}
          style={{ margin: 10 }}
        >
          Sign In / Register By Phone
        </Button>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "grey" }} />
          <View>
            <Text style={{ marginHorizontal: 20, textAlign: "center" }}>
              or
            </Text>
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: "gray" }} />
        </View>
        <Button
          icon="camera-iris"
          mode="contained"
          onPress={() => signIn(SignInOptions.ANON)}
          style={{ margin: 10 }}
        >
          Continue Without Sign In
        </Button>
        <Text style={{ textAlign: "center" }}>
          Signing in allows you to submit Daily Pixteries and access your
          account across devices.
        </Text>
        <Text style={{ textAlign: "center" }}>
          If you don&apos;t want to create an account now, you can register
          later from the Profile menu.
        </Text>
      </KeyboardAwareScrollView>
      <SignInModal
        isVisible={modalVisible}
        setModalVisible={setModalVisible}
        signInType={signInType}
        url={route.params.url}
      />
    </SafeAreaView>
  );
}
