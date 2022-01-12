import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, TextInput, Button, Headline } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { checkAdminStatus } from "../FirebaseApp";
import { setProfile } from "../store/reducers/profile";
import { ScreenNavigation, RootState, EnterNameRoute } from "../types";
import Logo from "./Logo";
import Title from "./Title";

export default function EnterName({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: EnterNameRoute;
}): JSX.Element {
  const dispatch = useDispatch();

  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState("");

  const { url } = route.params;

  const confirmName = async () => {
    try {
      if (name.trim().length < 1)
        throw new Error("A display name is required.");
      const isGalleryAdmin = await checkAdminStatus();
      dispatch(setProfile({ ...profile, name, isGalleryAdmin }));
      //save to local storage
      await AsyncStorage.setItem(
        "@pixteryProfile",
        JSON.stringify({ ...profile, name, isGalleryAdmin })
      );
      if (url) navigation.navigate("Splash", { url });
      else navigation.navigate("Home");
    } catch (e) {
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
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
        <Headline style={{ textAlign: "center" }}>Enter Your Name</Headline>
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
          onPress={confirmName}
          style={{ margin: 10 }}
        >
          Continue To Pixtery!
        </Button>
        <Text style={{ textAlign: "center" }}>
          Enter a display name so your friends know who sent them a Pixtery
        </Text>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
