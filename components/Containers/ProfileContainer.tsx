import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { StackScreens } from "../../types";
import { Subheader } from "../Layout";
import { ContactUs, Profile } from "../UserScreens";

const Stack = createNativeStackNavigator<StackScreens>();

export default function ProfileContainer(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        component={Profile}
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
    </Stack.Navigator>
  );
}
