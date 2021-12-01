/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "firebase";
import "firebase/functions";
import "firebase/firestore";
import "firebase/storage"; // for jest testing purposes

// import { MY_LAN_IP } from "./ip";

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
// functions.useFunctionsEmulator(`${MY_LAN_IP}:5001`);

const storage = app.storage();
const phoneProvider = new firebase.auth.PhoneAuthProvider();
const verifySms = (
  id: string,
  code: string
): Promise<firebase.auth.UserCredential | undefined> | undefined => {
  const credential = firebase.auth.PhoneAuthProvider.credential(id, code);
  const signInResponse = firebase.auth().signInWithCredential(credential);
  return signInResponse;
};

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

const migratePuzzles = async (
  prevUser: firebase.User,
  currentUser: firebase.User
): Promise<void> => {
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
      const newCredential = authProvider.credential(id, verificationCode);

      const prevUser = firebase.auth().currentUser!;
      ////the below comes from https://firebase.google.com/docs/auth/web/account-linking
      let currentUser;
      // Sign in user with the account you want to link to
      firebase
        .auth()
        .signInWithCredential(newCredential)
        .then((result) => {
          currentUser = result.user;

          // Merge prevUser and currentUser data stored in Firebase.
          // Note: How you handle this is specific to your application
          if (currentUser && prevUser.uid !== currentUser.uid)
            migratePuzzles(prevUser, currentUser);
          return currentUser;
        })
        .catch((error) => {
          // If there are errors we want to undo the data merge/deletion
          console.log("Sign In Error", error);
        });
      return currentUser;
    } catch (error) {
      console.log(error);
    }
  }
};

export {
  app,
  db,
  storage,
  phoneProvider,
  firebaseConfig,
  verifySms,
  functions,
  signOut,
  anonSignIn,
  registerOnFirebase,
};
