import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigatorScreenParams,
  useFocusEffect,
} from "@react-navigation/native";
import { Audio } from "expo-av";
import * as Linking from "expo-linking";
import { useCallback } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { PUBLIC_KEY_LENGTH } from "../../constants";
import { setProfile } from "../../store/reducers/profile";
import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { setSounds } from "../../store/reducers/sounds";
import { setTheme } from "../../store/reducers/theme";
import { setTutorialFinished } from "../../store/reducers/tutorialFinished";
import { allThemes } from "../../themes";
import {
  RootStackParamList,
  RootStackScreenProps,
  RootState,
} from "../../types";
import { clearEIMcache, isProfile, updateImageURIs } from "../../util";
import { Logo, Title } from "../StaticElements";

export default function Splash({
  navigation,
  route,
}: RootStackScreenProps<"Splash">): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  console.log("Splashing...");

  // useFocusEffect with useCallback makes this function run whenever the screen is focused.
  // this prevents users from getting "stuck" on Splash
  // https://reactnavigation.org/docs/navigation-lifecycle#react-navigation-lifecycle-events
  useFocusEffect(
    useCallback(() => {
      const loadTutorialState = async () => {
        console.log("loading tutorial state...");
        try {
          const jsonValue = await AsyncStorage.getItem("@tutorialFinished");
          const tutorialFinished =
            jsonValue != null ? JSON.parse(jsonValue) : false;
          return tutorialFinished;
        } catch (e) {
          console.log(e);
          console.log("Could not load tutorial state.");
          return null;
        }
      };

      const loadTheme = async () => {
        console.log("loading theme...");
        try {
          const jsonValue = await AsyncStorage.getItem("@themeID");
          const themeID = jsonValue != null ? JSON.parse(jsonValue) : 0;
          const loadedTheme = allThemes.filter((t) => t.ID === +themeID)[0];
          if (loadedTheme) return loadedTheme;
          else return allThemes[0];
        } catch (e) {
          console.log(e);
          console.log("Could not load theme.");
          return allThemes[0];
        }
      };

      const getInitialUrl = async (): Promise<string | undefined> => {
        console.log("getting initial url...");
        // https://github.com/facebook/react-native/issues/26947
        // linking is sometimes broken on android, so this lets it go for 2 seconds
        // stupid af
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(undefined);
          }, 2000);
          Linking.getInitialURL()
            .then((url) => resolve(url || undefined))
            .catch((err) => reject(err))
            .finally(() => clearTimeout(timeout));
        });
      };

      const loadProfile = async () => {
        console.log("loading profile...");
        try {
          const jsonValue = await AsyncStorage.getItem("@pixteryProfile");
          const loadedProfile =
            jsonValue != null ? JSON.parse(jsonValue) : null;
          return loadedProfile;
        } catch (e) {
          console.log(e);
          console.log("Could not load profile.");
          return null;
        }
      };

      const loadPuzzles = async () => {
        console.log("loading puzzles...");
        try {
          const jsonValue = await AsyncStorage.getItem("@pixteryPuzzles");
          const jsonValueSent = await AsyncStorage.getItem(
            "@pixterySentPuzzles"
          );
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
          console.log("Could not load saved puzzles.");
        }
      };

      const loadAppData = async () => {
        clearEIMcache();

        console.log("loading app data...");
        // load tutorial state
        const tutorialFinished = await loadTutorialState();
        dispatch(setTutorialFinished(tutorialFinished));

        // load theme
        const loadedTheme = await loadTheme();
        dispatch(setTheme(loadedTheme));

        // load audio
        const { sound: clickSound } = await Audio.Sound.createAsync(
          require("../../assets/click.m4a")
        );
        const { sound: winSound } = await Audio.Sound.createAsync(
          require("../../assets/camera-click.wav")
        );
        dispatch(setSounds({ clickSound, winSound }));

        // default splash destination is Make screen
        let splashDestination: NavigatorScreenParams<RootStackParamList> = {
          screen: "TabContainer",
          params: { screen: "MakeContainer", params: { screen: "Make" } },
        };

        // first get the url that was either passed in by the url event listener or by the url used to open the app
        // this will be used regardless of whether you have a profile
        const url =
          route.params && route.params.url
            ? route.params.url
            : await getInitialUrl();

        // attempt to load saved profile
        const loadedProfile = await loadProfile();

        // if you do not have a profile, set destination to CreateProfile
        if (!isProfile(loadedProfile)) {
          console.log("profile not found");
          splashDestination = {
            screen: "CreateProfile",
            params: { url },
          };
        } else {
          // if you DO have a profile, set it in redux store and load puzzles
          console.log("profile found");
          dispatch(setProfile(loadedProfile));
          await loadPuzzles();

          // if you have a valid public key in URL, set splash destination to Add Puzzle
          if (url) {
            console.log("initial url found:", url);
            const { path } = Linking.parse(url);
            const publicKey = path?.substring(path.lastIndexOf("/") + 1);
            if (publicKey && publicKey.length === PUBLIC_KEY_LENGTH) {
              splashDestination = {
                screen: "TabContainer",
                params: {
                  screen: "LibraryContainer",
                  params: {
                    screen: "AddPuzzle",
                    params: {
                      publicKey,
                      sourceList: "received",
                    },
                  },
                },
              };
            }
          }
        }

        console.log(
          "navigating to splash destination ",
          JSON.stringify(splashDestination)
        );

        // reset the navigation stack so that users can't navigate to Splash with back button
        navigation.reset({
          index: 0,
          routes: [
            {
              name: splashDestination.screen,
              params: splashDestination.params,
            },
          ],
        });
      };

      loadAppData();
    }, [])
  );

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
