import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { PUBLIC_KEY_LENGTH } from "../../constants";
import { setProfile } from "../../store/reducers/profile";
import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { setSound } from "../../store/reducers/sound";
import { setTheme } from "../../store/reducers/theme";
import { setTutorialFinished } from "../../store/reducers/tutorialFinished";
import { allThemes } from "../../themes";
import { ScreenNavigation, SplashRoute, RootState } from "../../types";
import { clearEIMcache, isProfile, updateImageURIs } from "../../util";
import { Logo, Title } from "../StaticElements";

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
    const getInitialUrl = async (): Promise<string | null> => {
      // https://github.com/facebook/react-native/issues/26947
      // linking is sometimes broken on android, so this lets it go for 2 seconds
      // stupid af
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve(null);
        }, 2000);
        Linking.getInitialURL()
          .then((url) => resolve(url))
          .catch((err) => reject(err))
          .finally(() => clearTimeout(timeout));
      });
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

    const loadTutorialState = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@tutorialFinished");
        const tutorialFinished =
          jsonValue != null ? JSON.parse(jsonValue) : false;
        return tutorialFinished;
      } catch (e) {
        console.log(e);
        alert("Could not load profile.");
        return null;
      }
    };

    const loadTheme = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@themeID");
        const themeID = jsonValue != null ? JSON.parse(jsonValue) : 0;
        const loadedTheme = allThemes.filter((t) => t.ID === +themeID)[0];
        if (loadedTheme) return loadedTheme;
        else return allThemes[0];
      } catch (e) {
        console.log(e);
        alert("Could not load profile.");
        return allThemes[0];
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

        //if there are any loaded puzzles, run the routine to update image URIs
        if (loadedPuzzles.length || loadedSentPuzzles.length) {
          const resaveLocalStorage = await updateImageURIs(
            loadedPuzzles,
            loadedSentPuzzles
          );
          //if it hasn't already been run, then also save the new data to local storage
          //the loadedPuzzles and sentPuzzles should have the updated image URIs due to object reference in JS
          if (resaveLocalStorage) {
            await AsyncStorage.setItem(
              "@pixteryPuzzles",
              JSON.stringify(loadedPuzzles)
            );
            await AsyncStorage.setItem(
              "@pixterySentPuzzles",
              JSON.stringify(loadedSentPuzzles)
            );
          }
        }
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
      // load tutorial state
      const tutorialFinished = await loadTutorialState();
      dispatch(setTutorialFinished(tutorialFinished));
      // load theme
      const loadedTheme = await loadTheme();
      dispatch(setTheme(loadedTheme));
      // load audio
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/click.m4a")
      );
      dispatch(setSound(sound));
      //if you are logged in, load local puzzles, then either navigate to AddPuzzle or Home if there is no url
      if (profile) {
        await loadPuzzles();
        if (url) {
          const { path } = Linking.parse(url);
          const publicKey = path?.substring(path.lastIndexOf("/") + 1);
          if (publicKey && publicKey.length === PUBLIC_KEY_LENGTH) {
            console.log("NAVIGATING");
            navigation.navigate("TabContainer", {
              screen: "LibraryContainer",
              params: {
                screen: "AddPuzzle",
                params: {
                  publicKey,
                  sourceList: "received",
                },
              },
            });
          } else navigation.navigate("TabContainer");
          // if there's no url bc the app was reloaded by Android OTA update, navigate to Home
        } else navigation.navigate("TabContainer");
      } else {
        //otherwise, load profile from local storage if it exists
        const loadedProfile = await loadProfile();
        // we should check that the profile loaded from disk is actually an object of the Profile type and not something else
        // in a future PR, we should validate that the loadedProfile is an object in the right shape, and, if not, we direct them to log in again

        // this is a partial solution to above; still doesn't validate that name follow proper rules but better than nothing
        if (isProfile(loadedProfile)) {
          dispatch(setProfile(loadedProfile));
        } else {
          //or navigate to createprofile if it doesn't exist, passing the url to create profile so it can be forwarded along, and you can go directly to the puzzle after signing in.
          navigation.navigate("CreateProfile", { url });
        }
      }
    };

    loadAppData();
  }, [dispatch, navigation, profile, route.params]);

  useEffect(() => {
    clearEIMcache();
  }, []);

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
