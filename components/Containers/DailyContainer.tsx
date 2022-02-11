import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StackScreens } from "../../types";
import { Subheader } from "../Layout";
import { AddToGallery, Gallery } from "../UserScreens";

const Stack = createNativeStackNavigator<StackScreens>();

export default function DailyContainer(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Gallery">
      <Stack.Screen
        name="Gallery"
        component={Gallery}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddToGallery"
        component={AddToGallery}
        options={{
          header: ({ navigation }) => {
            return (
              <Subheader
                navigation={navigation}
                title="Choose a Pixtery"
                enableBack
              />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
}
