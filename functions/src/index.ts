/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import {Puzzle} from "../../types";
const admin = require("firebase-admin");
import adminKey from "./serviceAccount";
import {currentUser} from "../../FirebaseApp";
let uid: string | undefined;

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
});
const db = admin.firestore();
// import firebase from "firebase";
// const currentUser = firebase.auth().currentUser;

// start here - try pulling thisin at new puzzle?

// const storage = admin.storage();
// start here - try creating a new function to console log context, read these:
// https://medium.com/firebase-developers/patterns-for-security-with-firebase-per-user-permissions-for-cloud-firestore-be67ee8edc4a
// https://medium.com/firebase-developers/patterns-for-security-with-firebase-combine-rules-with-cloud-functions-for-more-flexibility-d03cdc975f50
// create a sec rule for read and see if that throws error

exports.uploadPuzzleSettings = functions.https.onCall(
    async (data: { fileName: string; newPuzzle: Puzzle }, context) => {
      console.log("context", context.auth);
      const {fileName, newPuzzle} = data;
      // testing purposes, if user is not authorized, assigns "unauthorized to uid"
      uid = context.auth?.uid;
      console.log("uid", uid);
      newPuzzle.uid = uid ? uid : "unauthorized";
      // uid = context.auth?.uid ? context.auth?.uid : "";
      // newPuzzle.uid = uid;
      console.log("uploading puzzle settings");
      console.log("context.auth when uploading puzzle settings", context.auth);
      try {
      // throw error if user is not authenticated
      // if (!context.auth) {
      //   throw new functions.https.HttpsError(
      //       "permission-denied",
      //       "user not authenticated"
      //   );
      // }
        await db.collection("puzzles").doc(fileName).set(newPuzzle);
        return {result: `successfully uploaded ${fileName}`};
      } catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
);

// on creation of document, checks if uid of document is the same as the user that created the document from this app
exports.validateUserAuth = functions.firestore
    .document("puzzles/{document=**}")
    .onCreate(async (snapshot, context) => {
      const uidOnPuzzle = snapshot.data().uid;
      console.log("uidOnPuzzle", uidOnPuzzle, "uid", uid);
      console.log("current user", currentUser);
      if (uidOnPuzzle !== uid) {
      // Delete the puzzle if user not authenticated
        console.log("Deleting invalid document for user");
        await snapshot.ref.delete();
      }
    });

// const getUid = async () => {
//   const jsonValue = await AsyncStorage.getItem("@pixteryProfile");
//   const loadedProfile = jsonValue != null ? JSON.parse(jsonValue) : null;
//   console.log('loaded profile',)
//   return loadedProfile;
// };

// exports.contextTest = functions.https.onCall(
//      (data, context) => {
//       console.log('context', context)
//       try {
//         console.log('context', context)
//         return {result: `context is ${data}`};
//       } catch (error) {
//         throw new functions.https.HttpsError("unknown", error.message, error);
//       }
//     }
// );

// return type set as an generic object bc a JSON is returned (Puzzle type is nested in that)
exports.queryPuzzle = functions.https.onCall(
    async (data): Promise<Record<string, any> | void> => {
      try {
        const {publicKey} = data;
        const snapshot = await db
            .collection("puzzles")
            .where("publicKey", "==", publicKey)
            .get();
        if (snapshot.empty) {
          console.log("no puzzle found!");
          throw new functions.https.HttpsError("not-found", "no puzzle found!");
        } else {
        // does this do anything? puzzleData is overwritten immediately below
          let puzzleData: Record<string, any> = {
            puzzleType: "",
            gridSize: 0,
            senderName: "",
            senderPhone: "string",
            imageURI: "",
            message: null,
            dateReceived: "",
            completed: false,
          };
          // NOTE: there SHOULD only be one puzzle but it's in an object that has to iterated through to access the data
          snapshot.forEach((puzzle: any) => {
            puzzleData = puzzle.data();
            puzzleData.completed = false;
          });
          return puzzleData;
        }
      } catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
);

// sign in rsp D {
//   "a": 0,
//   "b": null,
//   "c": D {
//     "a": 2,
//     "b": Dc {
//       "a": [Circular],
//       "b": [Function anonymous],
//       "c": false,
//       "f": null,
//       "g": [Function anonymous],
//       "next": null,
//     },
//     "c": null,
//     "f": Dc {
//       "a": [Circular],
//       "b": [Function anonymous],
//       "c": false,
//       "f": null,
//       "g": [Function anonymous],
//       "next": null,
//     },
//     "g": false,
//     "h": true,
//     "i": undefined,
//   },
//   "f": null,
//   "g": false,
//   "h": false,
//   "i": undefined,
// }
