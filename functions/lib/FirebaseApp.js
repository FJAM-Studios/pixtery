"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = exports.verifySms = exports.firebaseConfig = exports.phoneProvider = exports.storage = exports.db = exports.app = void 0;
const firebase_1 = require("firebase");
require("firebase/functions");
require("firebase/firestore");
require("firebase/storage"); // for jest testing purposes
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
exports.firebaseConfig = firebaseConfig;
const initializeApp = () => {
  if (firebase_1.default.apps && firebase_1.default.apps.length > 0) {
    return firebase_1.default.apps[0];
  } else return firebase_1.default.initializeApp(firebaseConfig);
};
const app = initializeApp();
exports.app = app;
const db = app.firestore();
exports.db = db;
const functions = app.functions();
exports.functions = functions;
// for http, put in http: <Metro Bundler LAN IP address>:5001
functions.useFunctionsEmulator("http://192.168.1.12:5001");
const storage = app.storage();
exports.storage = storage;
const phoneProvider = new firebase_1.default.auth.PhoneAuthProvider();
exports.phoneProvider = phoneProvider;
const verifySms = (id, code) => {
  const credential = firebase_1.default.auth.PhoneAuthProvider.credential(
    id,
    code
  );
  const signInResponse = firebase_1.default
    .auth()
    .signInWithCredential(credential);
  return signInResponse;
};
exports.verifySms = verifySms;
//# sourceMappingURL=FirebaseApp.js.map
