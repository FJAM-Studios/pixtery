export { submitFeedback } from "./fns/emailFns";

export {
  checkGalleryAdmin,
  addToGallery,
  getDailyDates,
  removeDailyPuzzle,
  getDaily,
  populateBlankDaily,
} from "./fns/galleryFns";

export { uploadPuzzleSettings, queryPuzzle } from "./fns/puzzleFns";

export { getGalleryQueue, deactivateInQueue, addToQueue } from "./fns/queueFns";

export {
  fetchPuzzles,
  deactivateAllUserPuzzles,
  deactivateUserPuzzle,
  migratePuzzles,
  deleteUser,
} from "./fns/userFns";
