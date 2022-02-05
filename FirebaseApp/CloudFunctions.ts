import { getFunctions, httpsCallable } from "firebase/functions";

import { app } from "./InitializeFirebase"; // import from here instead of index so that webpack doesn't import unnecessary code

export const functions = getFunctions(app);

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
