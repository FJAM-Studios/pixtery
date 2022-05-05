import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { VERSION_NUMBER } from "../../constants";
import { setTutorialFinished } from "../../store/reducers/tutorialFinished";
import { SettingsContainerProps, RootState } from "../../types";
import ConfirmDeleteModal from "../InteractiveElements/ConfirmDeleteModal";
import { AdSafeAreaView } from "../Layout";

export default function MoreSettings({
  navigation,
}: SettingsContainerProps<"MoreSettings">): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  return (
    <AdSafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
      }}
    >
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        <Button
          icon="puzzle"
          mode="contained"
          onPress={() => {
            navigation.navigate("ManagePuzzles");
          }}
          style={{ margin: 10 }}
        >
          Manage Puzzles
        </Button>
        <Button
          icon="cursor-pointer"
          mode="contained"
          onPress={async () => {
            dispatch(setTutorialFinished(false));
            navigation.navigate("MakeContainer", { screen: "Tutorial" });
          }}
          style={{ margin: 10 }}
        >
          Tutorial
        </Button>
        <Button
          icon="email"
          mode="contained"
          onPress={() => {
            navigation.navigate("ContactUs");
          }}
          style={{ margin: 10 }}
        >
          Contact Us
        </Button>
        <Button
          icon="cloud-download"
          mode="contained"
          onPress={() => {
            setDeleteModalVisible(true);
          }}
          style={{ margin: 10 }}
        >
          Delete Account
        </Button>
        <Text>v{VERSION_NUMBER}</Text>
      </KeyboardAwareScrollView>
      <ConfirmDeleteModal
        isVisible={deleteModalVisible}
        setModalVisible={setDeleteModalVisible}
      />
    </AdSafeAreaView>
  );
}
