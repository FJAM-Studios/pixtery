import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import * as Updates from "expo-updates";
import React, { useRef, useEffect } from "react";
import { Alert, AppState, LogBox, Dimensions, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Provider as StoreProvider,
  useDispatch,
  useSelector,
} from "react-redux";

import { TabContainer } from "./components/Containers";
import { Splash, TitleScreen } from "./components/TransitionScreens";
import { CreateProfile, EnterName } from "./components/UserScreens";
import { MIN_BOTTOM_CLEARANCE } from "./constants";
import store from "./store";
import { setNotificationToken } from "./store/reducers/notificationToken";
import { setDeviceSize } from "./store/reducers/screenHeight";
import { StackScreens, RootState } from "./types";
import { goToScreen } from "./util";
//less than ideal, but idk if we have a choice right now. suppresses the firebase timeout warning
// LogBox.ignoreLogs(["Setting a timer for a long period of time"]);
LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native core and will be removed in a future release",
]);
const Stack = createNativeStackNavigator<StackScreens>();

SplashScreen.preventAutoHideAsync().catch();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const App = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigationRef = useRef<NavigationContainerRef<StackScreens> | null>(
    null
  );
  const theme = useSelector((state: RootState) => state.theme);

  const promptRestart = () => {
    Alert.alert("A new update is ready. Please restart the app.", "", [
      {
        text: "Close",
        style: "cancel",
      },
      {
        text: "Restart",
        onPress: () => Updates.reloadAsync(),
      },
    ]);
  };
  const getUpdate = async () => {
    try {
      const isUpdate = await Updates.checkForUpdateAsync();
      if (isUpdate.isAvailable) {
        await Updates.fetchUpdateAsync();
        promptRestart();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    //don't check for updates in dev mode
    if (process.env.NODE_ENV !== "development") {
      // when update is downloaded, request reload
      Updates.addListener((event) => {
        if (event.type === Updates.UpdateEventType.UPDATE_AVAILABLE) {
          promptRestart();
        }
      });

      //check for updates when app is foregrounded
      AppState.addEventListener("change", () => {
        if (AppState.currentState === "active") {
          getUpdate();
        }
      });
    }

    async function requestTrackingPermissions() {
      try {
        await requestTrackingPermissionsAsync();
      } catch (error) {
        alert(`trackingErr${error}`);
      }
    }
    requestTrackingPermissions();

    const registerForPushNotificationsAsync = async () => {
      if (Constants.isDevice) {
        const {
          status: existingStatus,
        } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          alert("Failed to get push token for push notification!");
          return;
        }
        const token = (
          await Notifications.getExpoPushTokenAsync({
            experienceId: "@fjam-studios/pixtery",
          })
        ).data;
        dispatch(setNotificationToken(token));
      } else {
        alert("Must use physical device for Push Notifications");
      }

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    };

    registerForPushNotificationsAsync();

    const { width, height } = Dimensions.get("screen");

    const boardSize =
      0.95 *
      Math.min(
        Math.min(height, width),
        MIN_BOTTOM_CLEARANCE * Math.max(height, width)
      );
    dispatch(setDeviceSize(width, height, boardSize));

    // on url change go to the splash screen, which will stop the user if they aren't logged in
    Linking.addEventListener("url", (ev) => {
      const url = ev.url;
      if (url && navigationRef.current)
        goToScreen(navigationRef.current, "Splash", { url });
    });
  }, []);

  // to control trigger order and prevent users from skipping the login screen, puzzle querying has been moved to AddPuzzle, which is called from Splash, which is navigated to only after the navigation container loads using the onReady prop
  const gotoSplash = () => {
    // this timeout is if we want to force users to see the starting screen before moving on.
    if (navigationRef.current) {
      goToScreen(navigationRef.current, "Splash");
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} onReady={gotoSplash}>
          <Stack.Navigator
            initialRouteName="TitleScreen"
            screenOptions={{ headerShown: false }}
          >
            {/* Initialization Screens */}
            <Stack.Screen name="TitleScreen" component={TitleScreen} />
            <Stack.Screen name="Splash" component={Splash} />

            {/* Login Screens */}
            <Stack.Screen name="CreateProfile" component={CreateProfile} />
            <Stack.Screen name="EnterName" component={EnterName} />

            {/* Tab Container */}
            <Stack.Screen name="TabContainer" component={TabContainer} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
      <StatusBar
        style={theme.dark ? "light" : "dark"}
        backgroundColor={theme.colors.primary}
      />
    </PaperProvider>
  );
};

const AppWrapper = (): JSX.Element => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider store={store}>
        <RootSiblingParent>
          <App />
        </RootSiblingParent>
      </StoreProvider>
    </GestureHandlerRootView>
  );
};

export default AppWrapper;
