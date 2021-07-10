const admin = require("firebase-admin");
import adminKey from "./serviceAccount";

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
});
const db = admin.firestore();


const copyPuzzles = async (sourceCollectionName: string, targetCollectionName: string) => {
  console.log(`copying and renaming records in ${sourceCollectionName} collection...`)
  const snap = await db.collection(sourceCollectionName).get()
  snap.forEach(async (puzzle: { data: () => any; }) => {
    const puzzleData = await puzzle.data()
    if (puzzleData.publicKey && puzzleData.publicKey.length === 9) {
      await db.collection(targetCollectionName).doc(puzzleData.publicKey).set(puzzleData)
    }
    if(sourceCollectionName == targetCollectionName) await db.collection(sourceCollectionName).doc(puzzleData.imageURI).delete() 
  })
}

const generateTestData = async () => {
  console.log("generating test records in testUpdatePuzzles collection...")
  const snap = await db.collection("puzzles").limit(5).get()
  snap.forEach(async (puzzle: { data: () => any; }) => {
    const puzzleData = await puzzle.data()
    if (puzzleData.publicKey && puzzleData.publicKey.length === 9) {
      await db.collection("testUpdatePuzzles").doc(puzzleData.imageURI).set(puzzleData)
    }
  })
}

if (process.argv[2] === "generateTestData") generateTestData()
else if (process.argv[2] === "updateTestData") copyPuzzles("testUpdatePuzzles", "testUpdatePuzzles")
else if (process.argv[2] === "copyAllPixteries") copyPuzzles("puzzles", "pixteries")
else console.log("no valid arguments provided")