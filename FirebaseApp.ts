import firebase from "firebase";
import "firebase/functions";
import "firebase/firestore";
import "firebase/storage"; // for jest testing purposes

import { MY_LAN_IP } from "./ip";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "pixstery-7c9b9.firebaseapp.com",
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
  projectId: "pixstery-7c9b9",
  storageBucket: "pixstery-7c9b9.appspot.com",
  messagingSenderId: "503392467903",
  appId: "1:503392467903:web:6283d87be13230e6caff0a",
  measurementId: "G-5XDDLZ009P",
};

const initializeApp = (): any => {
  if (firebase.apps && firebase.apps.length > 0) {
    return firebase.apps[0];
  } else return firebase.initializeApp(firebaseConfig);
};

const app = initializeApp();
const db = app.firestore();

let currentUser: firebase.User | null;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = firebase.auth().currentUser;
  } else {
    console.log("no user authorized");
  }
});

const functions = app.functions();

db.settings({ host: "localhost:8080", ssl: false });
functions.useFunctionsEmulator(`${MY_LAN_IP}:5001`);
// const auth = firebase.auth();
// auth.useEmulator(`${MY_LAN_IP}:9099`);

const storage = app.storage();
const phoneProvider = new firebase.auth.PhoneAuthProvider();
const verifySms = (id: string, code: string): firebase.User | null => {
  const credential = firebase.auth.PhoneAuthProvider.credential(id, code);
  const signInResponse = firebase.auth().signInWithCredential(credential);
  console.log("sign in rsp", signInResponse);
  const currentUser = firebase.auth().currentUser;
  console.log("curr user", currentUser);
  return currentUser;
};

// const currentUser = firebase.auth().currentUser;

// console.log('AUTH', app.auth().currentUser?.uid);

export {
  app,
  db,
  storage,
  phoneProvider,
  firebaseConfig,
  verifySms,
  functions,
  currentUser,
};
