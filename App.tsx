import {
  CommonActions,
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Linking from "expo-linking";
import React, { useRef, useEffect, useState } from "react";
import { View, LogBox, Dimensions } from "react-native";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AddPuzzle from "./components/AddPuzzle";
import CreateProfile from "./components/CreateProfile";
import DevTest from "./components/DevTest";
import HomeScreen from "./components/Home";
import Profile from "./components/Profile";
import Puzzle from "./components/Puzzle";
import PuzzleList from "./components/PuzzleList";
import SentPuzzleList from "./components/SentPuzzleList";
import Splash from "./components/Splash";
import TitleScreen from "./components/TitleScreen";
import { Puzzle as PuzzleType, Profile as ProfileType } from "./types";
import { goToScreen } from "./util"

//less than ideal, but idk if we have a choice right now. suppresses the firebase timeout warning
LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

const image = require("./assets/earth.jpg");

export const theme = {
  ...DefaultTheme,
  roundness: 10,
  colors: {
    ...DefaultTheme.colors,
    primary: "#7D8CC4",
    accent: "#B8336A",
    background: "#C490D1",
    surface: "#A0D2DB",
    text: "#f8f8ff",
    disabled: "#808080",
    placeholder: "#726DA8",
    backdrop: "#726DA8",
  },
};

const Stack = createStackNavigator();

const App = (): JSX.Element => {
  const [receivedPuzzles, setReceivedPuzzles] = useState<PuzzleType[]>([]);
  const [sentPuzzles, setSentPuzzles] = useState<PuzzleType[]>([]);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const navigationRef = useRef<NavigationContainerRef>();

  const { width, height } = Dimensions.get("screen");
  const boardSize = 0.95 * Math.min(height, width);

  // on url change go to the splash screen, which will stop the user if they aren't logged in
  useEffect(() => {
    Linking.addEventListener("url", (ev) => {
      const url = ev.url;
      if (url && navigationRef.current)
        goToScreen(navigationRef.current, "Splash", { url });
    });
  }, []);

  // to control trigger order and prevent users from skipping the login screen, puzzle querying has been moved to AddPuzzle, which is called from Splash, which is navigated to only after the navigation container loads using the onReady prop
  const gotoSplash = () => {
    if (navigationRef.current) goToScreen(navigationRef.current, "Splash");
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} onReady={gotoSplash}>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack.Navigator initialRouteName="TitleScreen" headerMode="none">
              <Stack.Screen name="TitleScreen">
                {(props) => <TitleScreen {...props} theme={theme} />}
              </Stack.Screen>
              <Stack.Screen name="Splash">
                {(props) => (
                  <Splash
                    {...props}
                    theme={theme}
                    setReceivedPuzzles={setReceivedPuzzles}
                    setSentPuzzles={setSentPuzzles}
                    profile={profile}
                    setProfile={setProfile}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="CreateProfile">
                {(props) => (
                  <CreateProfile
                    {...props}
                    theme={theme}
                    profile={profile}
                    setProfile={setProfile}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Home">
                {(props) => (
                  <HomeScreen
                    {...props}
                    boardSize={boardSize}
                    theme={theme}
                    receivedPuzzles={receivedPuzzles}
                    profile={profile}
                    sentPuzzles={sentPuzzles}
                    setSentPuzzles={setSentPuzzles}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="PuzzleList">
                {(props) => (
                  <PuzzleList
                    {...props}
                    theme={theme}
                    receivedPuzzles={receivedPuzzles}
                    setReceivedPuzzles={setReceivedPuzzles}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="SentPuzzleList">
                {(props) => (
                  <SentPuzzleList
                    {...props}
                    theme={theme}
                    receivedPuzzles={receivedPuzzles}
                    sentPuzzles={sentPuzzles}
                    setSentPuzzles={setSentPuzzles}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Puzzle"
                initialParams={{
                  imageURI: image.uri,
                  puzzleType: "jigsaw",
                  gridSize: 3,
                }}
              >
                {(props) => (
                  <Puzzle
                    {...props}
                    boardSize={boardSize}
                    theme={theme}
                    receivedPuzzles={receivedPuzzles}
                    sentPuzzles={sentPuzzles}
                    setReceivedPuzzles={setReceivedPuzzles}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="AddPuzzle">
                {(props) => (
                  <AddPuzzle
                    {...props}
                    theme={theme}
                    receivedPuzzles={receivedPuzzles}
                    setReceivedPuzzles={setReceivedPuzzles}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Profile">
                {(props) => (
                  <Profile
                    {...props}
                    theme={theme}
                    profile={profile}
                    setProfile={setProfile}
                    receivedPuzzles={receivedPuzzles}
                    setSentPuzzles={setSentPuzzles}
                    sentPuzzles={sentPuzzles}
                    setReceivedPuzzles={setReceivedPuzzles}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="DevTest">
                {(props) => <DevTest {...props} theme={theme} />}
              </Stack.Screen>
            </Stack.Navigator>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
