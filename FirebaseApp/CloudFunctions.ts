import Constants from "expo-constants";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";

import { app } from "./InitializeFirebase"; // import from here instead of index so that webpack doesn't import unnecessary code

export const functions = getFunctions(app);

// uncomment if not using block below for func emu testing
// import { MY_LAN_IP } from "./ip";
// functions.useFunctionsEmulator(`${MY_LAN_IP}:5001`);

if (
  Constants.manifest &&
  Constants.manifest.extra &&
  Constants.manifest.extra.functionEmulator &&
  Constants.manifest.debuggerHost
) {
  const host = `${Constants.manifest.debuggerHost.split(":")[0]}`;
  const port = 5001;
  console.log(
    "\x1b[34m%s\x1b[0m",
    `using functions emulator on ${host}:${port}`
  );
  connectFunctionsEmulator(functions, host, port);
}

// all firebase cloud functions ///////////////

export const addToQueue = httpsCallable(functions, "addToQueue");
export const fetchPuzzles = httpsCallable(functions, "fetchPuzzles");
export const deactivateUserPuzzle = httpsCallable(
  functions,
  "deactivateUserPuzzle"
);
export const deactivateAllUserPuzzles = httpsCallable(
  functions,
  "deactivateAllUserPuzzles"
);
export const queryPuzzleCallable = httpsCallable(functions, "queryPuzzle");
export const uploadPuzzleSettingsCallable = httpsCallable(
  functions,
  "uploadPuzzleSettings"
);
export const getGalleryQueue = httpsCallable(functions, "getGalleryQueue");
export const addToGallery = httpsCallable(functions, "addToGallery");
export const removeDailyPuzzle = httpsCallable(functions, "removeDailyPuzzle");
export const deactivateInQueue = httpsCallable(functions, "deactivateInQueue");
export const getDailyDates = httpsCallable(functions, "getDailyDates");
export const submitFeedbackCallable = httpsCallable(
  functions,
  "submitFeedback"
);
export const getDaily = httpsCallable(functions, "getDaily");
export const migratePuzzles = httpsCallable(functions, "migratePuzzles");
export const checkGalleryAdmin = httpsCallable(functions, "checkGalleryAdmin");
export const deleteUserCallable = httpsCallable(functions, "deleteUser");
