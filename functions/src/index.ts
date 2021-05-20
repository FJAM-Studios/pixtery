/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
// import { db } from "../../FirebaseApp";
// import { Puzzle } from "../../types";
const admin = require("firebase-admin");
import adminKey from "./serviceAccount";

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
});
const db = admin.firestore();

// importing from types throws tsc error and prevents build
interface Puzzle {
  puzzleType: string;
  gridSize: number;
  senderName: string;
  imageURI: string;
  publicKey: string;
  message?: string | null;
  dateReceived?: string;
  completed?: boolean;
}

exports.uploadPuzzleSettings = functions.https.onCall(
    async (data: { fileName: string; newPuzzle: Puzzle }, context) => {
      const {fileName, newPuzzle} = data;
      console.log("uploading puzzle settings");
      try {
        // throw error if user is not authenticated
        if (!context.auth) {
          throw new functions.https.HttpsError(
              "permission-denied",
              "user not authenticated"
          );
        }
        await db.collection("puzzles").doc(fileName).set(newPuzzle);
        return {result: `successfully uploaded ${fileName}`};
      } catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
);

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
