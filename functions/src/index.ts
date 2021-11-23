export { handleEmail } from "./fns/emailFns"

export { 
  checkGalleryAdmin, 
  addToGallery, 
  getDailyDates, 
  removeDailyPuzzle, 
  getDaily 
} from "./fns/galleryFns"

export {
  uploadPuzzleSettings,
  queryPuzzle,
} from "./fns/puzzleFns"

export {
  getGalleryQueue, 
  deactivateInQueue, 
  addToQueue, 
} from "./fns/queueFns"

export {
  fetchPuzzles,
  deactivateAllUserPuzzles,
  deactivateUserPuzzle
} from "./fns/userFns"

