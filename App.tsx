import { db, storage } from './FirebaseApp';
import React, { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

import Puzzle from "./components/Puzzle";
import HomeScreen from "./components/Home";
import PuzzleList from "./components/PuzzleList";
import DevTest from "./components/DevTest";
import AddPuzzle from "./components/AddPuzzle";
import Splash from "./components/Splash";
import CreateProfile from "./components/CreateProfile";
import Profile from "./components/Profile";

import { Puzzle as PuzzleType, Profile as ProfileType } from "./types";

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
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const { width, height } = useWindowDimensions();
  const boardSize = 0.95 * Math.min(height, width);

  useEffect(() => {
    Linking.getInitialURL().then(url => {
      console.log("resolved URL", url)
      if (url) {
        downloadPuzzle(url)
      }
    })

  }, [])


  // Linking.addEventListener('url', ev => {
  //   console.log("url event", ev)
  //   downloadPuzzle(ev.url)
  // })

  const downloadPuzzle = async (url: string): Promise<void> => {
    const { puzzle } = Linking.parse(url).queryParams
    console.log("DOWNLOAD PUZZLE", puzzle)
    if (puzzle) {
      for(let idx = 0; idx<receivedPuzzles.length; idx++){
        if(puzzle === receivedPuzzles[idx].publicKey) {
          console.log("puzzle already downloaded, should not go to fetch puzzle")
          return;
        }
      }
      fetchPuzzle(puzzle)
    }
  }

  const fetchPuzzle = async (publicKey: string): Promise<void> => {
    console.log("fetching puzzle")
    const puzzleData: PuzzleType = await queryPuzzle(publicKey);
    if (puzzleData) {
      requestImage(puzzleData);
      //@todo do something with the puzzle settings
    }
  }

  const requestImage = (puzzle: PuzzleType): void => {

    const imageRef = storage.ref('/' + puzzle.imageURI);
    imageRef
      .getDownloadURL()
      .then((url) => {
        //@todo do something with the downloaded image
        puzzle.imageURI = url
        setReceivedPuzzles([...receivedPuzzles,puzzle]);
      })
      .catch((e) => console.log('getting downloadURL of image error => ', e));
  }

  const queryPuzzle = async (publicKey: string): Promise<PuzzleType> | Promise<void> => {
    console.log("query puzzle")
    const snapshot = await db.collection("puzzles").where("publicKey", "==", publicKey).get();
    if (snapshot.empty) {
      console.log("no puzzle found!")
    } else {
      let puzzleData: PuzzleType = {
        puzzleType: "",
        gridSize: 0,
        senderName: "",
        senderPhone: "string",
        imageURI: "",
        message: null,
        dateReceived: "",
        completed: false
      }
      //NOTE: there SHOULD only be one puzzle but it's in an object that has to iterated through to access the data
      snapshot.forEach( puzzle => {
        puzzleData = puzzle.data()
      })
      console.log("retrieved puzzle data", puzzleData)
      return puzzleData;
    }


  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack.Navigator headerMode="none">
              <Stack.Screen name="Splash">
                {(props) => (
                  <Splash
                    {...props}
                    theme={theme}
                    setReceivedPuzzles={setReceivedPuzzles}
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
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="PuzzleList">
                {(props) => (
                  <PuzzleList
                    {...props}
                    theme={theme}
                    receivedPuzzles={receivedPuzzles}
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
