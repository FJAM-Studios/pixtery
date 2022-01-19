import Constants from "expo-constants";
import { FirebaseError, initializeApp } from "firebase/app";
import {
  PhoneAuthProvider,
  getAuth,
  signOut as signOutFB,
  signInAnonymously,
  User,
  AuthCredential,
  EmailAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";

import { SignInOptions } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyANqRXsUQIKxT9HtG4gIQ6EmsKEMCzCyuo",
  authDomain: "pixtery.io",
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
  projectId: "pixstery-7c9b9",
  storageBucket: "pixstery-7c9b9.appspot.com",
  messagingSenderId: "503392467903",
  appId: "1:503392467903:web:6283d87be13230e6caff0a",
  measurementId: "G-5XDDLZ009P",
};

const app = initializeApp(firebaseConfig);

const functions = getFunctions(app);

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

// const storage = app.storage();
const auth = getAuth();
const phoneProvider = new PhoneAuthProvider(auth);

const signOut = (): Promise<void> => {
  return signOutFB(auth);
};

const anonSignIn = async (): Promise<void> => {
  try {
    // Anonymous sign in. This should only fire the first time someone uses the app.

    // why only if auth.currentUser? This seems to create a problem if you're signed in then sign out and try to sign in anon
    // if (auth.currentUser) await signInAnonymously(auth);

    await signInAnonymously(auth);
  } catch (error) {
    console.log(error);
  }
};

const migratePuzzles = async (prevUserId: string): Promise<void> => {
  console.log("MIGRATE PUZZLES");
  const _migratePuzzles = httpsCallable(functions, "migratePuzzles");
  _migratePuzzles(prevUserId);
};

const signInOnFireBase = async (
  providerType: SignInOptions,
  id: string,
  verificationCode: string
): Promise<User | void> => {
  let newCredential: AuthCredential | null = null;

  if (providerType === SignInOptions.PHONE) {
    const authProvider = PhoneAuthProvider;
    newCredential = await authProvider.credential(id, verificationCode);
  }

  if (providerType === SignInOptions.EMAIL) {
    const authProvider = EmailAuthProvider;
    newCredential = await authProvider.credential(id, verificationCode);
  }

  if (newCredential) {
    try {
      // Get user credential using auth provider
      const prevUser = auth.currentUser;
      ////the below comes from https://firebase.google.com/docs/auth/web/account-linking
      let currentUser;
      // Sign in user with the account you want to link to
      await signInWithCredential(auth, newCredential).then((result) => {
        currentUser = result.user;

        // Merge prevUser and currentUser data stored in Firebase.
        // Note: How you handle this is specific to your application
        if (currentUser && prevUser && prevUser.uid !== currentUser.uid)
          migratePuzzles(prevUser.uid);
        // return currentUser;
      });
      return currentUser;
    } catch (error) {
      // throwing error so the Register component has an error message to display to the user.
      if (error instanceof FirebaseError) {
        if (error.code === "auth/wrong-password")
          throw new Error("Incorrect password.");
        else if (error.code === "auth/user-not-found")
          throw new Error("User not found.");
      } else {
        throw new Error("Could not sign in at this time. Please try again.");
      }
    }
  }
};

const signUpEmail = async (
  email: string,
  password: string
): Promise<User | void> => {
  try {
    const prevUid = auth.currentUser?.uid;
    const newCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (newCredential && newCredential.user && prevUid) migratePuzzles(prevUid);
    // return new user
    if (newCredential.user) return newCredential.user;
    throw new Error("Something went wrong");
  } catch (error) {
    // throwing error so the Register component has an error message to display to the user.
    if (error instanceof FirebaseError) {
      if (error.code === "auth/wrong-password")
        throw new Error("Incorrect password.");
      else if (error.code === "auth/user-not-found")
        throw new Error("User not found.");
    } else {
      throw new Error("Could not sign in at this time. Please try again.");
    }
  }
};

const checkAdminStatus = async (): Promise<boolean> => {
  try {
    // get whether or not pixtery admin
    const checkGalleryAdmin = httpsCallable(functions, "checkGalleryAdmin");
    const res = await checkGalleryAdmin();
    const isGalleryAdmin = res.data;
    return isGalleryAdmin as boolean;
  } catch (e) {
    console.log("could not verify admin status");
    return false;
  }
};

const sendResetEmail = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (e) {
    console.log(e);
    throw new Error(
      "Could not send reset email. Check email address or try again later."
    );
  }
};

const storage = getStorage(app);

const addToQueue = httpsCallable(functions, "addToQueue");
const fetchPuzzles = httpsCallable(functions, "fetchPuzzles");
const deactivateUserPuzzle = httpsCallable(functions, "deactivateUserPuzzle");
const deactivateAllUserPuzzles = httpsCallable(
  functions,
  "deactivateAllUserPuzzles"
);
const queryPuzzleCallable = httpsCallable(functions, "queryPuzzle");
const uploadPuzzleSettingsCallable = httpsCallable(
  functions,
  "uploadPuzzleSettings"
);
const getGalleryQueue = httpsCallable(functions, "getGalleryQueue");
const addToGallery = httpsCallable(functions, "addToGallery");
const removeDailyPuzzle = httpsCallable(functions, "removeDailyPuzzle");
const deactivateInQueue = httpsCallable(functions, "deactivateInQueue");
const getDailyDates = httpsCallable(functions, "getDailyDates");
const submitFeedbackCallable = httpsCallable(functions, "submitFeedback");
const getDaily = httpsCallable(functions, "getDaily");

const getPixteryURL = async (str: string): Promise<string> => {
  const url = await getDownloadURL(ref(storage, str));
  return url;
};

const uploadBlob = async (fileName: string, blob: Blob): Promise<void> => {
  try {
    await uploadBytes(ref(storage, fileName), blob);
  } catch (e) {
    console.log(e);
  }
};

export {
  auth,
  phoneProvider,
  firebaseConfig,
  addToQueue,
  fetchPuzzles,
  deactivateUserPuzzle,
  deactivateAllUserPuzzles,
  queryPuzzleCallable,
  uploadPuzzleSettingsCallable,
  uploadBlob,
  getGalleryQueue,
  addToGallery,
  removeDailyPuzzle,
  deactivateInQueue,
  getDailyDates,
  submitFeedbackCallable,
  getDaily,
  signOut,
  anonSignIn,
  signInOnFireBase,
  checkAdminStatus,
  signUpEmail,
  sendResetEmail,
  getPixteryURL,
};
