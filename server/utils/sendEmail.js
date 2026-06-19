const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Use mock ethereal or standard smtp details
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || "user",
      pass: process.env.SMTP_PASSWORD || "pass",
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || "cineBook"} <${process.env.FROM_EMAIL || "noreply@cinebook.com"}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
};

module.exports = { sendEmail };
