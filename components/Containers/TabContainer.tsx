import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome,
} from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { RootState, StackScreens } from "../../types";
import AdminContainer from "./AdminContainer";
import DailyContainer from "./DailyContainer";
import LibraryContainer from "./LibraryContainer";
import MakeContainer from "./MakeContainer";
import SettingsContainer from "./SettingsContainer";

const Tab = createMaterialTopTabNavigator<StackScreens>();

export default function TabContainer(): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.profile);
  const insets = useSafeAreaInsets();
  return (
    <>
      <View
        style={{ height: insets.top, backgroundColor: theme.colors.primary }}
      />
      <SafeAreaView
        edges={["right", "bottom", "left"]}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <Tab.Navigator
          initialRouteName="MakeContainer"
          screenOptions={({ route }) => ({
            tabBarShowLabel: false,
            tabBarAllowFontScaling: true,
            tabBarContentContainerStyle: {
              backgroundColor: theme.colors.primary,
            },
            tabBarLabelStyle: {
              color: theme.dark ? "#FFFFFF" : "#000000",
            },
            tabBarIcon: ({ focused }) => {
              if (route.name === "MakeContainer")
                return (
                  <MaterialCommunityIcons
                    size={24}
                    name="camera-iris"
                    color={focused ? theme.colors.text : theme.colors.onSurface}
                  />
                );
              if (route.name === "DailyContainer")
                return (
                  <MaterialCommunityIcons
                    size={24}
                    name="puzzle"
                    color={focused ? theme.colors.text : theme.colors.onSurface}
                  />
                );
              if (route.name === "LibraryContainer")
                return (
                  <FontAwesome
                    size={24}
                    name="inbox"
                    color={focused ? theme.colors.text : theme.colors.onSurface}
                  />
                );
              if (route.name === "SettingsContainer")
                return (
                  <Ionicons
                    size={24}
                    name="settings"
                    color={focused ? theme.colors.text : theme.colors.onSurface}
                  />
                );
              if (route.name === "AdminContainer")
                return (
                  <MaterialCommunityIcons
                    size={24}
                    name="lock"
                    color={focused ? theme.colors.text : theme.colors.onSurface}
                  />
                );
            },
          })}
        >
          <Tab.Screen
            name="DailyContainer"
            component={DailyContainer}
            options={{ tabBarLabel: "Daily" }}
          />
          <Tab.Screen
            name="MakeContainer"
            component={MakeContainer}
            options={{ title: "Make" }}
          />
          <Tab.Screen
            name="LibraryContainer"
            component={LibraryContainer}
            options={{ tabBarLabel: "Library" }}
          />
          <Tab.Screen
            name="SettingsContainer"
            component={SettingsContainer}
            options={{ tabBarLabel: "Settings" }}
          />
          {profile && profile.isGalleryAdmin ? (
            <Tab.Screen
              name="AdminContainer"
              component={AdminContainer}
              options={{ tabBarLabel: "Admin" }}
            />
          ) : null}
        </Tab.Navigator>
      </SafeAreaView>
    </>
  );
}
