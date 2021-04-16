import * as functions from "firebase-functions";
import { db } from "../../FirebaseApp";
import uuid from "uuid";
import { Puzzle, Profile } from "../../types";


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await db.collection('messages').add({original: original});
  // Send back a message that we've successfully written the message
  console.log('adding message')
  res.json({result: `Message with ID: ${writeResult.id} added.`});
})

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
    .onCreate((snap, context) => {
      console.log('uppercase running')
      // Grab the current value of what was written to Firestore.
      const original = snap.data().original;

      // Access the parameter `{documentId}` with `context.params`
      functions.logger.log('Uppercasing', context.params.documentId, original);
      
      const uppercase = original.toUpperCase();
      
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to Firestore.
      // Setting an 'uppercase' field in Firestore document returns a Promise.
      return snap.ref.set({uppercase}, {merge: true});
    });

exports.uploadPuzzleSettings = async (
    fileName: string,
    puzzleType: string,
    gridSize: number,
    profile: Profile | null,
    message: string
): Promise<string> => {
  const publicKey: string = uuid.v4();
  // cloud function can hide this code collection bc its written on "server"
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
  return publicKey;
};
