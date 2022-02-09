import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackScreens } from "../../types";
import { Subheader } from "../Layout";
import { AddPuzzle } from "../TransitionScreens";
import { Puzzle } from "../UserScreens";
import PuzzleListContainer from "./PuzzleListContainer";

const Stack = createNativeStackNavigator<StackScreens>();

export default function LibraryContainer(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Gallery">
      <Stack.Screen
        name="PuzzleListContainer"
        component={PuzzleListContainer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPuzzle"
        component={AddPuzzle}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Puzzle"
        component={Puzzle}
        options={{
          header: ({ navigation }) => {
            return (
              <Subheader
                navigation={navigation}
                title="Solve the Pixtery!"
                enableBack
                specificDestination="PuzzleListContainer"
              />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
}
