import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";

import { checkAdminStatus } from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { RootState, SignInOptions } from "../../types";
import { restorePuzzleMetadata } from "../../util";
import Email from "./Email/Email";
import Phone from "./Phone/Phone";
import SignInMenu from "./SignInMenu";

export default function ProfileModal({
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
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const [signInType, setSignInType] = useState<SignInOptions | null>(null);

  const onFinish = async () => {
    try {
      const isGalleryAdmin = await checkAdminStatus();
      if (profile) dispatch(setProfile({ ...profile, isGalleryAdmin }));
      //save to local storage
      await AsyncStorage.setItem(
        "@pixteryProfile",
        JSON.stringify({ ...profile, isGalleryAdmin })
      );

      //get and merge pixteries
      const [
        mergedReceivedPuzzles,
        mergedSentPuzzles,
      ] = await restorePuzzleMetadata(receivedPuzzles, sentPuzzles);
      dispatch(setReceivedPuzzles(mergedReceivedPuzzles));
      dispatch(setSentPuzzles(mergedSentPuzzles));
    } catch (e) {
      console.log(e);
      if (e instanceof Error) console.log(e.message);
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
        {signInType === null ? <SignInMenu onPress={setSignInType} /> : null}
        {signInType === SignInOptions.EMAIL ? (
          <Email
            onFinish={onFinish}
            setLoadingModalVisible={setLoadingModalVisible}
          />
        ) : null}
        {signInType === SignInOptions.PHONE ? (
          <Phone
            onFinish={onFinish}
            setLoadingModalVisible={setLoadingModalVisible}
          />
        ) : null}
      </View>
    </Modal>
  );
}
