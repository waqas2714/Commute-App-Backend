const mongoose = require("mongoose");

const rideListingsSchema = mongoose.Schema({
  departure: {
    type: String,
    required: [true, "Departure Location is Required."],
  },
  destination: {
    type: String,
    required: [true, "Destination location is Required."],
  },
  longdest: {
    type: String,
    required: [true, "Destination location is Required."],
  },
  latdest: {
    type: String,
    required: [true, "Destination location is Required."],
  },
  longdep: {
    type: String,
    required: [true, "Destination location is Required."],
  },
  latdep: {
    type: String,
    required: [true, "Destination location is Required."],
  },
  time: {
    type: String,
    required: [true, "Time of departure is Required."],
  },
  date: {
    type: Date,
    required: [true, "Date of departure is Required."],
  },
  seatsAvailable: {
    type: Number,
    required: [true, "Please add the number of available seats."],
  },
  passengers: [
    {
      name: String,
      photo: String,
      phone: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  pickupPoint: {
    long: String,
    lat: String,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const RideListings = mongoose.model("RideListings", rideListingsSchema);

module.exports = RideListings;
