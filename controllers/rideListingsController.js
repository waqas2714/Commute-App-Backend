const { default: mongoose } = require("mongoose");
const RideListings = require("../models/rideListingsModel");
const RideRequest = require("../models/RideRequests");
const User = require("../models/userModel");

const addListing = async (req, res) => {
  try {
    const {
      departure,
      destination,
      time,
      date,
      seatsAvailable,
      pickupPoint,
      driverId,
      longdest,
      latdest,
      longdep,
      latdep
    } = req.body;

    if (
      !departure ||
      !destination ||
      !time ||
      !date ||
      !seatsAvailable ||
      !pickupPoint ||
      !driverId ||
      !longdest ||
      !latdest ||
      !longdep ||
      !latdep
    ) {
      throw new Error("Please provide all the details of the ride.");
    }

    const listing = await RideListings.create(req.body);

    res.json({ success: true });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const removeListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    await RideRequest.deleteMany({ listingId });
    const removedListing = await RideListings.findByIdAndDelete(listingId);

    res.json(removedListing);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const addPassenger = async (req, res) => {
  try {
    const { listingId, name, photo, phone, userId } = req.body;

    const listing = await RideListings.findById(listingId);
    listing.passengers.push({ name, photo, phone, userId });

    await listing.save();

    res.json(listing);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const removePassenger = async (req, res) => {
  try {
    const { listingId, passengerId } = req.params;

    const listing = await RideListings.findById(listingId);

    // Filter out the passenger with the given userId
    listing.passengers = listing.passengers.filter(
      (passenger) => passenger.userId.toString() != passengerId
    );

    // Save the updated listing
    const updatedListing = await listing.save();

    res.json(updatedListing);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const myListings = async (req, res) => {
  try {
    const { driverId } = req.params;
    const listings = await RideListings.find({ driverId });

    res.json(listings);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const addRideRequest = async (req, res) => {
  try {
    // const { listingId, userId } = req.body;

    const request = await RideRequest.create(req.body);
    // const user = await User.findById(userId);
    // const listing = await RideListings.findById(listingId);

    // const { username, school, phone, image } = user;
    // const { departure, destination, time, date } = listing;

    // res.json({
    //   username,
    //   school,
    //   phone,
    //   image,
    //   departure,
    //   destination,
    //   time,
    //   date,
    // });
    res.json(request);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const myRideRequests = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    // Find all RideListings with the given driverId
    const rideListings = await RideListings.find({ driverId });

    if (rideListings.length === 0) {
      return res.json(rideListings);
    }

    // Fetch RideRequests for each RideListing
    const rideRequestsDetails = [];

    for (const rideListing of rideListings) {
      // Find all RideRequests with the listingId of the current RideListing
      const rideRequests = await RideRequest.find({
        listingId: rideListing._id,
      });

      for (const rideRequest of rideRequests) {
        // Get user details for each RideRequest
        const user = await User.findById(rideRequest.userId);

        // Create an object with combined details
        const combinedDetails = {
          _id: rideRequest._id,
          departure: rideListing.departure,
          destination: rideListing.destination,
          time: rideListing.time,
          date: rideListing.date,
          username: user.username,
          school: user.school,
          phone: user.phone,
          image: user.image,
        };

        // Add the combined details to the response array
        rideRequestsDetails.push(combinedDetails);
      }
    }

    // Return the response as an array
    return res.json(rideRequestsDetails);
  } catch (error) {
    console.error(error);
    return res.json({ error: error.message });
  }
};

const rejectRideRequest = async (req, res) => {
  try {
    const { rideRequestId } = req.params;
    const deleted = await RideRequest.findByIdAndDelete(rideRequestId);

    res.json(deleted);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const acceptRideRequest = async (req, res) => {
  try {
    const { rideRequestId } = req.params;

    const rideRequest = await RideRequest.findById(rideRequestId);

    const listing = await RideListings.findById(rideRequest.listingId);
    if (!listing) {
      throw new Error("Listing associated to the listingId not found.");
    }
    const user = await User.findById(rideRequest.userId);
    if (!user) {
      throw new Error("User associated to the userId not found.");
    }
    if (!(listing.seatsAvailable > listing.passengers.length)) {
      throw new Error("Full capacity reached.");
    }

    listing.passengers.push({
      name: user.username,
      photo: user.image,
      phone: user.phone,
      userId: listing.userId,
    });

    await RideRequest.findByIdAndDelete(rideRequestId);

    res.json(listing.passengers);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getRides = async (req, res) => {
    try {
      const { long, lat, destLong, destLat } = req.params;
  
      // Convert the input strings to numbers
      const userLong = parseFloat(long);
      const userLat = parseFloat(lat);
      const destUserLong = parseFloat(destLong);
      const destUserLat = parseFloat(destLat);
  
      // Define a distance threshold (adjust as needed)
      const maxDistance = 20000; // in meters
  
      // Query for RideListings that are within the given distance from the user's location
      const nearbyRideListings = await RideListings.find({
        'pickupPoint': {
          $geoWithin: {
            $centerSphere: [[userLong, userLat], maxDistance / 6371000], // 6371000 is Earth's radius in meters
          },
        },
        'destination': {
          $geoWithin: {
            $centerSphere: [[destUserLong, destUserLat], maxDistance / 6371000],
          },
        },
      })
        .sort({
          'pickupPoint.long': 1,
          'pickupPoint.lat': 1,
          'destination.long': 1,
          'destination.lat': 1,
        })
        .exec();
  
      res.json({ nearbyRideListings });
    } catch (error) {
      res.json({ error: error.message });
    }
  };
    

module.exports = {
  addListing,
  removeListing,
  addPassenger,
  removePassenger,
  myListings,
  addRideRequest,
  myRideRequests,
  rejectRideRequest,
  acceptRideRequest,
  getRides
};
