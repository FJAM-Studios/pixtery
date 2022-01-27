import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import db from "../db";

// throw error if user is not authenticated
const blockIfNotAuthenticated = (context: functions.https.CallableContext) => {
  console.log("CHECK IF AUTHENTICATED");
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "user not authenticated"
    );
  }
};

// send a user's entire sent or received list (listType) to the client
export const fetchPuzzles = functions.https.onCall(
  async (listType, context): Promise<Record<string, string>[] | void> => {
    try {
      const user = context.auth?.uid;
      console.log("list", listType);
      if (user) {
        const puzzles = await db
          .collection("userPixteries")
          .doc(user)
          .collection(listType)
          .where("active", "==", true)
          .get();
        if (!puzzles.empty) {
          const puzzleData = puzzles.docs.map((doc) => doc.data());
          return puzzleData;
        }
      }
      return [];
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

// this function can be used to mark a user's sent/recvd puzzle
// as inactive in their list
// it's not currently called anywhere in the app,
// but we can implement front end later
export const deactivateAllUserPuzzles = functions.https.onCall(
  async (list, context) => {
    console.log("deactivating user puzzle");
    try {
      blockIfNotAuthenticated(context);
      // mark userPuzzle as removed from user's list
      db.collection("userPixteries")
        .doc(context!.auth!.uid)
        .collection(list)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            doc.ref.update({
              active: false,
            });
          });
        });
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

export const deactivateUserPuzzle = functions.https.onCall(
  async (data: { publicKey: string; list: string }, context) => {
    const { publicKey, list } = data;
    console.log("deactivating user puzzle");
    try {
      blockIfNotAuthenticated(context);
      // mark userPuzzle as removed from user's list
      db.collection("userPixteries")
        .doc(context!.auth!.uid)
        .collection(list)
        .doc(publicKey)
        .set({ active: false }, { merge: true });
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

const copyList = async (
  sourceUser: string,
  targetUser: string,
  listType: string
) => {
  const puzzleCollection = await db
    .collection("userPixteries")
    .doc(sourceUser)
    .collection(listType)
    .get();

  puzzleCollection.forEach((puzzle: any) => {
    const puzzleData = puzzle.data();
    if (puzzleData && puzzleData.publicKey) {
      db.collection("userPixteries")
        .doc(targetUser)
        .collection(listType)
        .doc(puzzleData.publicKey)
        // adding the full puzzle to make it faster to retrieve later
        .set({ ...puzzleData });
    }
  });
};

const deleteUserDoc = async (uid: string) => {
  try {
    db.collection("userPixteries")
      .doc(uid)
      .delete()
      .then(function () {
        console.log("Document successfully deleted!");
      })
      .catch(function (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      });
  } catch (error) {
    if (error instanceof Error) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
};

const deleteUserAuth = (uid: string) => {
  try {
    console.log("DELETE!");
    admin.auth().deleteUser(uid);
    console.log("DELETED");
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
};

export const migratePuzzles = functions.https.onCall(
  async (prevUserId: string, context) => {
    try {
      // throw error if user is not authenticated
      blockIfNotAuthenticated(context);
      copyList(prevUserId, context!.auth!.uid, "sent");
      copyList(prevUserId, context!.auth!.uid, "received");
      console.log("MIGRATING!");
      deleteUserDoc(prevUserId);
      deleteUserAuth(prevUserId);
    } catch (error) {
      if (error instanceof Error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
  }
);

export const deleteUser = functions.https.onCall(
  async (context: functions.https.CallableContext) => {
    try {
      blockIfNotAuthenticated(context);
      deleteUserDoc(context!.auth!.uid);
      deleteUserAuth(context!.auth!.uid);
    } catch (error) {
      if (error instanceof Error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
  }
);
