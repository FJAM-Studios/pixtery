
import * as functions from "firebase-functions";
import db from "../db"

// send a user's entire sent or received list (listType) to the client
export const fetchPuzzles = functions.https.onCall(
  async (listType, context) => {
  try {
    const user = context.auth?.uid;
    console.log("list",listType);
    if(user) {
      const puzzles = await db.collection("userPixteries")
        .doc(user)
        .collection(listType)
        .where("active", "==", true)
        .get();
      if(!puzzles.empty){
        const puzzleData = puzzles.docs.map((doc:any) => doc.data());
        return puzzleData;
      } 
    } 
    return [];
  } catch (error: any) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
  });

// this function can be used to mark a user's sent/recvd puzzle as inactive in their list
// it's not currently called anywhere in the app, but we can implement front end later
export const deactivateAllUserPuzzles = functions.https.onCall(
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
    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

export const deactivateUserPuzzle = functions.https.onCall(
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

    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);