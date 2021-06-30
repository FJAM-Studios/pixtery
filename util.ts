import {
  CommonActions,
  NavigationContainerRef,
} from "@react-navigation/native";
import * as MediaLibrary from "expo-media-library";
import * as SplashScreen from "expo-splash-screen";
import { Share } from "react-native";

import { ScreenNavigation } from "./types";

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
  // files must have an extension to be saved but, prior to this update downloaded puzzles weren't given an extension. so in order to remain backwards compatible we're checking for an extension and give the user a warning if not found. only puzzles downloaded prior to this update should cause the alert.

  const extension = imageURI.slice(-4);
  if (extension === ".jpg") MediaLibrary.saveToLibraryAsync(imageURI);
  else alert("Cannot save image. Please take a screenshot instead.");
};
