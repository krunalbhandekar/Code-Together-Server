import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../logger.js";
import Status from "../enums/status.js";
import ErrorMessages from "../enums/error-messages.js";

dotenv.config();

const sendEmailNotification = async ({
  to,
  subject,
  text,
  html, // "<h1>This is an HTML email</h1>"
  attachments = [], // "[{filename: 'example.txt', path: './example.txt'}]"
}) => {
  setTimeout(async () => {
    try {
      const transporter = nodemailer.createTransport({
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
        port: 465,
        secure: true,
        service: "gmail",
        host: "smtp.gmail.com",
      });

      const mailOptions = {
        from: `${process.env.NODEMAILER_APP_NAME} <${process.env.NODEMAILER_USER}>`,
        to,
        replyTo: process.env.NODEMAILER_USER,
        subject,
        text,
        html,
        attachments,
      };

      const res = await transporter.sendMail(mailOptions);
      logger.info("[email-nodemailer]", res.response);
      return { status: Status.SUCCESS };
    } catch (err) {
      if (err instanceof Error) {
        logger.error("[email-nodemailer]", err.message);
      }
      return { status: Status.ERROR, error: ErrorMessages.E2001 };
    }
  }, 10000); // debounce or rate limit on sending emails in short time
};

export default sendEmailNotification;
