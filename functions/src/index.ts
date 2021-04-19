/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import {db} from "../../FirebaseApp";
import {Puzzle as PuzzleType} from "../../types";


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Firestore under the path /messages/:documentId/original

// exports.addMessage = functions.https.onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text
//   // Push the new message into Firestore using the Firebase Admin SDK.
//   const writeResult = await db.collection("messages").add({original: original});
//   // Send back a message that we've successfully written the message
//   console.log("adding message")
//   res.json({result: `Message with ID: ${writeResult.id} added.`});
// })

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
// exports.makeUppercase = functions.firestore.document("/messages/{documentId}")
//     .onCreate((snap, context) => {
//       console.log("uppercase running")
//       // Grab the current value of what was written to Firestore.
//       const original = snap.data().original;

//       // Access the parameter `{documentId}` with `context.params`
//       functions.logger.log("Uppercasing", context.params.documentId, original);
      
//       const uppercase = original.toUpperCase();
      
//       // You must return a Promise when performing asynchronous tasks inside a Functions such as
//       // writing to Firestore.
//       // Setting an 'uppercase' field in Firestore document returns a Promise.
//       return snap.ref.set({uppercase}, {merge: true});
//     });

// exports.test = functions.https.onCall(async (data) => {
//   console.log('hi')
//   try {
//     console.log("hello world")
//     return {text: data.text};
//   }
//   // [END returnMessageAsync]
//   catch (error) {
//   // Re-throwing the error as an HttpsError so that the client gets the error details.
//     throw new functions.https.HttpsError("unknown", error.message, error);
//   }
// });
// start here - make this a then ca
// exports.addMessageCall = functions.https.onCall(async (data: any) => {
//   // Grab the text parameter.
//   try{
//     const original = data.text;
//     // Push the new message into Firestore using the Firebase Admin SDK.
//     const writeResult = await db.collection("messages").add({original: original});
//     // Send back a message that we've successfully written the message
//     console.log("adding message")
//     return {result: writeResult}
//   }
//   catch (error){
//     console.log("error")
//     throw new functions.https.HttpsError("unknown", error.message, error);
//   }
// })

exports.uploadPuzzleSettings = functions.https.onCall(async (data: { puzzleType: string; gridSize: number; profile: any; fileName: string; message: string; publicKey: string; }, context: any) => {
  const {puzzleType, gridSize, profile, fileName, message, publicKey} = data;
  // cloud function can hide this code collection bc its written on "server"
  console.log("uploading puzz settings");
  try {
    await db
        .collection("puzzles")
        .doc(fileName)
        .set({
          puzzleType: puzzleType,
          gridSize: gridSize,
          senderName: profile ? profile.name : "No Sender",
          senderPhone: profile ? profile.phone : "No Sender",
          imageURI: fileName,
          publicKey: publicKey,
          message: message,
          dateReceived: new Date().toISOString(),
        });
    return {result: `successfully uploaded ${fileName}`};
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

exports.queryPuzzle = functions.https.onCall(async (data) : Promise<PuzzleType | void>=> {
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
    //does this do anything? puzzleData is overwritten immediately below
      let puzzleData: PuzzleType = {
        puzzleType: "",
        gridSize: 0,
        senderName: "",
        senderPhone: "string",
        imageURI: "",
        message: null,
        dateReceived: "",
        completed: false,
      };
      //NOTE: there SHOULD only be one puzzle but it's in an object that has to iterated through to access the data
      snapshot.forEach((puzzle: any) => {
        puzzleData = puzzle.data();
        puzzleData.completed = false;
      });
      console.log("retrieved puzzle data", puzzleData);
      return puzzleData;
    }
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

exports.addNumbers = functions.https.onCall((data: { firstNumber: any; secondNumber: any; }) => {
  console.log("adding nums")
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
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with " +
          "two arguments \"firstNumber\" and \"secondNumber\" which must both be numbers.");
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