import React from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { useSelector } from "react-redux";

import { RootState, SignInOptions } from "../../types";
import Email from "./Email";
import Phone from "./Phone";

export default function SignInModal({
  isVisible,
  setModalVisible,
  signInType,
  name,
}: {
  isVisible: boolean;
  setModalVisible: Function;
  signInType: SignInOptions | null;
  name: string;
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
    >
      <View
        style={{
          backgroundColor: theme.colors.backdrop,
          borderRadius: theme.roundness,
          padding: 20,
        }}
      >
        {signInType === SignInOptions.EMAIL ? <Email name={name} /> : null}
        {signInType === SignInOptions.PHONE ? <Phone name={name} /> : null}
      </View>
    </Modal>
  );
}
