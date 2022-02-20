import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { VERSION_NUMBER } from "../../constants";
import { setTutorialFinished } from "../../store/reducers/tutorialFinished";
import { SettingsContainerProps, RootState } from "../../types";
import { goToScreen } from "../../util";
import { AdSafeAreaView } from "../Layout";

export default function Settings({
  navigation,
}: SettingsContainerProps<"Settings">): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);

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
          icon="account"
          mode="contained"
          onPress={() => {
            goToScreen(navigation, ["Profile"]);
          }}
          style={{ margin: 10 }}
        >
          Manage Profile
        </Button>

        <Button
          icon="puzzle"
          mode="contained"
          onPress={() => {
            goToScreen(navigation, ["ManagePuzzles"]);
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
            goToScreen(navigation, ["MakeContainer", "Tutorial"]);
          }}
          style={{ margin: 10 }}
        >
          Tutorial
        </Button>
        <Button
          icon="email"
          mode="contained"
          onPress={() => {
            goToScreen(navigation, ["ContactUs"]);
          }}
          style={{ margin: 10 }}
        >
          Contact Us
        </Button>
        <Text>v{VERSION_NUMBER}</Text>
      </KeyboardAwareScrollView>
    </AdSafeAreaView>
  );
}
