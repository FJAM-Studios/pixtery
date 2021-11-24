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

      // original dailyDate string is e.g. "2021-11-22"
      const dailyDateArray = dailyDate.split("-") 
      const dailyDateYear = dailyDateArray[0]
      const dailyDateMonth = dailyDateArray[1]
      const dailyDateDay = dailyDateArray[2]
      
      // set puzzle for that date on firestore
      await db.collection("gallery")
      .doc(dailyDateYear)
      .collection(dailyDateMonth)
      .doc(dailyDateDay)
      .set({
        ...puzzleData,
        addedBy: context.auth.uid,
        addedOn: new Date()
        // currently will overwrite an existing daily at the date
        // before overwrite, could move existing Daily to a retired folder
      },{merge: false});

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
        const { month, year } = data        
        const dailies = await db.collection("gallery")
          .doc(year)
          .collection(month)
          .get()

        if(!dailies.empty){
            // this will include whatever data we want the user to submit with the puzzle
            // i.e., sender name vs anonymous, tags, title, etc.
            // that will need to be built out in the gallery submission form.
            // for now, it only includes the normal puzzle data
          const dailyPuzzlesForTheMonth = dailies.docs.map((doc) => {
            const puzzleData = doc.data()
            const day = doc.id
            return {
              puzzleData,
              day,
            }
          });
          return dailyPuzzlesForTheMonth;
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
        // start here - format month and day with first digit as 0
        // make this util function
        const { year, month, day } = data
        const daily = await db.collection("gallery")
        .doc(year)
        .collection(month)
        .doc(day)
        .get();

        if(daily.exists) return daily.data()
        else {
          // @todo - once a day cloud function that populates from last years puzzle
          return [];
        }
      } catch (error: any) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
  }
)