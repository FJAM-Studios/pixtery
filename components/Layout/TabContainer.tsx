import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { RootState, StackScreens } from "../../types";
import { Gallery, Make, Profile, PuzzleList } from "../UserScreens";

const Tab = createMaterialTopTabNavigator<StackScreens>();

export default function TabContainer(): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Gallery"
        screenOptions={{
          tabBarContentContainerStyle: {
            backgroundColor: theme.colors.primary,
          },
          tabBarLabelStyle: {
            color: theme.colors.text,
          },
        }}
      >
        <Tab.Screen
          name="Gallery"
          component={Gallery}
          options={{ tabBarLabel: "Daily" }}
        />
        <Tab.Screen
          name="Make"
          component={Make}
          options={{ tabBarLabel: "Make" }}
        />
        <Tab.Screen
          name="PuzzleList"
          component={PuzzleList}
          options={{ tabBarLabel: "List" }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{ tabBarLabel: "Profile" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
