/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
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
    async (data: { newPuzzle: Puzzle }, context) => {
      const { newPuzzle} = data;
      console.log("uploading puzzle settings");
      try {
      // throw error if user is not authenticated
        if (!context.auth) {
          throw new functions.https.HttpsError(
              "permission-denied",
              "user not authenticated"
          );
        }

        // changed new doc ID to publicKey for better efficiency querying puzzles.
        // See comment in queryPuzzle function below for more information

        await db.collection("puzzles").doc(newPuzzle.publicKey).set(newPuzzle);

        //add this puzzle to the user's sent collection
        db.collection("userPuzzles")
          .doc(context.auth.uid)
          .collection("sent")
          .doc(newPuzzle.publicKey)
          .set({localList: true});

        return {result: `successfully uploaded ${newPuzzle.publicKey}`};
      } catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
);

// return type set as an generic object bc a JSON is returned (Puzzle type is nested in that)
exports.queryPuzzle = functions.https.onCall(
    async (data, context): Promise<Record<string, any> | void> => {
      try {
        const {publicKey} = data;
        
        // We should use the publicKey as the document id instead of the (image) fileName.
        // This will let us retrieve the document directly by ID, rather than query the
        // entire collection every time, filtering for the publicKey. 

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // This WILL break all existing puzzles, so we should also run a routine once 
        // to copy all existing puzzles in the database to new documents with the
        // publicKey as ID and then delete the old document.
        
        const puzzle = await db.collection("puzzles").doc(publicKey).get()

        if (puzzle.exists) {
          const puzzleData = puzzle.data();
          puzzleData.completed = false;

          // add this puzzle to the user's received collection if they're authenticate
          // i.e. solving in the app rather than the webpage
          if (context.auth) {
            db.collection("userPuzzles")
              .doc(context.auth.uid)
              .collection("received")
              .doc(publicKey)
              .set({active: true});
          }

          return puzzleData;
        } else {
          console.log("no puzzle found!");
          throw new functions.https.HttpsError("not-found", "no puzzle found!");
        }
      } catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
);

exports.removeUserPuzzle = functions.https.onCall(
  async (data: { publicKey: string, list: string }, context) => {
    const {publicKey, list} = data;
    console.log("deactivating user puzzle");
    try {
    // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "user not authenticated"
        );
      }

      //mark userPuzzle as removed from user's list
      db.collection("userPuzzles")
        .doc(context.auth.uid)
        .collection(list)
        .doc(publicKey)
        .set({active: false});
      
    } catch (error) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);