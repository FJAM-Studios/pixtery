import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { checkAdminStatus } from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { RootState, SignInOptions } from "../../types";
import Email from "./Email";
import Phone from "./Phone";

export default function ProfileModal({
  isVisible,
  setModalVisible,
}: {
  isVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const [signInType, setSignInType] = useState<SignInOptions | null>(null);

  const onFinish = async (loginMethod: SignInOptions) => {
    try {
      const isGalleryAdmin = await checkAdminStatus();
      dispatch(setProfile({ ...profile, isGalleryAdmin, loginMethod }));
      //save to local storage
      await AsyncStorage.setItem(
        "@pixteryProfile",
        JSON.stringify({ ...profile, isGalleryAdmin, loginMethod })
      );
    } catch (e) {
      console.log(e);
      if (e instanceof Error) alert(e.message);
    }
    setModalVisible(false);
  };

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
          <Email onFinish={() => onFinish(SignInOptions.EMAIL)} />
        ) : null}
        {signInType === SignInOptions.PHONE ? (
          <Phone onFinish={() => onFinish(SignInOptions.PHONE)} />
        ) : null}
      </View>
    </Modal>
  );
}
