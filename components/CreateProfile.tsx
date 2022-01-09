import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { anonSignIn } from "../FirebaseApp";
import { setProfile } from "../store/reducers/profile";
import {
  CreateProfileRoute,
  ScreenNavigation,
  RootState,
  SignInOptions,
} from "../types";
import { goToScreen } from "../util";
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
  const dispatch = useDispatch();

  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const [name, setName] = useState((profile && profile.name) || "");
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState("");
  const [signInType, setSignInType] = useState<SignInOptions | null>(null);

  const signIn = (signInType: SignInOptions) => {
    if (name.trim().length < 1) {
      setErrors(
        "Enter a display name so your friends know who sent them a Pixtery"
      );
    } else {
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
    }
  };

  const signInAnonymously = async () => {
    try {
      if (name.trim().length < 1) {
        setErrors(
          "Enter a display name so your friends know who sent them a Pixtery"
        );
      } else {
        setErrors("");
        await anonSignIn();
        //save to local storage
        await AsyncStorage.setItem("@pixteryProfile", JSON.stringify({ name }));
        //update app state
        dispatch(setProfile({ name, loginMethod: SignInOptions.ANON }));
        //send ya on your way, either home or to AddPuzzle if you were redirected here to log in first
        if (route.params && route.params.url)
          goToScreen(navigation, "Splash", {
            url: route.params.url,
          });
        else goToScreen(navigation, "Home");
      }
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
        <Text style={{ marginTop: 10 }}>Display Name (Required)</Text>
        <TextInput value={name} onChangeText={(name) => setName(name)} />
        {errors.length ? (
          <Text style={{ color: theme.colors.accent, fontStyle: "italic" }}>
            {errors}
          </Text>
        ) : null}
        <Button
          icon="camera-iris"
          mode="contained"
          onPress={() => signIn(SignInOptions.ANON)}
          style={{ margin: 10 }}
        >
          Continue Without Sign In
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
        <Text style={{ textAlign: "center" }}>
          Sign In to submit Daily Pixteries and access your account across
          devices
        </Text>
      </KeyboardAwareScrollView>
      <SignInModal
        isVisible={modalVisible}
        setModalVisible={setModalVisible}
        signInType={signInType}
        name={name}
      />
    </SafeAreaView>
  );
}
