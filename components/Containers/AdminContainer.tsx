import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AdminContainerParamsList } from "../../types";
import { GalleryQueue, GalleryReview, DailyCalendar } from "../AdminScreens";

const Stack = createNativeStackNavigator<AdminContainerParamsList>();

export default function AdminContainer(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="GalleryQueue">
      <Stack.Screen
        name="GalleryQueue"
        component={GalleryQueue}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GalleryReview"
        component={GalleryReview}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailyCalendar"
        component={DailyCalendar}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
