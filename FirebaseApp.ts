import firebase from "firebase";
import "firebase/functions";
import "firebase/firestore";
import "firebase/storage" // for jest testing purposes

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

let functions = app.functions()
// for http, put in http: <Metro Bundler LAN IP address>:5001
functions.useFunctionsEmulator("http://192.168.1.215:5001")

const storage = app.storage();
const phoneProvider = new firebase.auth.PhoneAuthProvider();
const verifySms = (id: string, code: string) => {
  const credential = firebase.auth.PhoneAuthProvider.credential(id, code);
  const signInResponse = firebase.auth().signInWithCredential(credential);
  return signInResponse;
};

// test to see if cloud funcs are running
// const addNumbers = app.functions().httpsCallable("addNumbers")

// addNumbers({firstNumber: 1, secondNumber: 2})
//     .then((result: any) => {
//     console.log('result test in firebaseapp', result)
//   }).catch((e: any) => {
//     console.log('there is error in firebaseapp')
//     console.error('message', e.message)
//     console.error('code', e.code)
//     console.error('details', e.details)
//   })

export { app, db, storage, phoneProvider, firebaseConfig, verifySms, functions };
