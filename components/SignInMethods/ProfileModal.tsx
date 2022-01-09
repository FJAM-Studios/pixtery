import React, { useState } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { Button } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState, SignInOptions } from "../../types";
import Email from "./Email";
import Phone from "./Phone";

export default function SignInModal({
  isVisible,
  setModalVisible,
  name,
}: {
  isVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const [signInType, setSignInType] = useState<SignInOptions | null>(null);
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        setModalVisible(false);
        setSignInType(null);
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
        {signInType === null ? (
          <>
            <Button
              icon="email"
              mode="contained"
              onPress={() => setSignInType(SignInOptions.EMAIL)}
              style={{ margin: 10 }}
            >
              Sign In / Register By Email
            </Button>
            <Button
              icon="phone"
              mode="contained"
              onPress={() => setSignInType(SignInOptions.PHONE)}
              style={{ margin: 10 }}
            >
              Sign In / Register By Phone
            </Button>
          </>
        ) : null}
        {signInType === SignInOptions.EMAIL ? (
          <Email name={name} setModalVisible={setModalVisible} />
        ) : null}
        {signInType === SignInOptions.PHONE ? (
          <Phone name={name} setModalVisible={setModalVisible} />
        ) : null}
      </View>
    </Modal>
  );
}
