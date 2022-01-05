import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { anonSignIn } from "../FirebaseApp";
import { setProfile } from "../store/reducers/profile";
import { CreateProfileRoute, ScreenNavigation, RootState } from "../types";
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
  const [verifyFocused, setVerifyFocused] = useState(false);
  const [buttonHeight, setButtonHeight] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState("");

  const signIn = async () => {
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
        dispatch(setProfile({ name }));
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
        <Logo width="100" height="100" />
        <Title width="100" height="35" />
      </View>
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={verifyFocused ? buttonHeight + 40 : 0}
        enableOnAndroid
      >
        <Headline style={{ textAlign: "center" }}>
          Continue Without Signing In
        </Headline>
        <Text>Name*</Text>
        <TextInput
          placeholder="Your name will be shown on puzzles you send"
          value={name}
          onChangeText={(name) => setName(name)}
        />
        {errors.length ? (
          <Text style={{ color: theme.colors.accent, fontStyle: "italic" }}>
            {errors}
          </Text>
        ) : null}
        <Button
          icon="camera-iris"
          mode="contained"
          onLayout={(ev) => setButtonHeight(ev.nativeEvent.layout.height)}
          onPress={signIn}
          style={{ margin: 10 }}
        >
          Continue without Sign In
        </Button>
        <View
          style={{
            borderColor: "gray",
            borderWidth: 0.5,
            borderRightWidth: 0,
          }}
        />
        <Headline style={{ textAlign: "center" }}>or</Headline>
        <View
          style={{
            borderColor: "gray",
            borderWidth: 0.5,
            borderRightWidth: 0,
          }}
        />
        <Button
          icon="account"
          mode="contained"
          onPress={() => setModalVisible(true)}
          style={{ margin: 10 }}
        >
          Register/Sign In
        </Button>
        <Text style={{ textAlign: "center" }}>
          Sign in to submit to Pixteries to Public Gallery and to access your
          Pixteries across devices
        </Text>
      </KeyboardAwareScrollView>
      <SignInModal
        isVisible={modalVisible}
        setModalVisible={setModalVisible}
        navigation={navigation}
        setVerifyFocused={setVerifyFocused}
      />
    </SafeAreaView>
  );
}
