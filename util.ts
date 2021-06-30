import {
  CommonActions,
  NavigationContainerRef,
} from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as SplashScreen from "expo-splash-screen";
import { Share } from "react-native";

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

//a sent puzzle image could be in the received list and vice versa
//so we check before deleting
export const safelyDeletePuzzleImage = async (
  imageURI: string, //image to delete
  keeperList: Puzzle[] //list to check against
): Promise<void> => {
  if (!keeperList.map((puzzle) => puzzle.imageURI).includes(imageURI))
    await FileSystem.deleteAsync(imageURI);
};
