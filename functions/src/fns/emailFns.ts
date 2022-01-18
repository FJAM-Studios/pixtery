import * as functions from "firebase-functions";
import { sendEmail } from "../nodeMailer";
import adminKey from "../serviceAccount";

export const submitFeedback = functions.https.onCall(
  async (data, context): Promise<void | { status: string }> => {
    try {
      // throw error if user is not authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "user not authenticated"
        );
      }

      const { subject, email, message } = data;
      const mailOptions = {
        to: adminKey.feedbackEmail,
        subject: subject,
        text: `from: ${email}\n\nmessage: ${message}`,
      };
      await sendEmail(mailOptions);
      return { status: "200" };
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);
