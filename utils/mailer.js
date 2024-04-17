const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Gmail SMTP server hostname
            port: 587,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
});

module.exports = { transporter };
