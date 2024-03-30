const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const { transporter } = require("../utils/mailer");
const User = require("../models/userModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const generateToken = async (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
  return token;
};

const signup = async (req, res) => {
  try {
    const { email, username, password, school, isDriver, phone, image } =
      req.body;
    let mailOptions;

    const isDriverBool = false;

    if (!email || !username || !password || !school || !phone) {
      throw new Error("Please provide all the fields.");
    }

    const existingUser = await User.findOne({
      email: req.body.email,
      isDriver: isDriverBool,
    });

    if (existingUser) {
      throw new Error(
        `A ${
          isDriverBool ? "driver" : "passenger"
        } with this email address already exists.`
      );
    }

    cloudinary.uploader.upload(
      image,
      { folder: "nustWheelz" },
      async function (cloudError, uploadedImage) {
        try {
          if (cloudError) {
            return res.json({ error: cloudError, success: false });
          }

          let hashedPassword = await bcrypt.hash(password, 10);

          const token = jwt.sign(
            {
              email,
              username,
              password: hashedPassword,
              isDriver: false,
              carDetails: null,
              school,
              phone,
              image: uploadedImage.url,
              cms: req.body.cms,
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
            }
          });

          res.status(200).json({ success: true, message: "Email Sent!" });
        } catch (error) {
          res.json({ success: false, error: error.message });
          console.log(error.message);
        }
      }
    );
  } catch (error) {
    res.json({ success: false, error: error.message });
    console.log(error.message);
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

const login = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("No user exists with this email.");
    }

    const isCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isCorrect) {
      throw new Error("One of the fields is wrong. Please try again.");
    }

    const { password, ...userWithoutPassword } = user;
    const token = await generateToken(userWithoutPassword._doc);
    res.json({ user: userWithoutPassword._doc, token, success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No user registered with this email.");
    }

    const { password, ...userWithoutPassword } = user;

    const token = await generateToken(userWithoutPassword);

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email, // Email address you want to send the email to
      subject: "Account Validation",
      html: `
  <p>Reset your Password by clicking on the link: </p>
  <a href='${process.env.FRONTEND_URL}/resetPassword/${token}' >Reset!</a>
  <p>Regards</p><br /><h2>NUSTWheelz</h2>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.json({ success: false, error: error.message });
      }
    });

    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

const resetPassword = async (req, res)=>{
  try {
    const {token, password} = req.body;
    const payload = jwt.decode(token);
    const user = await User.findById(payload._doc._id);
    if (!user) {
      throw new Error("There was something wrong, please try again.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    res.json({success:true, message: "Password changed successfully. Log in with new password."})
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
}

module.exports = {
  signup,
  verifyAccount,
  login,
  forgotPassword,
  resetPassword,
};
