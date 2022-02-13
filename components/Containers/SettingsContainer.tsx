import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackScreens } from "../../types";
import { Subheader } from "../Layout";
import { ContactUs, ManagePuzzles, Profile, Settings } from "../UserScreens";

const Stack = createNativeStackNavigator<StackScreens>();

export default function SettingsContainer(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactUs"
        component={ContactUs}
        options={{
          header: ({ navigation }) => {
            return (
              <Subheader
                navigation={navigation}
                title="Contact Us"
                enableBack
              />
            );
          },
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: ({ navigation }) => {
            return (
              <Subheader navigation={navigation} title="Profile" enableBack />
            );
          },
        }}
      />
      <Stack.Screen
        name="ManagePuzzles"
        component={ManagePuzzles}
        options={{
          header: ({ navigation }) => {
            return (
              <Subheader
                navigation={navigation}
                title="Manage Puzzles"
                enableBack
              />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
}
