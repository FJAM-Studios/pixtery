import { createTransport } from "nodemailer";
import Mail = require("nodemailer/lib/mailer");
import SMTPTransport = require("nodemailer/lib/smtp-transport");
// may need to change serviceAccount.ts to have right type
import adminKey from "./serviceAccount";

export const sendEmail = async (mailOptions: Mail.Options): Promise<void> => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: adminKey.senderAccount,
      pass: adminKey.password,
    },
  });

  const transport = (
    error: Error | null,
    info: SMTPTransport.SentMessageInfo
  ): void => {
    error ? console.log(error) : console.log(info.messageId);
  };

  await transporter.sendMail(
    { ...mailOptions, from: adminKey.senderAccount },
    transport
  );
};
