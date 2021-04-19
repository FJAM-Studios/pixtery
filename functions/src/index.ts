/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import {db} from "../../FirebaseApp";
import {Puzzle} from "../../types";

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
          return puzzleData;
        }
      } catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
);

// for testing cloud function connectivity on client
exports.addNumbers = functions.https.onCall(
    (data: { firstNumber: any; secondNumber: any }) => {
      console.log("adding nums");
      // Numbers passed from the client.
      const firstNumber = data.firstNumber;
      const secondNumber = data.secondNumber;
      // Checking that attributes are present and are numbers.
      if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
      // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with " +
          "two arguments \"firstNumber\" and \"secondNumber\" which must both be numbers."
        );
      }
      // returning result.
      return {
        firstNumber: firstNumber,
        secondNumber: secondNumber,
        operator: "+",
        operationResult: firstNumber + secondNumber,
      };
    }
);
