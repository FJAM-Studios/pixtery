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
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";

import { SignInOptions } from "./types";

export const firebaseConfig = {
  apiKey: "***REMOVED***",
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

//////////////////////////////////////////////

export const auth = getAuth();
export const phoneProvider = new PhoneAuthProvider(auth);

export const signOut = (): Promise<void> => {
  return signOutFB(auth);
};

export const anonSignIn = async (): Promise<void> => {
  try {
    // Anonymous sign in. This should only fire the first time someone uses the app.
    if (!auth.currentUser) await signInAnonymously(auth);
  } catch (error) {
    console.log(error);
  }
};

export const signInOnFireBase = async (
  providerType: SignInOptions,
  id: string,
  verificationCode: string
): Promise<User> => {
  try {
    let newCredential: AuthCredential | null = null;

    if (providerType === SignInOptions.PHONE) {
      const authProvider = PhoneAuthProvider;
      newCredential = await authProvider.credential(id, verificationCode);
    }

    if (providerType === SignInOptions.EMAIL) {
      const authProvider = EmailAuthProvider;
      newCredential = await authProvider.credential(id, verificationCode);
    }

    if (!newCredential) throw new Error("Invalid sign in type.");

    // Get user credential using auth provider
    const prevUser = auth.currentUser;
    ////the below comes from https://firebase.google.com/docs/auth/web/account-linking
    // Sign in user with the account you want to link to
    const result = await signInWithCredential(auth, newCredential);
    // Merge prevUser and currentUser data stored in Firebase.
    if (prevUser && prevUser.uid !== result.user.uid)
      migratePuzzles(prevUser.uid);
    return result.user;
  } catch (error) {
    console.log(error);
    // throwing error so the Register component has an error message to display to the user.
    if (error instanceof FirebaseError) {
      if (error.code === "auth/wrong-password")
        throw new Error("Incorrect password.");
      if (error.code === "auth/user-not-found")
        throw new Error("User not found.");
      if (error.code === "auth/invalid-verification-code")
        throw new Error("Invalid verification code.");
    }
    throw new Error("Could not sign in at this time. Please try again.");
  }
};

export const signUpEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    // Get user credential using auth provider
    const prevUser = auth.currentUser;
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Merge prevUser and currentUser data stored in Firebase.
    if (prevUser && prevUser.uid !== result.user.uid)
      migratePuzzles(prevUser.uid);
    return result.user;
  } catch (error) {
    // throwing error so the Register component has an error message to display to the user.
    if (error instanceof FirebaseError) {
      if (error.code === "auth/wrong-password")
        throw new Error("Incorrect password.");
      if (error.code === "auth/user-not-found")
        throw new Error("User not found.");
    }
    throw new Error("Could not sign in at this time. Please try again.");
  }
};

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    // get whether or not pixtery admin
    const res = await checkGalleryAdmin();
    const isGalleryAdmin = res.data;
    return isGalleryAdmin as boolean;
  } catch (e) {
    console.log("could not verify admin status");
    return false;
  }
};

export const sendResetEmail = async (email: string): Promise<void> => {
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

export const getPixteryURL = async (str: string): Promise<string> => {
  const url = await getDownloadURL(ref(storage, str));
  return url;
};

export const uploadBlob = async (
  fileName: string,
  blob: Blob
): Promise<void> => {
  try {
    await uploadBytes(ref(storage, fileName), blob);
  } catch (e) {
    console.log(e);
  }
};
