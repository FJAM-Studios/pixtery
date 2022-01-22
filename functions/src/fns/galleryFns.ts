import * as functions from "firebase-functions";
import db from "../db";
const DAILY_TIMEZONE = "America/New_York";
import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone"; // dependent on utc plugin
import * as utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timezone);

export const checkGalleryAdmin = functions.https.onCall(
  async (_data, context): Promise<boolean | void> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not authenticated"
        );
      }

      // check if gallery admin
      const admin = await db
        .collection("galleryAdmins")
        .doc(context.auth.uid)
        .get();
      if (!admin.exists) {
        return false;
      }
      return true;
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

export const addToGallery = functions.https.onCall(
  async (data, context): Promise<void> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not authenticated"
        );
      }

      // throw error if user is not member of gallery admins
      const admin = await db
        .collection("galleryAdmins")
        .doc(context.auth.uid)
        .get();
      if (!admin.exists) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not gallery admin"
        );
      }

      const { publicKey, year, month, day } = data;
      //get the puzzle data from the gallery queue
      const res = await db.collection("galleryQueue").doc(publicKey).get();
      const puzzleData = res.data();

      // set puzzle for that date on firestore
      await db
        .collection("gallery")
        .doc(year)
        .collection(month)
        .doc(day)
        .set(
          {
            ...puzzleData,
            //figured this would be good to remove from the 'live' gallery bc it's sent out to everyone
            notificationToken: null,
            addedBy: context.auth.uid,
            addedOn: new Date(),
            // currently will overwrite an existing daily at the date
            // before overwrite, could move existing Daily to a retired folder
          },
          { merge: false }
        );

      //make the puzzle inactive in the queue
      await db
        .collection("galleryQueue")
        .doc(publicKey)
        .set({ active: false }, { merge: true });
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

export const getDailyDates = functions.https.onCall(
  async (data, context): Promise<void | FirebaseFirestore.DocumentData> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not authenticated"
        );
      }
      // throw error if user is not member of gallery admins
      const admin = await db
        .collection("galleryAdmins")
        .doc(context.auth.uid)
        .get();
      if (!admin.exists) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not gallery admin"
        );
      }
      const { month, year } = data;
      const dailies = await db
        .collection("gallery")
        .doc(year)
        .collection(month)
        .get();

      if (!dailies.empty) {
        // this will include whatever data we want the user to submit with the puzzle
        // i.e., sender name vs anonymous, tags, title, etc.
        // that will need to be built out in the gallery submission form.
        // for now, it only includes the normal puzzle data
        const dailyPuzzlesForTheMonth = dailies.docs.map((doc) => {
          const puzzleData = doc.data();
          const day = doc.id;
          return {
            puzzleData,
            day,
          };
        });
        return dailyPuzzlesForTheMonth;
      } else return [];
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

export const removeDailyPuzzle = functions.https.onCall(
  async (data, context): Promise<void> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not authenticated"
        );
      }

      // throw error if user is not member of gallery admins
      const admin = await db
        .collection("galleryAdmins")
        .doc(context.auth.uid)
        .get();
      if (!admin.exists) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not gallery admin"
        );
      }
      const { publicKey, year, month, day } = data;
      // remove it from gallery/daily
      await db
        .collection("gallery")
        .doc(year)
        .collection(month)
        .doc(day)
        .delete();
      // set it active in queue
      await db
        .collection("galleryQueue")
        .doc(publicKey)
        .set({ active: true }, { merge: true });
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

export const getDaily = functions.https.onCall(
  async (
    data,
    context
  ): Promise<void | null | FirebaseFirestore.DocumentData> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not authenticated"
        );
      }

      //get today's date in EST and create vars
      const now = dayjs().tz(DAILY_TIMEZONE);

      const [year, month, day] = getESTDate(now);
      const daily = await getDailyForDate(year, month, day);

      if (daily.exists) return daily.data();
      else {
        // @todo - once a day cloud function that populates from last years puzzle
        return null;
      }
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

const getDailyForDate = async (year: string, month: string, day: string) => {
  return await db
    .collection("gallery")
    .doc(year)
    .collection(month)
    .doc(day)
    .get();
};

const getESTDate = (date: any): string[] => {
  const year = date.get("year").toString();
  // for month and day, return the two numbers from end of string (i.e. "09" or "10")
  const month = `0${date.get("month") + 1}`.slice(-2); // month is indexed to 0, so add 1
  const day = `0${date.get("date")}`.slice(-2);
  return [year, month, day];
};
