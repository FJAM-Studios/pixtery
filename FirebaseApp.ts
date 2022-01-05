import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import firebase from "firebase";
import "firebase/functions";
import "firebase/firestore";
import "firebase/storage"; // for jest testing purposes

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "pixtery.io",
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
  projectId: "pixstery-7c9b9",
  storageBucket: "pixstery-7c9b9.appspot.com",
  messagingSenderId: "503392467903",
  appId: "1:503392467903:web:6283d87be13230e6caff0a",
  measurementId: "G-5XDDLZ009P",
  //doesn't seem to be used, can't find in FB console, but FB config interface wants it. May be obsolete?
  trackingId: "",
};

const initializeApp = (): firebase.app.App => {
  if (firebase.apps && firebase.apps.length > 0) {
    return firebase.apps[0];
  } else return firebase.initializeApp(firebaseConfig);
};

const app = initializeApp();
const db = app.firestore();

const functions = app.functions();

// uncomment if not using block below for func emu testing
// import { MY_LAN_IP } from "./ip";
// functions.useFunctionsEmulator(`${MY_LAN_IP}:5001`);

if (
  Constants.manifest &&
  Constants.manifest.extra &&
  Constants.manifest.extra.functionEmulator &&
  Constants.manifest.debuggerHost
) {
  console.log("using function emulator");
  const MY_LAN_IP = "http://" + Constants.manifest.debuggerHost.split(":")[0];
  functions.useFunctionsEmulator(`${MY_LAN_IP}:5001`);
}

const storage = app.storage();
const phoneProvider = new firebase.auth.PhoneAuthProvider();

const signOut = (): Promise<void> => {
  return firebase.auth().signOut();
};

const anonSignIn = async (): Promise<void> => {
  try {
    // Anonymous sign in. This should only fire the first time someone uses the app.
    if (!firebase.auth().currentUser) await firebase.auth().signInAnonymously();
  } catch (error) {
    console.log(error);
  }
};

const migratePuzzles = async (prevUser: firebase.User): Promise<void> => {
  console.log("MIGRATE PUZZLES");
  const _migratePuzzles = functions.httpsCallable("migratePuzzles");
  _migratePuzzles(prevUser.uid);
};

const registerOnFirebase = async (
  providerType: string,
  id: string,
  verificationCode: string
): Promise<firebase.User | void> => {
  let authProvider;

  switch (providerType) {
    case "phone":
      authProvider = firebase.auth.PhoneAuthProvider;
      break;
    case "google":
      authProvider = firebase.auth.GoogleAuthProvider;
      break;
    default:
      break;
  }

  if (authProvider) {
    try {
      // Get user credential using auth provider
      const newCredential = await authProvider.credential(id, verificationCode);

      const prevUser = firebase.auth().currentUser;
      ////the below comes from https://firebase.google.com/docs/auth/web/account-linking
      let currentUser;
      // Sign in user with the account you want to link to
      await firebase
        .auth()
        .signInWithCredential(newCredential)
        .then((result) => {
          currentUser = result.user;

          // Merge prevUser and currentUser data stored in Firebase.
          // Note: How you handle this is specific to your application
          if (currentUser && prevUser && prevUser.uid !== currentUser.uid)
            migratePuzzles(prevUser);
          // return currentUser;
        });
      return currentUser;
    } catch (error) {
      console.log(error);
      // throwing error so the Register component has an error message to display to the user.
      throw new Error("Could not sign in at this time. Please try again.");
    }
  }
};

const checkAdminStatus = async (name: string): Promise<boolean> => {
  try {
    // get whether or not pixtery admin
    const checkGalleryAdmin = functions.httpsCallable("checkGalleryAdmin");
    const res = await checkGalleryAdmin();
    const isGalleryAdmin = res.data;

    //save to local storage
    await AsyncStorage.setItem(
      "@pixteryProfile",
      JSON.stringify({ name, isGalleryAdmin })
    );
    return isGalleryAdmin;
  } catch (e) {
    console.log("could not verify admin status");
    return false;
  }
};

export {
  app,
  db,
  storage,
  phoneProvider,
  firebaseConfig,
  functions,
  signOut,
  anonSignIn,
  registerOnFirebase,
  checkAdminStatus,
};
