import firebase from "firebase";

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
const storage = app.storage();
const phoneProvider = new firebase.auth.PhoneAuthProvider();
const verifySms = (id: string, code: string) => {
  const credential = firebase.auth.PhoneAuthProvider.credential(id, code);
  const signInResponse = firebase.auth().signInWithCredential(credential);
  return signInResponse;
};

export { app, db, storage, phoneProvider, firebaseConfig, verifySms };
