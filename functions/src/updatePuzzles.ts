
const admin = require("firebase-admin");
import adminKey from "./serviceAccount";

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
});
const db = admin.firestore();


const updateTestPuzzleIDs = async (collectionName: string) => {
  console.log(`updating records in ${collectionName} collection...`)
  const snap = await db.collection(collectionName).get()
  snap.forEach(async (puzzle: { data: () => any; }) => {
    const puzzleData = await puzzle.data()
    if (puzzleData.publicKey && puzzleData.publicKey.length === 9) {
      await db.collection(collectionName).doc(puzzleData.publicKey).set(puzzleData)
    }
    await db.collection(collectionName).doc(puzzleData.imageURI).delete() 
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
else if (process.argv[2] === "updateTestData") updateTestPuzzleIDs("testUpdatePuzzles")
else if (process.argv[2] === "updateRealDataForSure") updateTestPuzzleIDs("puzzles")
else console.log("no valid arguments provided")
