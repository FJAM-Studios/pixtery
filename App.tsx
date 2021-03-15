import * as React from "react";
import { useWindowDimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Puzzle from "./Puzzle";

const Stack = createStackNavigator();

const App = () => {
  const { width, height } = useWindowDimensions();
  const _squareSize = (0.95 * Math.min(height, width)) / 3;
  const squareSize = Math.max(height, width) / 6;
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Drag The Pictures!">
          {(props) => <Puzzle {...props} squareSize={squareSize} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
