// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to,
    subject,
    text: text || "Your employee account has been created. Please check the details in HTML view.",
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
