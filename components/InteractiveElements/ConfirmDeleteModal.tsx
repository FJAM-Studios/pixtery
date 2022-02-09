import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import {
  Button,
  Headline,
  Subheading,
  Text,
  TextInput,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { deleteUserCallable, signOut } from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { RootState, ScreenNavigation } from "../../types";

export default function SignInModal({
  isVisible,
  setModalVisible,
}: {
  isVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const dispatch = useDispatch();
  const navigation = useNavigation<ScreenNavigation>();
  const theme = useSelector((state: RootState) => state.theme);
  const [confirmText, setConfirmText] = useState("");

  const deleteUser = async () => {
    // //delete local storage
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);

    //delete user from server
    await deleteUserCallable();

    //sign out of Firebase account locally
    await signOut();

    //clear app state
    dispatch(setReceivedPuzzles([]));
    dispatch(setSentPuzzles([]));
    dispatch(setProfile(null));

    //send you to splash
    navigation.navigate("Splash");
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
        <Headline
          style={{
            textAlign: "center",
          }}
        >
          Are you sure you want to delete your account?
        </Headline>
        <Subheading
          style={{
            textAlign: "center",
          }}
        >
          This cannot be undone.
        </Subheading>
        <Text
          style={{
            marginTop: 15,
          }}
        >
          Type <Text style={{ fontWeight: "bold" }}>delete</Text> to confirm.
        </Text>
        <TextInput
          value={confirmText}
          onChangeText={(confirmText) => setConfirmText(confirmText)}
          placeholderTextColor={theme.colors.primary}
          style={{
            color: theme.colors.text,
            justifyContent: "center",
            backgroundColor: theme.colors.background,
            marginTop: 5,
          }}
        />
        <Button
          disabled={confirmText.toLowerCase() !== "delete"}
          icon="account-cancel"
          mode="contained"
          onPress={deleteUser}
          style={{
            marginTop: 10,
          }}
        >
          Delete
        </Button>
      </View>
    </Modal>
  );
}
