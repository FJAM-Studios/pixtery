import * as functions from "firebase-functions";
const { createTransport } = require('nodemailer');
//may need to change serviceAccount.ts to have right type
import adminKey from "../serviceAccount";

const sender = adminKey.senderAccount;
const password = adminKey.password;

export const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: sender,
    pass: password,
  },
});

export const transport = (error: any, info: { messageId: any; }) => error ? console.log(error) : console.log(info.messageId);

export const handleEmail = functions.https.onCall(async(data, context) => {
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