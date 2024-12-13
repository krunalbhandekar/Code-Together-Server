import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmailNotification = async (payload) => {
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
