import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import React, { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { setProfile } from "../store/reducers/profile";
import { setReceivedPuzzles } from "../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../store/reducers/sentPuzzles";
import { ScreenNavigation, SplashRoute, RootState } from "../types";
import { goToScreen } from "../util";
import Logo from "./Logo";
import Title from "./Title";

export default function Splash({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: SplashRoute;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      return url;
    };

    const loadProfile = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@pixteryProfile");
        const loadedProfile = jsonValue != null ? JSON.parse(jsonValue) : null;
        return loadedProfile;
      } catch (e) {
        console.log(e);
        alert("Could not load profile.");
        return null;
      }
    };
    const loadPuzzles = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@pixteryPuzzles");
        const jsonValueSent = await AsyncStorage.getItem("@pixterySentPuzzles");
        const loadedPuzzles = jsonValue != null ? JSON.parse(jsonValue) : [];
        const loadedSentPuzzles =
          jsonValueSent != null ? JSON.parse(jsonValueSent) : [];
        //should probably do something here to make sure all local puzzles also have local images
        //and, if not, try to get them from server, and if they don't exist there, then delete puzzle
        //or otherwise mark it as invalid somehow
        dispatch(setReceivedPuzzles(loadedPuzzles));
        dispatch(setSentPuzzles(loadedSentPuzzles));
      } catch (e) {
        console.log(e);
        alert("Could not load saved puzzles.");
      }
    };

    const loadAppData = async () => {
      //first get the url that was either passed in by the url event listener or by the url used to open the app, this will be used regardless of whether you have a profile
      const url =
        route.params && route.params.url
          ? route.params.url
          : await getInitialUrl();
      //if you are logged in, load local puzzles, then either navigate to AddPuzzle or Home if there is no url
      if (profile && profile.name && url) {
        await loadPuzzles();
        const { queryParams } = Linking.parse(url);
        if (queryParams && queryParams.publicKey) {
          const { publicKey } = queryParams;
          goToScreen(navigation, "AddPuzzle", { publicKey });
        } else goToScreen(navigation, "Home");
      } else {
        //otherwise, load profile from local storage if it exists
        const loadedProfile = await loadProfile();
        if (loadedProfile) {
          dispatch(setProfile(loadedProfile));
        } else {
          //or navigate to createprofile if it doesn't exist, passing the url to create profile so it can be forwarded along, and you can go directly to the puzzle after signing in.
          goToScreen(navigation, "CreateProfile", { url });
        }
      }
    };

    loadAppData();
  }, [profile]);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Logo width="100" height="100" />
      <Title width="100" height="35" />
      <ActivityIndicator animating color={theme.colors.text} size="large" />
    </View>
  );
}
