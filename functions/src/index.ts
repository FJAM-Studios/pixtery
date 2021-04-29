/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import {Puzzle} from "../../types";
const admin = require("firebase-admin");
import adminKey from "./serviceAccount";

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
});
const db = admin.firestore();
const storage = admin.storage();

exports.uploadPuzzleSettings = functions.https.onCall(
    async (data: { fileName: string; newPuzzle: Puzzle }) => {
      const {fileName, newPuzzle} = data;
      console.log("uploading puzzle settings");
      try {
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
          puzzleData.imageURI = await fetchImage(puzzleData.imageURI);
          return puzzleData;
        }
      } catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
);

const fetchImage = async (fileName: string): Promise<string | void> => {
  const options = {
    version: "v2", // defaults to 'v2' if missing.
    action: "read",
    expires: Date.now() + 1000 * 60 * 60, // one hour
  };
  const file = storage.bucket("pixstery-7c9b9.appspot.com").file(fileName);
  try {
    const [url] = await file.getSignedUrl(options);
    return url;
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
};
