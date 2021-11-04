import AsyncStorage from "@react-native-async-storage/async-storage";
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

import { storage, functions } from "./FirebaseApp";
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
  } catch (error: unknown) {
    if (error instanceof Error) alert(error.message);
  }
};

export const goToScreen = (
  navigation: ScreenNavigation | NavigationContainerRef,
  screen: string,
  options: { url?: string | null; publicKey?: string; sourceList?: string } = {
    url: "",
    publicKey: "",
    sourceList: "",
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
  options: { url?: string | null; publicKey?: string; sourceList?: string } = {
    url: "",
    publicKey: "",
    sourceList: "",
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
  if (!keeperList.map((puzzle) => puzzle.imageURI).includes(imageURI)) {
    const fileInfo = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + imageURI
    );
    if (fileInfo.exists)
      await FileSystem.deleteAsync(FileSystem.documentDirectory + imageURI);
  }
};

export const updateImageURIs = async (
  loadedPuzzles: Puzzle[],
  loadedSentPuzzles: Puzzle[]
): Promise<boolean> => {
  //check if there is already an updateImageURIs key and, if so, skip this update routine
  const alreadyUpdated = await AsyncStorage.getItem("@updateImageURIs");
  if (alreadyUpdated) {
    console.log("Images have already been moved");
    //return false so the Splash component doesn't re-save the puzzles
    return false;
  }
  console.log("Images not yet updated");

  //go through each recvd and/or sent puzzle
  const allPuzzles = [...loadedPuzzles, ...loadedSentPuzzles];

  for (let i = 0; i < allPuzzles.length; i++) {
    //the puzzle and image URI this will update
    //for example:
    // file:///data/user/0/host.exp.exponent/.../pixtery/78bc6d3b-f1b9-4d65-9790-eded084efd90
    const updatingPuzzle = allPuzzles[i];
    const { imageURI } = updatingPuzzle;

    //get just the filename without the path
    //for example:
    //78bc6d3b-f1b9-4d65-9790-eded084efd90
    const fileName = imageURI.slice(imageURI.lastIndexOf("/") + 1);

    //new extension is .jpg unless it's already got a .jpg extension
    const newExtension = imageURI.slice(-4) === ".jpg" ? "" : ".jpg";

    //new URI will be just the fileName + extension
    //ex: 78bc6d3b-f1b9-4d65-9790-eded084efd90.jpg
    const newURI = fileName + newExtension;

    //try to move the file from its original location to the documentDirectory
    try {
      console.log("moving from " + imageURI);
      console.log("to " + FileSystem.documentDirectory + newURI);
      await FileSystem.moveAsync({
        from: imageURI,
        to: FileSystem.documentDirectory + newURI,
      });

      //change the imageURI in the puzzle object
      console.log("setting new puzzle imageURI to " + newURI);
      updatingPuzzle.imageURI = newURI;
    } catch (e) {
      console.log(e);
      //@todo
      //if this image isn't found, remove it from the list
    }
  }

  //mark the function as having been run
  await AsyncStorage.setItem("@updateImageURIs", "@updateImageURIs");

  //for testing
  //await AsyncStorage.removeItem("@updateImageURIs");

  //return true so the Splash component re-saves the puzzles
  return true;
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

export const downloadImage = async (
  newPuzzle: Puzzle,
  temporaryStorage = false
): Promise<number> => {
  try {
    const { imageURI } = newPuzzle;
    // for now, giving image a filename based on URL from server, can change later if needed
    const fileName = imageURI.slice(imageURI.lastIndexOf("/") + 1);
    const downloadURL = await storage.ref("/" + imageURI).getDownloadURL();
    //put jpg in upload instead of here
    //but user could still download old pixtery (with no uploaded extension), so addl logic needed
    const extension = imageURI.slice(-4) === ".jpg" ? "" : ".jpg";
    newPuzzle.imageURI = fileName + extension;
    const downloadFolder = temporaryStorage
      ? FileSystem.cacheDirectory + "ImageManipulator"
      : FileSystem.documentDirectory;
    const localURI = downloadFolder + fileName + extension;
    // if you already have this image, don't download it
    const fileInfo = await FileSystem.getInfoAsync(localURI);
    if (!fileInfo.exists) {
      console.log("Image doesn't exist, downloading...");
      // download the image from pixtery server and save to pixtery dir
      await FileSystem.downloadAsync(downloadURL, localURI);
    }

    return 0;
  } catch (error) {
    console.log(error);
    // NOTE: I am not throwing an error here because if something goes wrong and an image can't be downloaded, we should still continue with the puzzle data that we do have and rely on the function asking the user to redownload the image when opening the puzzle. Also, assuming it was just an internet issue, hitting restore puzzles when you have better service should redownload the images that you don't have.
    return 1;
  }
};

const fetchImages = async (puzzles: Puzzle[]): Promise<number> => {
  let downloadErrors = 0;

  for (const puzzle of puzzles) {
    const error = await downloadImage(puzzle);
    downloadErrors += error;
    console.log("Download errors:", downloadErrors);
  }
  // puzzles.forEach(async (puzzle) => {
  //   const error = await downloadImage(puzzle);
  //   downloadErrors += error;
  // });

  return downloadErrors;
};

const fetchAllPuzzleData = async (): Promise<Puzzle[][]> => {
  try {
    const receivedPuzzles = await fetchCollection("received");
    const sentPuzzles = await fetchCollection("sent");
    return [receivedPuzzles, sentPuzzles];
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching puzzle data from server");
  }
};

const fetchCollection = async (listType: string): Promise<Puzzle[]> => {
  const fetchPuzzles = functions.httpsCallable("fetchPuzzles");
  const puzzles = await fetchPuzzles(listType);
  return puzzles.data;
};

const mergePuzzles = async (
  storageKey: string,
  puzzlesInState: Puzzle[],
  downloadedPuzzles: Puzzle[]
) => {
  try {
    // run through downloaded puzzles and select only puzzles that aren't already in state.
    // add those puzzles to state and add them to memory
    const allPuzzles = [
      ...puzzlesInState,
      ...downloadedPuzzles.filter(
        (downloadedPuzzle) =>
          !puzzlesInState.find(
            (puzzleInState) =>
              puzzleInState.publicKey === downloadedPuzzle.publicKey
          )
      ),
    ];
    await AsyncStorage.setItem(storageKey, JSON.stringify(allPuzzles));

    return allPuzzles;
  } catch (error) {
    console.log(error);
    throw new Error("Error saving puzzle data to device");
  }
};

export const restorePuzzles = async (
  receivedState: Puzzle[],
  sentState: Puzzle[]
): Promise<Puzzle[][]> => {
  try {
    Toast.show(`Downloading puzzles from server`, {
      duration: Toast.durations.SHORT,
    });
    const [receivedFromServer, sentFromServer] = await fetchAllPuzzleData();
    const mergedReceivedPuzzles = await mergePuzzles(
      "@pixteryPuzzles",
      receivedState,
      receivedFromServer
    );
    let imageErrors = await fetchImages(mergedReceivedPuzzles);
    const mergedSentPuzzles = await mergePuzzles(
      "@pixterySentPuzzles",
      sentState,
      sentFromServer
    );
    imageErrors += await fetchImages(mergedSentPuzzles);
    if (imageErrors > 0)
      Toast.show(
        `Could not download ${imageErrors} images.\nThis may be due to poor internet connection.\nPlease try again later.`,
        {
          duration: Toast.durations.LONG,
        }
      );
    else
      Toast.show(
        receivedState.length === mergedReceivedPuzzles.length &&
          sentState.length === mergedSentPuzzles.length
          ? "Puzzles already up to date"
          : "Puzzles downloaded",
        {
          duration: Toast.durations.SHORT,
        }
      );
    return [mergedReceivedPuzzles, mergedSentPuzzles];
  } catch (error) {
    console.log(error);
    Toast.show(
      `Could not restore puzzles.\nThis may be due to poor internet connection.\nPlease try again later.`,
      {
        duration: Toast.durations.LONG,
      }
    );
    throw new Error("Error restoring puzzles");
  }
};

export const deactivatePuzzleOnServer = async (
  publicKey: string,
  list: string
): Promise<void> => {
  try {
    const deactivateUserPuzzle = functions.httpsCallable(
      "deactivateUserPuzzle"
    );
    await deactivateUserPuzzle({ publicKey, list });
  } catch (error) {
    console.log(error);
  }
};

export const deactivateAllPuzzlesOnServer = async (
  list: string
): Promise<void> => {
  try {
    const deactivateAllUserPuzzles = functions.httpsCallable(
      "deactivateAllUserPuzzles"
    );
    await deactivateAllUserPuzzles(list);
  } catch (error) {
    console.log(error);
  }
};

export const clearEIMcache = async (): Promise<void> => {
  try {
    const EIMcacheDir = FileSystem.cacheDirectory + "ImageManipulator";
    const EIMcacheInfo = await FileSystem.getInfoAsync(EIMcacheDir);
    if (EIMcacheInfo.exists && EIMcacheInfo.isDirectory) {
      console.log("removing old EIM cache...");
      await FileSystem.deleteAsync(EIMcacheDir);
    } else {
      console.log("No EIM cache found");
    }
  } catch (e) {
    console.log(e);
  }
};
