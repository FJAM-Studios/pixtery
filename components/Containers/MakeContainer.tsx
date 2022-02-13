import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";

import { RootState, StackScreens } from "../../types";
import { Tutorial, Make } from "../UserScreens";

const Stack = createNativeStackNavigator<StackScreens>();

export default function MakeContainer(): JSX.Element {
  const tutorialFinished = useSelector(
    (state: RootState) => state.tutorialFinished
  );
  return (
    <Stack.Navigator
      initialRouteName={!tutorialFinished ? "Tutorial" : "Make"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Make" component={Make} />
      <Stack.Screen name="Tutorial" component={Tutorial} />
    </Stack.Navigator>
  );
}
