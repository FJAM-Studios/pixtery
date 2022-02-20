import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, TextInput, Button, Headline } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { checkAdminStatus } from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { RootStackScreenProps, RootState } from "../../types";
import { goToScreen, restorePuzzleMetadata } from "../../util";
import { LoadingModal, Logo, Title } from "../StaticElements";

export default function EnterName({
  navigation,
  route,
}: RootStackScreenProps<"EnterName">): JSX.Element {
  const dispatch = useDispatch();

  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState("");
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  const { url } = route.params;

  const confirmName = async () => {
    setLoadingModalVisible(true);
    try {
      if (name.trim().length < 1)
        throw new Error("A display name is required.");
      const isGalleryAdmin = await checkAdminStatus();
      dispatch(setProfile({ ...profile, name, isGalleryAdmin }));
      //save to local storage
      await AsyncStorage.setItem(
        "@pixteryProfile",
        JSON.stringify({ ...profile, name, isGalleryAdmin })
      );

      //get and merge pixteries
      const [
        mergedReceivedPuzzles,
        mergedSentPuzzles,
      ] = await restorePuzzleMetadata(receivedPuzzles, sentPuzzles);
      dispatch(setReceivedPuzzles(mergedReceivedPuzzles));
      dispatch(setSentPuzzles(mergedSentPuzzles));

      if (url) goToScreen(navigation, ["Splash"], { url });
      else goToScreen(navigation, ["TabContainer", "MakeContainer", "Make"]);
    } catch (e) {
      console.log(e);
      if (e instanceof Error) setErrors(e.message);
    }
    setLoadingModalVisible(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          flexDirection: "column",
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Logo width="100" height="100" />
        <Title width="100" height="35" />
      </View>
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <Headline style={{ textAlign: "center" }}>Enter Your Name</Headline>
        <Text style={{ marginTop: 10 }}>Display Name (Required)</Text>
        <TextInput value={name} onChangeText={(name) => setName(name)} />
        {errors.length ? (
          <Text style={{ color: theme.colors.accent, fontStyle: "italic" }}>
            {errors}
          </Text>
        ) : null}
        <Button
          icon="camera-iris"
          mode="contained"
          onPress={confirmName}
          style={{ margin: 10 }}
        >
          Continue To Pixtery!
        </Button>
        <Text style={{ textAlign: "center" }}>
          Enter a display name so your friends know who sent them a Pixtery
        </Text>
      </KeyboardAwareScrollView>
      <LoadingModal isVisible={loadingModalVisible} />
    </SafeAreaView>
  );
}
