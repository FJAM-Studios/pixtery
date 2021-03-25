import React, { useState } from "react";
import { useWindowDimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Puzzle from "./Puzzle";
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
            <Puzzle
              {...props}
              boardSize={boardSize}
              imageURI={imageURI}
              puzzleType={"squares"}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Jigsaw" options={{ title: "Solve The Puzzle!" }}>
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
  );
};

export default App;
