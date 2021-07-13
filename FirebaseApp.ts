import firebase from "firebase";
import "firebase/functions";
import "firebase/firestore";
import "firebase/storage"; // for jest testing purposes

// import { MY_LAN_IP } from "./ip";

const firebaseConfig = {
  apiKey: "AIzaSyANqRXsUQIKxT9HtG4gIQ6EmsKEMCzCyuo",
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
): Promise<firebase.auth.UserCredential> => {
  const credential = firebase.auth.PhoneAuthProvider.credential(id, code);
  const signInResponse = firebase.auth().signInWithCredential(credential);
  return signInResponse;
};

const signOut = (): Promise<void> => {
  return firebase.auth().signOut();
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
};
