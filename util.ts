import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import { Alert, Share } from "react-native";
import Toast from "react-native-root-toast";
import { Dispatch } from "redux";

import {
  deactivateAllUserPuzzles,
  deactivateUserPuzzle,
  fetchPuzzles,
  getPixteryURL,
} from "./FirebaseApp";
import { DATE_FORMAT } from "./constants";
import { setProfile } from "./store/reducers/profile";
import { setReceivedPuzzles } from "./store/reducers/receivedPuzzles";
import { setSentPuzzles } from "./store/reducers/sentPuzzles";
import { Puzzle, DateObjString, Profile } from "./types";

dayjs.extend(calendar);

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
    if (error instanceof Error) console.log(error.message);
  }
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
    } else
      Toast.show("Cannot save image. Please take a screenshot instead.", {
        duration: Toast.durations.SHORT,
      });
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
    const downloadURL = await getPixteryURL("/" + imageURI);
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
    if (error instanceof Error) throw new Error(error.message);
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
  const puzzles = await fetchPuzzles(listType);
  return puzzles.data as Puzzle[];
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

export const restorePuzzleMetadata = async (
  receivedState: Puzzle[],
  sentState: Puzzle[]
): Promise<Puzzle[][]> => {
  const [receivedFromServer, sentFromServer] = await fetchAllPuzzleData();
  const mergedReceivedPuzzles = await mergePuzzles(
    "@pixteryPuzzles",
    receivedState,
    receivedFromServer
  );
  const mergedSentPuzzles = await mergePuzzles(
    "@pixterySentPuzzles",
    sentState,
    sentFromServer
  );
  return [mergedReceivedPuzzles, mergedSentPuzzles];
};
export const restorePuzzles = async (
  receivedState: Puzzle[],
  sentState: Puzzle[]
): Promise<Puzzle[][]> => {
  try {
    Toast.show(`Downloading puzzles from server`, {
      duration: Toast.durations.SHORT,
    });
    const [
      mergedReceivedPuzzles,
      mergedSentPuzzles,
    ] = await restorePuzzleMetadata(receivedState, sentState);
    let imageErrors = await fetchImages(mergedReceivedPuzzles);
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
    await deactivateUserPuzzle({ publicKey, list });
  } catch (error) {
    console.log(error);
  }
};

export const deactivateAllPuzzlesOnServer = async (
  list: string
): Promise<void> => {
  try {
    await deactivateAllUserPuzzles(list);
  } catch (error) {
    console.log(error);
  }
};

export const clearEIMcache = async (): Promise<void> => {
  console.log("Checking EIM cache...");
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

// converts single digit integers to double digit strings (e.g. 9 -> "09")
export const convertIntToDoubleDigitString = (number: number): string => {
  // return the two numbers from end of string (i.e. "09" or "10")
  return `0${number}`.slice(-2);
};

export const convertDateStringToObject = (
  dateString: string
): DateObjString => {
  // dateString passed in is "YYYY-MM-DD"
  const dateArray = dateString.split("-");
  return {
    year: dateArray[0],
    month: dateArray[1],
    day: dateArray[2],
  };
};

export function msToTime(duration: number): string {
  const seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const _hours = hours < 10 ? "0" + hours : hours;
  const _minutes = minutes < 10 ? "0" + minutes : minutes;
  const _seconds = seconds < 10 ? "0" + seconds : seconds;

  return _hours + ":" + _minutes + ":" + _seconds;
}

export function secondsToTime(duration: number): string {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const _hours = hours < 10 ? "0" + hours : hours;
  const _minutes = minutes < 10 ? "0" + minutes : minutes;
  const _seconds = seconds < 10 ? "0" + seconds : seconds;

  return _hours + ":" + _minutes + ":" + _seconds;
}
export const isEmail = (email: string): boolean => {
  // return email.length > 0 && (!email.includes(".") || !email.includes("@"));

  // I think the above logic isn't right for general use. It might've been written for the optional email
  // in Contact Us, but that's confusing because the function is called isEmail and it's used elsewhere.
  // Here's a simple validator that I found on SO:
  // https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript

  if (
    email.match(
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  )
    return true;
  return false;
};

export const isProfile = (profile: unknown): profile is Profile => {
  return (
    profile !== undefined &&
    profile !== null &&
    (profile as Profile).name !== undefined
  );
};

export const formatDateFromString = (date: string): string => {
  return dayjs(date).calendar(null, dateFormatOptions);
};

export const clearAllAppData = async (dispatch: Dispatch): Promise<void> => {
  // delete local storage
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys);
  // clear app state
  dispatch(setReceivedPuzzles([]));
  dispatch(setSentPuzzles([]));
  dispatch(setProfile(null));
  // erase local puzzles
  eraseAllImages();
};

export const eraseAllImages = async (): Promise<void> => {
  if (FileSystem.documentDirectory) {
    const pixteryImages = (
      await FileSystem.readDirectoryAsync(FileSystem.documentDirectory)
    ).filter((uri) => uri.slice(-4) === ".jpg");

    pixteryImages.map((imageURI) => {
      FileSystem.deleteAsync(FileSystem.documentDirectory + imageURI);
    });
    clearEIMcache();
  }
};

const dateFormatOptions = {
  sameDay: "[Today at] h:mm A", // The same day ( Today at 2:30 AM )
  nextDay: "[Tomorrow at] h:mm A", // The next day ( Tomorrow at 2:30 AM )
  nextWeek: "dddd [at] h:mm A", // The next week ( Sunday at 2:30 AM )
  lastDay: "[Yesterday at] h:mm A", // The day before ( Yesterday at 2:30 AM )
  lastWeek: "[Last] dddd [at] h:mm A", // Last week ( Last Monday at 2:30 AM )
  sameElse: DATE_FORMAT, // Everything else ( Jan 23 2022 )
};
