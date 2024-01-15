const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { transporter } = require("../utils/mailer");
const User = require("../models/userModel");

const generateToken = async (payload)=>{
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}

const signup = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      const { email, username, password, carDetails, school, phone } = req.body;
      let mailOptions;

      if (
        !email ||
        !username ||
        !password ||
        !carDetails ||
        !school ||
        !phone
      ) {
        throw new Error("Please fill in all the fields.");
      }

      const image = req.file;
      let hashedPassword = await bcrypt.hash(password, 10);

      let isDriver = req.body.isDriver === "true"; // Convert to boolean
      if (isDriver) {
        const actualCarDetails = JSON.parse(carDetails);

        console.log(actualCarDetails);
        if (!carDetails) {
          throw new Error("Please provide car details");
        }

        const token = jwt.sign(
          {
            ...req.body,
            password: hashedPassword,
            image: "testImage",
            carDetails: actualCarDetails,
          },
          process.env.JWT_SECRET
        );

        mailOptions = {
          from: process.env.USER_EMAIL,
          to: email, // Email address you want to send the email to
          subject: "Account Validation",
          html: `<h3>Dear ${username},</h3>
            <p>Verify your account by clicking on the link: </p>
            <a href='http://localhost:5000/api/auth/verifyAccount/${token}' >Verify!</a>
            <p>Best regards,</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            res.json({ error: error.message });
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      } else {
        const token = jwt.sign(
          {
            email,
            username,
            password: hashedPassword,
            isDriver: false,
            carDetails: null,
            school,
            phone,
            image: "test image",
          },
          process.env.JWT_SECRET
        );

        mailOptions = {
          from: process.env.USER_EMAIL,
          to: email, // Email address you want to send the email to
          subject: "Account Validation",
          html: `<h3>Dear ${username},</h3>
        <p>Verify your account by clicking on the link: </p>
        <a href='http://localhost:5000/api/auth/verifyAccount/${token}' >Verify!</a>
        <p>Best regards,</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            res.json({ error: error.message });
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }

      res.status(200).json({ message: "Email Sent!" });
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (user) {
      const newUser = await User.create(user);

      if (newUser) {
        return res.json(newUser);
      } else {
        throw new Error("User not created...");
      }
    }
  } catch (error) {
    res.json({ error: error.message });
  }
};

const login = async (req, res)=>{
    try {
        const {email} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            throw new Error("No user registered with this email.");
        }

        const isCorrect = await bcrypt.compare(req.body.password, user.password)

        if (!isCorrect) {
            throw new Error("One of the fields is wrong. Please try again.");
        }

        const {password, ...userWithoutPassword} = user;
        const token = await generateToken(userWithoutPassword._doc);
        res.json({user : userWithoutPassword._doc, token});
    } catch (error) {
        res.json({ error: error.message });
    }
}

module.exports = {
  signup,
  verifyAccount,
  login
};
