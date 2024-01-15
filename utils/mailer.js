const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com', // Outlook SMTP server hostname
  port: 587, // Port for secure TLS connection
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.USER_EMAIL, // Your Outlook email address
    pass: process.env.USER_EMAIL_PASSWORD + "#" // Your Outlook email password
    // user: "waqasali00123@gmail.com", // Your Outlook email address
    // pass: "OutlookPassword1#" // Your Outlook email password
  }
});

module.exports = { transporter };
