import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { View, Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, Button, Headline, IconButton, Switch } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { checkAdminStatus } from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { RootStackScreenProps, RootState } from "../../types";
import { restorePuzzleMetadata } from "../../util";
import { ThemeModal, NameInput } from "../InteractiveElements";
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

  const [noSound, setNoSound] = useState((profile && profile.noSound) || false);
  const [noVibration, setNoVibration] = useState(
    (profile && profile.noVibration) || false
  );
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const { url } = route.params;

  const confirmName = async () => {
    setLoadingModalVisible(true);
    Keyboard.dismiss();
    try {
      if (name.trim().length < 1)
        throw new Error("A display name is required.");

      const isGalleryAdmin = await checkAdminStatus();
      dispatch(
        setProfile({
          ...profile,
          name: name.trim(),
          isGalleryAdmin,
          noSound,
          noVibration,
        })
      );
      //save to local storage
      await AsyncStorage.setItem(
        "@pixteryProfile",
        JSON.stringify({
          ...profile,
          name: name.trim(),
          isGalleryAdmin,
          noSound,
          noVibration,
        })
      );

      //get and merge pixteries
      const [
        mergedReceivedPuzzles,
        mergedSentPuzzles,
      ] = await restorePuzzleMetadata(receivedPuzzles, sentPuzzles);
      dispatch(setReceivedPuzzles(mergedReceivedPuzzles));
      dispatch(setSentPuzzles(mergedSentPuzzles));

      if (url) navigation.navigate("Splash", { url });
      else
        navigation.navigate("TabContainer", {
          screen: "MakeContainer",
          params: { screen: "Make" },
        });
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
        <NameInput name={name} setName={setName} />
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
        <View
          style={{
            justifyContent: "space-around",
            alignItems: "center",
            flexDirection: "row",
            marginVertical: 10,
          }}
        >
          <View
            style={{
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <IconButton icon="volume-high" />
            <Text>Off</Text>
            <Switch
              value={!noSound}
              onValueChange={() => setNoSound(!noSound)}
            />
            <Text>On</Text>
          </View>
          <View
            style={{
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <IconButton icon="vibrate" />
            <Text>Off</Text>
            <Switch
              value={!noVibration}
              onValueChange={() => setNoVibration(!noVibration)}
            />
            <Text>On</Text>
          </View>
        </View>
        <Button
          icon="palette"
          mode="contained"
          onPress={() => setThemeModalVisible(true)}
          style={{ margin: 10 }}
        >
          Change Theme
        </Button>
      </KeyboardAwareScrollView>
      <ThemeModal
        isVisible={themeModalVisible}
        setModalVisible={setThemeModalVisible}
        setLoadingModalVisible={setLoadingModalVisible}
      />
      <LoadingModal isVisible={loadingModalVisible} />
    </SafeAreaView>
  );
}
