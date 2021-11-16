import * as functions from "firebase-functions";
const { createTransport } = require('nodemailer');
//should import rather than require so that we get TS benefits
import * as admin from "firebase-admin"
//may need to change serviceAccount.ts to have right type
import adminKey from "./serviceAccount";

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
  databaseURL: "https://pixstery-7c9b9-default-rtdb.firebaseio.com",
});
const db = admin.firestore();

// if we want to adjust timezone for dailies. see addToGallery and getDaily
// const TZ_ADJUST = 6

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
      } catch (error: any) {
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

// send a user's entire sent or received list (listType) to the client
exports.fetchPuzzles = functions.https.onCall(
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
    } catch (error: any) {
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

    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

const sender = adminKey.senderAccount;
const password = adminKey.password;

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: sender,
    pass: password,
  },
});

const transport = (error: any, info: { messageId: any; }) => error ? console.log(error) : console.log(info.messageId);

exports.handleEmail = functions.https.onCall(async(data, context) => {
  const { subject, email, message } = data;
  try{
    const mailOptions = {
      from: sender,
      to: 'studios.fjam@gmail.com',
      subject: subject,
      text: `from: ${email}\n\nmessage: ${message}`,
    };
      await transporter.sendMail(mailOptions, transport);
      return {status: "200"}
    }
  catch (error: any) {
    throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

exports.checkGalleryAdmin = functions.https.onCall(
  async (data, context) => {
    try {
      // throw error if user is not authenticated
        if (!context.auth) {
          throw new functions.https.HttpsError(
              "permission-denied",
              "user not authenticated"
          );
        }

        // check if gallery admin
        const admin = await db.collection("galleryAdmins").doc(context.auth.uid).get()
        if(!admin.exists) {
          return false
        }
        return true

      } catch (error: any) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
  }
)

exports.getGalleryQueue = functions.https.onCall(
  async (data, context) => {
    try {
      // throw error if user is not authenticated
        if (!context.auth) {
          throw new functions.https.HttpsError(
              "permission-denied",
              "user not authenticated"
          );
        }

        // throw error if user is not member of gallery admins
        const admin = await db.collection("galleryAdmins").doc(context.auth.uid).get()
        if(!admin.exists) {
          throw new functions.https.HttpsError(
              "permission-denied",
              "user not gallery admin"
          );
        }
        //can get active or inactive puzzles, start at for pagination, limit
        const { active, startAt, limit } = data

        const queue = await db.collection("galleryQueue").where('active', '==', active)
          .orderBy("dateQueued")
          .startAt(startAt)
          .limit(limit)
          .get()
        if(!queue.empty){
            // this will include whatever data we want the user to submit with the puzzle
            // i.e., sender name vs anonymous, tags, title, etc.
            // that will need to be built out in the gallery submission form.
            // for now, it only includes the normal puzzle data
          const queueData = queue.docs.map((doc:any) => doc.data());
          return queueData;
        } else return [];
      } catch (error: any) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
  }
)

exports.deactivateInQueue = functions.https.onCall(
  async (data, context): Promise<Record<string, any> | void> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "user not authenticated"
        );
      }

      // throw error if user is not member of gallery admins
      const admin = await db.collection("galleryAdmins").doc(context.auth.uid).get()
      if(!admin.exists) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "user not gallery admin"
        );
      }
      const {publicKey} = data;
      await db.collection("galleryQueue").doc(publicKey).set({active: false},{merge: true});
    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

exports.addToGallery = functions.https.onCall(
  async (data, context): Promise<Record<string, any> | void> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "user not authenticated"
        );
      }

      // throw error if user is not member of gallery admins
      const admin = await db.collection("galleryAdmins").doc(context.auth.uid).get()
      if(!admin.exists) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "user not gallery admin"
        );
      }

      const {publicKey, dailyDate} = data;

      //could adjust for timezone here. Firebase defaults to UTC.
      // dailyDate.setHours(dailyDate.getHours() + TZ_ADJUST);

      //get the puzzle data from the gallery queue
      const res = await db.collection("galleryQueue").doc(publicKey).get()
      const puzzleData = res.data()

      //add it to the real gallery with who added and when
      await db.collection("gallery").doc(publicKey).set({
        ...puzzleData,
        dailyDate: new Date(dailyDate),
        addedBy: context.auth.uid,
        addedOn: new Date()
      },{merge: true});

      //make the puzzle inactive in the queue
      await db.collection("galleryQueue").doc(publicKey).set({active: false},{merge: true});
    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
)

exports.addToQueue = functions.https.onCall(
  async (data, context): Promise<Record<string, any> | void> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "user not authenticated"
        );
      }

      const {publicKey, message, newPublicKey} = data;

      //get the puzzle data
      const res = await db.collection("pixteries").doc(publicKey).get()
      const puzzleData = res.data()

      if(puzzleData) {
        //add it to the list of pixteries under the new PK
        //this is so the changed message or anonymous sender will be reflected when you add the daily puzzle
        await db.collection("pixteries").doc(newPublicKey).set(
          {...puzzleData,
            publicKey: newPublicKey,
            message,
            senderName: data.anonymousChecked ? "Anonymous" : puzzleData.senderName
          },{merge: true});
        
        //add it to the gallery queue
        await db.collection("galleryQueue").doc(newPublicKey).set(
        {...puzzleData,
          publicKey: newPublicKey,
          message,
          active: true, 
          dateQueued: new Date(), 
          senderName: data.anonymousChecked ? "Anonymous" : puzzleData.senderName
        },{merge: true});
      }
      else throw new functions.https.HttpsError(
        "not-found",
        "puzzle not found"
    );
    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
)

exports.getDailyDates = functions.https.onCall(
  async (data, context) => {
    try {
      // throw error if user is not authenticated
        if (!context.auth) {
          throw new functions.https.HttpsError(
              "permission-denied",
              "user not authenticated"
          );
        }

        // throw error if user is not member of gallery admins
        const admin = await db.collection("galleryAdmins").doc(context.auth.uid).get()
        if(!admin.exists) {
          throw new functions.https.HttpsError(
              "permission-denied",
              "user not gallery admin"
          );
        }
        const { dateString } = data
        const timestamp = new Date(dateString);
        const dailies = await db.collection("gallery").where("dailyDate",">=", timestamp )
          .orderBy("dailyDate")
          .limit(31)
          .get()
        if(!dailies.empty){
            // this will include whatever data we want the user to submit with the puzzle
            // i.e., sender name vs anonymous, tags, title, etc.
            // that will need to be built out in the gallery submission form.
            // for now, it only includes the normal puzzle data
          const dailyPuzzles = dailies.docs.map((doc) => {
            const data = doc.data()
            return {
              ...data,
              dailyDate: data.dailyDate.toDate().toISOString().split("T")[0],
            }
          });
          return dailyPuzzles;
        } else return [];
      } catch (error: any) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
  }
)

exports.removeDailyPuzzle = functions.https.onCall(
  async (data, context): Promise<Record<string, any> | void> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "user not authenticated"
        );
      }

      // throw error if user is not member of gallery admins
      const admin = await db.collection("galleryAdmins").doc(context.auth.uid).get()
      if(!admin.exists) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "user not gallery admin"
        );
      }
      const {publicKey} = data;
      //remove it from gallery/daily
      await db.collection("gallery").doc(publicKey).delete();
      //set it active in queue
      await db.collection("galleryQueue").doc(publicKey).set({active: true},{merge: true});
    } catch (error: any) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

exports.getDaily = functions.https.onCall(
  async (data, context) => {
    try {
      // throw error if user is not authenticated
        if (!context.auth) {
          throw new functions.https.HttpsError(
              "permission-denied",
              "user not authenticated"
          );
        }

        const { today } = data
        const timestamp = new Date(today);

        //could adjust for timezone here. Firebase defaults to UTC.
        // timestamp.setHours(timestamp.getHours() - TZ_ADJUST);

        const dailies = await db.collection("gallery").where("dailyDate","==", timestamp )
          .limit(1)
          .get()
        if(!dailies.empty){
            // this will include whatever data we want the user to submit with the puzzle
            // i.e., sender name vs anonymous, tags, title, etc.
            // that will need to be built out in the gallery submission form.
            // for now, it only includes the normal puzzle data
          const dailyPuzzles = dailies.docs.map((doc) => {
            const data = doc.data()
            return {
              ...data,
              dailyDate: data.dailyDate.toDate().toISOString().split("T")[0],
            }
          });
          return dailyPuzzles;
        } else {
          // @todo - decide on something to be done when no current daily, e.g. get most recent
          return [];
        }
      } catch (error: any) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
  }
)
