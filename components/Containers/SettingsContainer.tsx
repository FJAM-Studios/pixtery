import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SettingsContainerParamsList } from "../../types";
import { Subheader } from "../Layout";
import {
  ContactUs,
  ManagePuzzles,
  Profile,
  MoreSettings,
} from "../UserScreens";

const Stack = createNativeStackNavigator<SettingsContainerParamsList>();

export default function SettingsContainer(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="MoreSettings"
        component={MoreSettings}
        options={{
          header: ({ navigation }) => {
            return (
              <Subheader navigation={navigation} title="Settings" enableBack />
            );
          },
        }}
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
        options={{ headerShown: false }}
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
