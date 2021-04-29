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

import { functions } from "./FirebaseApp";
import AddPuzzle from "./components/AddPuzzle";
import Puzzle from "./components/Puzzle";
import { Puzzle as PuzzleType } from "./types";
import { selectPuzzle } from "./util";

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
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType>();
  const navigationRef = createRef<NavigationContainerRef>();

  const { width, height } = useWindowDimensions();
  const boardSize = 0.95 * Math.min(height, width);

  //required to download puzzle if sms opens the open
  useEffect(() => {
    let url;
    const getInitialUrl = async () => {
      url = await Linking.getInitialURL();
      if (url) fetchPuzzle(url);
    };
    if (!url) getInitialUrl();
  }, []);

  const fetchPuzzle = async (url: string): Promise<void> => {
    console.log(url);
    const { publicKey }: any = Linking.parse(url).queryParams;

    // if the puzzle URL has a public key, find either the matching puzzle locally or online
    if (publicKey && navigationRef.current) {
      const matchingPuzzle = selectPuzzle(publicKey, receivedPuzzles);

      //if there's a matching puzzle then
      if (matchingPuzzle) {
        setSelectedPuzzle(matchingPuzzle);
        //navigate to that puzzle
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Puzzle" }],
          })
        );
      } else {
        //otherwise get the puzzle data, which includes the cloud storage reference to the image
        const puzzleData = await queryPuzzle(publicKey);
        console.log("received", puzzleData);
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
    const queryPuzzleCallable = functions.httpsCallable("queryPuzzle");
    let puzzleData;
    try {
      puzzleData = await queryPuzzleCallable({ publicKey });
      return puzzleData.data; // get just nested data from returned JSON
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack.Navigator headerMode="none">
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
                    puzzle={selectedPuzzle}
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
                    setSelectedPuzzle={setSelectedPuzzle}
                  />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
