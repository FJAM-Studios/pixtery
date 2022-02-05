import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <Tab.Navigator
        initialRouteName="MakeContainer"
        screenOptions={({ route }) => ({
          tabBarAllowFontScaling: true,
          tabBarContentContainerStyle: {
            backgroundColor: theme.colors.primary,
          },
          tabBarLabelStyle: {
            color: theme.colors.text,
          },
          tabBarIcon: ({ focused }) => {
            let iconName: React.ComponentProps<
              typeof MaterialCommunityIcons
            >["name"] = "alert-circle";
            if (route.name === "MakeContainer") iconName = "camera-iris";
            if (route.name === "DailyContainer")
              iconName = "white-balance-sunny";
            if (route.name === "LibraryContainer") iconName = "book-multiple";
            if (route.name === "SettingsContainer")
              return (
                <Ionicons
                  size={24}
                  name="settings"
                  color={focused ? theme.colors.text : theme.colors.onSurface}
                />
              );
            if (route.name === "AdminContainer") iconName = "lock";
            return (
              <MaterialCommunityIcons
                size={24}
                name={iconName}
                color={focused ? theme.colors.text : theme.colors.onSurface}
              />
            );
          },
        })}
      >
        <Tab.Screen
          name="MakeContainer"
          component={MakeContainer}
          options={{ title: "Make" }}
        />
        <Tab.Screen
          name="DailyContainer"
          component={DailyContainer}
          options={{ tabBarLabel: "Daily" }}
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
      <SafeAreaView
        style={{ flex: 0, backgroundColor: theme.colors.background }}
      />
    </SafeAreaView>
  );
}
