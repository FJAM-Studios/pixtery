import React, { useState } from "react";
import { useWindowDimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Puzzle from "./Puzzle";
import HomeScreen from "./Home";

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
  const [imageURI, setImageURI] = useState("");
  const [puzzleType, setPuzzleType] = useState("jigsaw");
  const [gridSize, setGridSize] = useState(3);
  const { width, height } = useWindowDimensions();
  const boardSize = 0.95 * Math.min(height, width);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator headerMode="none">
            <Stack.Screen name="Home">
              {(props) => (
                <HomeScreen
                  {...props}
                  setImageURI={setImageURI}
                  imageURI={imageURI}
                  boardSize={boardSize}
                  theme={theme}
                  puzzleType={puzzleType}
                  setPuzzleType={setPuzzleType}
                  gridSize={gridSize}
                  setGridSize={setGridSize}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Squares"
              options={{ title: "Drag The Pictures!" }}
            >
              {(props) => (
                <Puzzle
                  {...props}
                  boardSize={boardSize}
                  imageURI={imageURI}
                  puzzleType={"squares"}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Jigsaw"
              options={{ title: "Solve The Puzzle!" }}
            >
              {(props) => (
                <Puzzle
                  {...props}
                  boardSize={boardSize}
                  imageURI={imageURI}
                  puzzleType={"jigsaw"}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
