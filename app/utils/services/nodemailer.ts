import nodemailer from "nodemailer";

interface INodeMailerPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: [{ filename: string; path: string }];
}

const sendEmailNotification = async (payload: INodeMailerPayload) => {
  console.log(payload);
};

export default sendEmailNotification;
