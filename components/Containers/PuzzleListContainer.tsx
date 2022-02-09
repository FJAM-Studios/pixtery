import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { useSelector } from "react-redux";

import { RootState, StackScreens } from "../../types";
import { PuzzleList, SentPuzzleList } from "../UserScreens";

const Tab = createMaterialTopTabNavigator<StackScreens>();
export default function PuzzleListContainer(): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <Tab.Navigator
      initialRouteName="PuzzleList"
      screenOptions={{
        tabBarContentContainerStyle: {
          backgroundColor: theme.colors.primary,
        },
        tabBarActiveTintColor: theme.colors.text,
      }}
    >
      <Tab.Screen
        name="PuzzleList"
        component={PuzzleList}
        options={{ tabBarLabel: "Received" }}
      />
      <Tab.Screen
        name="SentPuzzleList"
        component={SentPuzzleList}
        options={{ tabBarLabel: "Sent" }}
      />
    </Tab.Navigator>
  );
}
