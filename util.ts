import {
  CommonActions,
  NavigationContainerRef,
} from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import * as SplashScreen from "expo-splash-screen";
import { Alert, Share } from "react-native";
import Toast from "react-native-root-toast";

import { Puzzle, ScreenNavigation } from "./types";

//convert URI into a blob to transmit to server
export const createBlob = (localUri: string): Promise<Blob> => {
  //converts the image URI into a blob. there are references to using fetch online,
  // but it looks like that was broken in the latest version of expo

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", localUri, true);
    xhr.send(null);
  });
};

export const getRandomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const shareMessage = async (pixUrl: string): Promise<void> => {
  try {
    const content = {
      message:
        "Can you solve this Pixtery?" +
        String.fromCharCode(0xd83d, 0xdcf7) +
        String.fromCharCode(0xd83d, 0xdd75) +
        "\r\n" +
        pixUrl,
    };
    const options = {
      subject: "Someone sent you a Pixtery to solve!",
    };
    await Share.share(content, options);
  } catch (error) {
    alert(error.message);
  }
};

export const goToScreen = (
  navigation: ScreenNavigation | NavigationContainerRef,
  screen: string,
  options: { url?: string | null; publicKey?: string } = {
    url: "",
    publicKey: "",
  }
): void => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: screen, params: options }],
    })
  );
};

export const closeSplashAndNavigate = async (
  navigation: ScreenNavigation | NavigationContainerRef,
  screen: string,
  options: { url?: string | null; publicKey?: string } = {
    url: "",
    publicKey: "",
  }
): Promise<void> => {
  goToScreen(navigation, screen, options);
  await SplashScreen.hideAsync();
};

export const saveToLibrary = async (imageURI: string): Promise<void> => {
  const permission = await checkPermission(false);
  // files must have an extension to be saved but, prior to this update downloaded puzzles weren't given an extension. so in order to remain backwards compatible we're checking for an extension and give the user a warning if not found. only puzzles downloaded prior to this update should cause the alert.
  if (permission === "granted") {
    const extension = imageURI.slice(-4);
    if (extension === ".jpg") {
      try {
        await MediaLibrary.saveToLibraryAsync(
          FileSystem.documentDirectory + imageURI
        );
        Toast.show("Image saved!", {
          duration: Toast.durations.SHORT,
        });
      } catch (e) {
        Toast.show("Image could not be saved", {
          duration: Toast.durations.LONG,
        });
      }
    } else alert("Cannot save image. Please take a screenshot instead.");
  }
};

//a sent puzzle image could be in the received list and vice versa
//so we check before deleting

export const safelyDeletePuzzleImage = async (
  imageURI: string, //image to delete
  keeperList: Puzzle[] //list to check against
): Promise<void> => {
  if (!keeperList.map((puzzle) => puzzle.imageURI).includes(imageURI))
    await FileSystem.deleteAsync(FileSystem.documentDirectory + imageURI);
};

// check and return permission status
export const checkPermission = async (camera: boolean): Promise<string> => {
  let permission = camera
    ? await ImagePicker.getCameraPermissionsAsync()
    : await ImagePicker.getMediaLibraryPermissionsAsync();

  if (permission.status === "granted") return permission.status;
  else if (permission.status === "denied") {
    Alert.alert(
      `Sorry, we need to access your ${
        camera ? "camera" : "photo library"
      } to make this work!`,
      "Please go to your phone's settings to grant permission",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Settings",
          onPress: () => Linking.openSettings(),
        },
      ]
    );
    return permission.status;
  } else {
    permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    return checkPermission(camera);
  }
};
