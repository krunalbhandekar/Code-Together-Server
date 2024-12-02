import nodemailer from "nodemailer";

interface INodeMailerPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string; // "<h1>This is an html email</h1>"
  attachments?: { filename: string; path: string }[]; // [{filename: 'example.txt', path: './example.txt'}]
}

const sendEmailNotification = async (payload: INodeMailerPayload) => {
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
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        attachments: payload.attachments,
      };

      const res = await transporter.sendMail(mailOptions);
      console.log("Email sent: ", res.response);
    } catch (err) {
      console.log("Error sending email: ", err);
    }
  }, 10000); // debounce / rate limiton sending emails in short time
};

export default sendEmailNotification;
