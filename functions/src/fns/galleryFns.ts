import * as functions from "firebase-functions";
import db from "../db"

export const checkGalleryAdmin = functions.https.onCall(
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

export const addToGallery = functions.https.onCall(
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

export const getDailyDates = functions.https.onCall(
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
        const { year, month } = data
        const timestamp = new Date(`${year}-${month}-1`);
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

export const removeDailyPuzzle = functions.https.onCall(
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

export const getDaily = functions.https.onCall(
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