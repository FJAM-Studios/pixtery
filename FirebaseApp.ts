import * as firebase from "firebase";
import "firebase/storage" // for testing purposes

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

export { app, db, storage };
