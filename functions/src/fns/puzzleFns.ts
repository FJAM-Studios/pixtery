import * as functions from "firebase-functions";
import db from "../db"

export const uploadPuzzleSettings = functions.https.onCall(
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

      await db.collection("pixteries").doc(newPuzzle.publicKey).set(newPuzzle);

      //add this puzzle to the user's sent collection
      db.collection("userPixteries")
        .doc(context.auth.uid)
        .collection("sent")
        .doc(newPuzzle.publicKey)
        // adding the full puzzle to make it faster to retrieve later
        .set({...newPuzzle, active: true});

      return {result: `successfully uploaded ${newPuzzle.publicKey}`};
    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

// return type set as an generic object bc a JSON is returned (Puzzle type is nested in that)
export const queryPuzzle = functions.https.onCall(
  async (data, context): Promise<Record<string, any> | void> => {
    try {
      const {publicKey} = data;

      // We should use the publicKey as the document id instead of the (image) fileName.
      // This will let us retrieve the document directly by ID, rather than query the
      // entire collection every time, filtering for the publicKey.

      const puzzle = await db.collection("pixteries").doc(publicKey).get()

      if (puzzle.exists) {
        const puzzleData = puzzle.data();
        if(puzzleData) puzzleData.completed = false;

        // add this puzzle to the user's received collection if they're authenticated
        // i.e. solving in the app rather than the webpage
        if (context.auth) {
          db.collection("userPixteries")
            .doc(context.auth.uid)
            .collection("received")
            .doc(publicKey)
            .set({...puzzleData, active: true});
        }

        return puzzleData;
      } else {
        console.log("no puzzle found!");
        throw new functions.https.HttpsError("not-found", "no puzzle found!");
      }
    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);