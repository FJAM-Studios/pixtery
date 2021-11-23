import * as functions from "firebase-functions";
import db from "../db";
import { sendEmail } from "../nodeMailer";
import adminKey from "../serviceAccount";

export const getGalleryQueue = functions.https.onCall(
  async (data, context): Promise<Record<string, string>[] | void> => {
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
      // can get active or inactive puzzles, start at for pagination, limit
      const { active, startAt, limit } = data;

      const queue = await db
        .collection("galleryQueue")
        .where("active", "==", active)
        .orderBy("dateQueued")
        .startAt(startAt)
        .limit(limit)
        .get();
      if (!queue.empty) {
        // this will include whatever data we want the user to
        // submit with the puzzle
        // i.e., sender name vs anonymous, tags, title, etc.
        // that will need to be built out in the gallery submission form.
        // for now, it only includes the normal puzzle data
        const queueData = queue.docs.map((doc) => doc.data());
        return queueData;
      } else return [];
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

export const deactivateInQueue = functions.https.onCall(
  async (data, context): Promise<Record<string, string> | void> => {
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
      const { publicKey } = data;
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

export const addToQueue = functions.https.onCall(
  async (data, context): Promise<Record<string, string> | void> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not authenticated"
        );
      }

      const { publicKey, message, newPublicKey } = data;

      // get the puzzle data
      const res = await db.collection("pixteries").doc(publicKey).get();
      const puzzleData = res.data();

      if (puzzleData) {
        // add it to the list of pixteries under the new PK
        // this is so the changed message or anonymous sender will be
        // reflected when you add the daily puzzle
        await db
          .collection("pixteries")
          .doc(newPublicKey)
          .set(
            {
              ...puzzleData,
              publicKey: newPublicKey,
              message,
              senderName: data.anonymousChecked
                ? "Anonymous"
                : puzzleData.senderName,
            },
            { merge: true }
          );

        // add it to the gallery queue
        const dateQueued = new Date();
        const senderName = data.anonymousChecked
          ? "Anonymous"
          : puzzleData.senderName;
        await db
          .collection("galleryQueue")
          .doc(newPublicKey)
          .set(
            {
              ...puzzleData,
              publicKey: newPublicKey,
              message,
              active: true,
              dateQueued,
              senderName,
            },
            { merge: true }
          );

        // send an email to notify us
        try {
          const mailOptions = {
            to: adminKey.queueNotificationEmail,
            subject: `New Queue Submission - ${dateQueued.toString()}`,
            text: `
            New Queue Submission - ${dateQueued.toString()} \n
            https://www.pixtery.io/p/${newPublicKey} \n
            sender: ${senderName} \n
            message: ${message}
            `,
          };
          await sendEmail(mailOptions);
          return { status: "200" };
        } catch (error: unknown) {
          if (error instanceof Error)
            throw new functions.https.HttpsError(
              "unknown",
              error.message,
              error
            );
        }
      } else {
        throw new functions.https.HttpsError("not-found", "puzzle not found");
      }
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);
