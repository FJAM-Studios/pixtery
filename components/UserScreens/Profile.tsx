import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, Button, Switch, IconButton } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { auth, signOut } from "../../FirebaseApp";
import { setProfile } from "../../store/reducers/profile";
import { ScreenNavigation, RootState } from "../../types";
import { clearAllAppData } from "../../util";
import { NameModal, ThemeModal } from "../InteractiveElements";
import ConfirmDeleteModal from "../InteractiveElements/ConfirmDeleteModal";
import { AdSafeAreaView } from "../Layout";
import { ProfileModal } from "../SignInMethods";
import { LoadingModal } from "../StaticElements";

export default function Profile({
  navigation,
}: {
  navigation: ScreenNavigation;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);

  const profile = useSelector((state: RootState) => state.profile);
  const [noSound, setNoSound] = useState((profile && profile.noSound) || false);
  const [noVibration, setNoVibration] = useState(
    (profile && profile.noVibration) || false
  );
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  const toggleSound = async () => {
    //save to local storage
    await AsyncStorage.setItem(
      "@pixteryProfile",
      JSON.stringify({ ...profile, noSound: !noSound })
    );
    //update app state
    if (profile) dispatch(setProfile({ ...profile, noSound: !noSound }));
    setNoSound(!noSound);
  };

  const toggleVibration = async () => {
    //save to local storage
    await AsyncStorage.setItem(
      "@pixteryProfile",
      JSON.stringify({ ...profile, noVibration: !noVibration })
    );
    //update app state
    if (profile)
      dispatch(setProfile({ ...profile, noVibration: !noVibration }));
    setNoVibration(!noVibration);
  };

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
            <Switch value={!noSound} onValueChange={toggleSound} />
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
            <Switch value={!noVibration} onValueChange={toggleVibration} />
            <Text>On</Text>
          </View>
        </View>
        <Button
          icon="camera-iris"
          mode="contained"
          onPress={() => setNameModalVisible(true)}
          style={{ margin: 10 }}
        >
          Change Name
        </Button>
        <Button
          icon="palette"
          mode="contained"
          onPress={() => setThemeModalVisible(true)}
          style={{ margin: 10 }}
        >
          Change Theme
        </Button>
        {/*we can't let people sign out if they're logged in anonymously.
        otherwise they'll lose their puzzles forever */}
        {auth.currentUser && !auth.currentUser.isAnonymous ? (
          <Button
            icon="logout"
            mode="contained"
            onPress={async () => {
              //clear app data
              await clearAllAppData(dispatch);
              //sign out of Firebase account
              await signOut();
              //update app state
              dispatch(setProfile(null));
              //send you to splash
              navigation.navigate("Splash");
            }}
            style={{ margin: 10 }}
          >
            Log Out
          </Button>
        ) : (
          <Button
            icon="logout"
            mode="contained"
            onPress={async () => {
              setAccountModalVisible(true);
            }}
            style={{ margin: 10 }}
          >
            Sign In / Register Account
          </Button>
        )}
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
      </KeyboardAwareScrollView>
      <NameModal
        isVisible={nameModalVisible}
        setModalVisible={setNameModalVisible}
        setLoadingModalVisible={setLoadingModalVisible}
      />
      <ThemeModal
        isVisible={themeModalVisible}
        setModalVisible={setThemeModalVisible}
        setLoadingModalVisible={setLoadingModalVisible}
      />
      <ProfileModal
        isVisible={accountModalVisible}
        setModalVisible={setAccountModalVisible}
        setLoadingModalVisible={setLoadingModalVisible}
      />
      <ConfirmDeleteModal
        isVisible={deleteModalVisible}
        setModalVisible={setDeleteModalVisible}
      />
      <LoadingModal isVisible={loadingModalVisible} />
    </AdSafeAreaView>
  );
}
