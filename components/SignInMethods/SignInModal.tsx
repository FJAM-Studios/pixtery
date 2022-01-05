import React from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { Headline } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState, ScreenNavigation } from "../../types";
import Logo from "./../Logo";
import Title from "./../Title";
import Phone from "./Phone";

export default function SignInModal({
  isVisible,
  setModalVisible,
  navigation,
  setVerifyFocused,
}: {
  isVisible: boolean;
  setModalVisible: Function;
  navigation: ScreenNavigation;
  setVerifyFocused: Function;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        setModalVisible(false);
      }}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropTransitionOutTiming={0}
      avoidKeyboard
      style={{ margin: 1 }}
    >
      <View
        style={{
          backgroundColor: theme.colors.backdrop,
          borderRadius: theme.roundness,
          padding: 5,
        }}
      >
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Logo width="100" height="100" />
          <Title width="100" height="35" />
        </View>
        <Headline style={{ textAlign: "center" }}>Register/Sign In</Headline>
        <Phone navigation={navigation} setVerifyFocused={setVerifyFocused} />
      </View>
    </Modal>
  );
}
