import { useNavigation } from "@react-navigation/native";
import React from "react";
import { AsyncStorage, View } from "react-native";
import Modal from "react-native-modal";
import { Button, Headline, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { deleteUserCallable, signOut } from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
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

  const deleteUser = async () => {
    await deleteUserCallable();
    //delete local storage
    await AsyncStorage.removeItem("@pixteryProfile");
    //sign out of Firebase account
    await signOut();
    //update app state
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
        <Text
          style={{
            textAlign: "center",
          }}
        >
          This cannot be undone.
        </Text>
        <View
          style={{
            backgroundColor: theme.colors.backdrop,
            borderRadius: theme.roundness,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 10,
          }}
        >
          <Button
            icon="cancel"
            mode="contained"
            onPress={() => setModalVisible(false)}
          >
            Cancel
          </Button>
          <Button icon="account-cancel" mode="contained" onPress={deleteUser}>
            Delete
          </Button>
        </View>
      </View>
    </Modal>
  );
}
