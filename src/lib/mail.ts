import nodemailer from "nodemailer";

// Retrieve configuration variables from process.env
const host = process.env.SMTP_HOST || "";
const port = parseInt(process.env.SMTP_PORT || "587", 10);
const user = process.env.SMTP_USER || "";
const pass = process.env.SMTP_PASS || "";

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // True for port 465, false for other ports (e.g. 587)
  auth: {
    user,
    pass,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendMail({ to, subject, text, html }: MailOptions) {
  const mailOptions = {
    from: `"Wisdom Finance OS" <${user}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, "<br>"),
  };

  return transporter.sendMail(mailOptions);
}
