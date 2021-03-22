import React, { useState, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SquaresPuzzle from "./SquaresPuzzle";
import JigsawPuzzle from "./JigsawPuzzle";
import HomeScreen from "./Home";

const Stack = createStackNavigator();

const App = () => {
  const [imageURI, setImageURI] = useState("");
  const { width, height } = useWindowDimensions();
  const boardSize = 0.95 * Math.min(height, width);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{ title: "Pixtery" }}>
          {(props) => (
            <HomeScreen
              {...props}
              setImageURI={setImageURI}
              imageURI={imageURI}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Squares" options={{ title: "Drag The Pictures!" }}>
          {(props) => (
            <SquaresPuzzle
              {...props}
              boardSize={boardSize}
              imageURI={imageURI}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Jigsaw" options={{ title: "Solve The Puzzle!" }}>
          {(props) => (
            <JigsawPuzzle
              {...props}
              boardSize={boardSize}
              imageURI={imageURI}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
