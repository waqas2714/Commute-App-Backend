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
    unique: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      "Please provide a valid Email.",
    ],
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
    match: [/^\+92[0-9]{10}$/, "Please enter a valid phone number."],
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

const User = mongoose.model("User", userSchema);

module.exports = User;
