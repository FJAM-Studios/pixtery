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

        await db.collection("pixteries").doc(newPuzzle.publicKey).set(newPuzzle);

        //add this puzzle to the user's sent collection
        db.collection("userPixteries")
          .doc(context.auth.uid)
          .collection("sent")
          .doc(newPuzzle.publicKey)
          // adding the full puzzle to make it faster to retrieve later
          .set({...newPuzzle, active: true});

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

        const puzzle = await db.collection("pixteries").doc(publicKey).get()

        if (puzzle.exists) {
          const puzzleData = puzzle.data();
          puzzleData.completed = false;

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
      } catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
);

// send a user's entire sent or received list (listType) to the client
exports.fetchPuzzles = functions.https.onCall(
  async (listType, context) => {
  try {
    const user = context.auth?.uid;
    console.log("list",listType);

    let puzzles = await db.collection("userPixteries")
              .doc(user)
              .collection(listType)
              .where("active", "==", true)
              .get();
    if(!puzzles.empty){
      puzzles = puzzles.docs.map((doc:any) => doc.data());
      return puzzles;
    } else return [];

  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
  });

// this function can be used to mark a user's sent/recvd puzzle as inactive in their list
// it's not currently called anywhere in the app, but we can implement front end later
exports.deactivateAllUserPuzzles = functions.https.onCall(
  async (list, context) => {
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
      db.collection("userPixteries")
        .doc(context.auth.uid)
        .collection(list)
        .get()
        .then(function (querySnapshot: any){
          querySnapshot.forEach(function (doc: any){
            doc.ref.update({
              active: false
            })
          })
        })
    } catch (error) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

exports.deactivateUserPuzzle = functions.https.onCall(
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
      db.collection("userPixteries")
        .doc(context.auth.uid)
        .collection(list)
        .doc(publicKey)
        .set({active: false}, {merge: true});

    } catch (error) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

  exports.handleEmail = functions.https.onCall((data, context) => {
    console.log("adding nums");
    // Numbers passed from the client.
    // const firstNumber = data.firstNumber;
    // const secondNumber = data.secondNumber;
    // returning result.
    // const result = {
    //     firstNumber: firstNumber,
    //     secondNumber: secondNumber,
    //     operator: "+",
    //     operationResult: firstNumber + secondNumber,
    // };
    return {"result": "successfully uploaded"}
  }

);
