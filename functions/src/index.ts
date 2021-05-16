/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import {db} from "../../FirebaseApp";
import {Puzzle} from "../../types";
// start here - try creating a new function to console log context, read these:
// https://medium.com/firebase-developers/patterns-for-security-with-firebase-per-user-permissions-for-cloud-firestore-be67ee8edc4a
// https://medium.com/firebase-developers/patterns-for-security-with-firebase-combine-rules-with-cloud-functions-for-more-flexibility-d03cdc975f50
// create a sec rule for read and see if that throws error

exports.uploadPuzzleSettings = functions.https.onCall(
    async (data: { fileName: string; newPuzzle: Puzzle }, context) => {
    // console.log('context', context.auth)
      const {fileName, newPuzzle} = data;
      console.log("uploading puzzle settings");
      try {
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
// start here - create an onCreate function
// start here - oncreate not triggering. try running this witrh emulator
// 
exports.validateUserAuth = functions.firestore
    .document('puzzles/{document=**}')
    .onCreate(async (snapshot, context) => {
    // const data = snapshot.data()
      console.log("user auth", context.auth);
      if (!context.auth) {
      // Delete the puzzle if user not authenticated
        console.log("Deleting invalid document for user");
        await snapshot.ref.delete();
      }
    });

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

exports.contextTest = functions.https.onCall((data, context) => {
  console.log("hi");
  console.log("context", context);
  // [END addFunctionTrigger]
  // [START readAddData]
  // Numbers passed from the client.
  const firstNumber = data.firstNumber;
  const secondNumber = data.secondNumber;
  // [END readAddData]

  // [START addHttpsError]
  // Checking that attributes are present and are numbers.
  if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with " +
        "two arguments \"firstNumber\" and \"secondNumber\" which must both be numbers."
    );
  }
  // [END addHttpsError]

  // [START returnAddData]
  // returning result.
  return {
    firstNumber: firstNumber,
    secondNumber: secondNumber,
    operator: "+",
    operationResult: firstNumber + secondNumber,
  };
  // [END returnAddData]
});

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
