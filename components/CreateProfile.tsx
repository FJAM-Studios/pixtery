import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Headline, Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { setProfile } from "../store/reducers/profile";
import { CreateProfileRoute, ScreenNavigation, RootState } from "../types";
import { goToScreen } from "../util";
import Logo from "./Logo";
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
  const [errors, setErrors] = useState("");

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
        <Headline>Sign In</Headline>
      </View>
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={40}
        enableOnAndroid
      >
        <Text>Name</Text>
        <TextInput
          placeholder="Terry Pix"
          value={name}
          onChangeText={(name) => setName(name)}
        />
        <Button
          icon="camera-iris"
          mode="contained"
          disabled={!name}
          onPress={async () => {
            try {
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
              setErrors("");
            } catch (e) {
              console.log(e);
              setErrors(e.message);
            }
          }}
          style={{ margin: 10 }}
        >
          Create Profile
        </Button>
        {errors.length ? <Text>{errors}</Text> : null}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
