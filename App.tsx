import {
  CommonActions,
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Linking from "expo-linking";
import React, { createRef, useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { db, storage } from "./FirebaseApp";
import AddPuzzle from "./components/AddPuzzle";
import CreateProfile from "./components/CreateProfile";
import DevTest from "./components/DevTest";
import HomeScreen from "./components/Home";
import Profile from "./components/Profile";
import Puzzle from "./components/Puzzle";
import PuzzleList from "./components/PuzzleList";
import Splash from "./components/Splash";
import { Puzzle as PuzzleType, Profile as ProfileType } from "./types";
import SentPuzzleList from "./components/SentPuzzleList";

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

const App = () => {
  const [receivedPuzzles, setReceivedPuzzles] = useState<PuzzleType[]>([]);
  const [sentPuzzles, setSentPuzzles] = useState<PuzzleType[]>([]);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [initialLoad, setInitialLoad] = useState(false);
  const navigationRef = createRef<NavigationContainerRef>();

  const { width, height } = useWindowDimensions();
  const boardSize = 0.95 * Math.min(height, width);

  //required to download puzzle if sms opens the open
  useEffect(() => {
    let url;
    const getInitialUrl = async () => {
      url = await Linking.getInitialURL();
      if (url && initialLoad) fetchPuzzle(url);
    };
    Linking.addEventListener("url", (ev) => {
      url = ev.url;
      if (url && initialLoad) fetchPuzzle(url);
    });
    if (!url) getInitialUrl();
  }, [initialLoad, navigationRef]);

  const fetchPuzzle = async (url: string): Promise<void> => {
    console.log(url);
    const { publicKey }: any = Linking.parse(url).queryParams;

    // if the puzzle URL has a public key, find either the matching puzzle locally or online
    if (publicKey && navigationRef.current) {
      const matchingPuzzle = receivedPuzzles.filter(
        (puz) => puz.publicKey === publicKey
      );

      //if there's a matching puzzle then
      if (matchingPuzzle.length) {
        //navigate to that puzzle
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Puzzle", params: { ...matchingPuzzle[0] } }],
          })
        );
      } else {
        //otherwise get the puzzle data, which includes the cloud storage reference to the image
        const puzzleData = await queryPuzzle(publicKey);
        //if you have the puzzle, go to the add puzzle component
        if (puzzleData) {
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "AddPuzzle", params: { ...puzzleData } }],
            })
          );
        } else {
          //tell you there's no puzzle bc it wasn't online or local
          //@todo some error message in the UI
          console.log("no puzzle found!");
        }
      }
    }
  };

  const queryPuzzle = async (publicKey: string): Promise<PuzzleType | void> => {
    console.log("query puzzle");
    const snapshot = await db
      .collection("puzzles")
      .where("publicKey", "==", publicKey)
      .get();
    if (snapshot.empty) {
      console.log("no puzzle found!");
    } else {
      let puzzleData: PuzzleType = {
        puzzleType: "",
        gridSize: 0,
        senderName: "",
        senderPhone: "string",
        imageURI: "",
        message: null,
        dateReceived: "",
        completed: false,
      };
      //NOTE: there SHOULD only be one puzzle but it's in an object that has to iterated through to access the data
      snapshot.forEach((puzzle: any) => {
        puzzleData = puzzle.data();
        puzzleData.completed = false;
      });
      console.log("retrieved puzzle data");
      return puzzleData;
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack.Navigator headerMode="none">
              <Stack.Screen name="Splash">
                {(props) => (
                  <Splash
                    {...props}
                    theme={theme}
                    setReceivedPuzzles={setReceivedPuzzles}
                    setSentPuzzles={setSentPuzzles}
                    profile={profile}
                    setProfile={setProfile}
                    initialLoad={initialLoad}
                    setInitialLoad={setInitialLoad}
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
