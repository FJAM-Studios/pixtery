import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { useSelector } from "react-redux";

import { RootState, ScreenNavigation, SignInOptions } from "../../types";
import Email from "./Email";
import Phone from "./Phone";

export default function SignInModal({
  isVisible,
  setModalVisible,
  signInType,
  url,
}: {
  isVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  signInType: SignInOptions | null;
  url?: string;
}): JSX.Element {
  const navigation = useNavigation<ScreenNavigation>();
  const theme = useSelector((state: RootState) => state.theme);

  const onFinish = () => {
    setModalVisible(false);
    navigation.navigate("EnterName", { url });
  };

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
        {signInType === SignInOptions.EMAIL ? (
          <Email onFinish={onFinish} />
        ) : null}
        {signInType === SignInOptions.PHONE ? (
          <Phone onFinish={onFinish} />
        ) : null}
      </View>
    </Modal>
  );
}
