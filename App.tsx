import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Linking from "expo-linking";
import React, { useRef, useEffect } from "react";
import { View, LogBox, Dimensions } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import AddPuzzle from "./components/AddPuzzle";
import CreateProfile from "./components/CreateProfile";
import HomeScreen from "./components/Home";
import Profile from "./components/Profile";
import Puzzle from "./components/Puzzle";
import PuzzleList from "./components/PuzzleList";
import SentPuzzleList from "./components/SentPuzzleList";
import Splash from "./components/Splash";
import TitleScreen from "./components/TitleScreen";
import { setDeviceSize } from "./store/reducers/screenHeight";
import { Puzzle as PuzzleType, Profile as ProfileType } from "./types";
import { goToScreen } from "./util";

//less than ideal, but idk if we have a choice right now. suppresses the firebase timeout warning
LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

const image = require("./assets/blank.jpg");

const Stack = createStackNavigator();

const App = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigationRef = useRef<NavigationContainerRef>();
  const theme = useSelector((state) => state.theme);

  // on url change go to the splash screen, which will stop the user if they aren't logged in
  useEffect(() => {
    const { width, height } = Dimensions.get("screen");
    const boardSize = 0.95 * Math.min(height, width);
    dispatch(setDeviceSize(height, boardSize));

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
                {(props) => <TitleScreen {...props} />}
              </Stack.Screen>
              <Stack.Screen name="Splash">
                {(props) => <Splash {...props} />}
              </Stack.Screen>
              <Stack.Screen name="CreateProfile">
                {(props) => <CreateProfile {...props} />}
              </Stack.Screen>
              <Stack.Screen name="Home">
                {(props) => <HomeScreen {...props} />}
              </Stack.Screen>
              <Stack.Screen name="PuzzleList">
                {(props) => <PuzzleList {...props} />}
              </Stack.Screen>
              <Stack.Screen name="SentPuzzleList">
                {(props) => <SentPuzzleList {...props} />}
              </Stack.Screen>
              <Stack.Screen
                name="Puzzle"
                initialParams={{
                  imageURI: image.uri,
                  puzzleType: "jigsaw",
                  gridSize: 3,
                }}
              >
                {(props) => <Puzzle {...props} />}
              </Stack.Screen>
              <Stack.Screen name="AddPuzzle">
                {(props) => <AddPuzzle {...props} />}
              </Stack.Screen>
              <Stack.Screen name="Profile">
                {(props) => <Profile {...props} />}
              </Stack.Screen>
            </Stack.Navigator>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
