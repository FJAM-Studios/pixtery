import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Headline, Button } from "react-native-paper";
import { useSelector } from "react-redux";

import { RegisterRoute, ScreenNavigation, RootState } from "../types";
import { goToScreen } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import Logo from "./Logo";
import PhoneSignIn from "./SignInMethods/Phone";
import Title from "./Title";

export default function Register({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: RegisterRoute;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const [verifyFocused, setVerifyFocused] = useState(false);
  const [buttonHeight, setButtonHeight] = useState(0);

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
        <PhoneSignIn
          navigation={navigation}
          setVerifyFocused={setVerifyFocused}
        />
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
