const mongoose = require("mongoose");

const carDetailsSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please give the car name."],
  },
  model: {
    type: String,
    required: [true, "Please give the car model."],
  },
  number: {
    type: String,
    required: [true, "Please give the car number."],
  },
  color: {
    type: String,
    required: [true, "Please give the car color."],
  },
});

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Name is Required."],
  },
  email: {
    type: String,
    required: [true, "Email is Required."],
    trim: true,
    match: [
      /^[a-zA-Z]+\.[a-zA-Z0-9]+(\d{2})[a-zA-Z]+@([a-zA-Z]+)\.edu\.pk$/,
      "Please provide a valid Email.",
    ],
  },
  cms: {
    type: String,
    required: [true, "CMS is Required."],
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is Required."],
  },
  image: {
    type: String,
    required: [true, "Please add a photo."],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number."],
    match: [/^03\d{9}$/, "Please enter a valid phone number."],
  },
  isDriver: {
    type: Boolean,
    default: false,
  },
  school: {
    type: String,
    required: [true, "Please select your school."],
  },
  carDetails: {
    type: carDetailsSchema,
    required: function () {
      return this.isDriver;
    },
    default: null,
  },
});

userSchema.index({ email: 1, isDriver: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
