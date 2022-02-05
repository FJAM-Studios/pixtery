import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyANqRXsUQIKxT9HtG4gIQ6EmsKEMCzCyuo",
  authDomain: "pixtery.io",
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
  projectId: "pixstery-7c9b9",
  storageBucket: "pixstery-7c9b9.appspot.com",
  messagingSenderId: "503392467903",
  appId: "1:503392467903:web:6283d87be13230e6caff0a",
  measurementId: "G-5XDDLZ009P",
};

export const app = initializeApp(firebaseConfig);
