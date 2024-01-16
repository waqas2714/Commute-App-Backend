const mongoose = require("mongoose");

const rideRequestsSchema = mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RideListings",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
});

const RideRequest = mongoose.model("RideRequests", rideRequestsSchema);

module.exports = RideRequest;
