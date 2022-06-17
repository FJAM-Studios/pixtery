import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { Button } from "react-native-paper";
import Toast from "react-native-root-toast";
import { useDispatch, useSelector } from "react-redux";

import { setProfile } from "../../store/reducers/profile";
import { RootState } from "../../types";
import { NameInput } from "./TextInputs";

export default function NameModal({
  isVisible,
  setModalVisible,
  setLoadingModalVisible,
}: {
  isVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const [name, setName] = useState(profile?.name || "");

  const updateProfile = async () => {
    setLoadingModalVisible(true);
    try {
      await AsyncStorage.setItem(
        "@pixteryProfile",
        JSON.stringify({ ...profile, name: name.trim() })
      );
      //update app state
      dispatch(setProfile({ ...profile, name: name.trim() }));
    } catch (e) {
      console.log(e);
      Toast.show("There was an error saving your profile.", {
        duration: Toast.durations.SHORT,
      });
    }
    setLoadingModalVisible(false);
    setModalVisible(false);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        setModalVisible(false);
        setName(profile?.name || "");
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
        <NameInput name={name} setName={setName} />
        <Button
          disabled={name.length === 0}
          icon="account"
          mode="contained"
          onPress={updateProfile}
          style={{
            marginTop: 10,
          }}
        >
          Save Name
        </Button>
      </View>
    </Modal>
  );
}
