import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useState } from "react";
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
import { RootStackParamList, RootState } from "../../types";
import { clearAllAppData, goToScreen } from "../../util";

export default function SignInModal({
  isVisible,
  setModalVisible,
}: {
  isVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useSelector((state: RootState) => state.theme);
  const [confirmText, setConfirmText] = useState("");

  const deleteUser = async () => {
    //clear app data
    await clearAllAppData(dispatch);
    //delete user from server
    await deleteUserCallable();
    //sign out of Firebase account locally
    await signOut();
    //send you to splash
    goToScreen(navigation, "Splash");
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
