const { default: mongoose } = require("mongoose");
const RideListings = require("../models/rideListingsModel");
const RideRequest = require("../models/RideRequests");
const User = require("../models/userModel");
const Reviews = require("../models/Reviews");


//Calculate the distance between two coordinates
function haversine(lat1, lon1, lat2, lon2) {
  // Radius of the Earth in kilometers
  const R = 6371.0;

  // Convert latitude and longitude from degrees to radians
  const [radLat1, radLon1, radLat2, radLon2] = [lat1, lon1, lat2, lon2].map((angle) => (angle * Math.PI) / 180);

  // Calculate the differences between latitudes and longitudes
  const dlat = radLat2 - radLat1;
  const dlon = radLon2 - radLon1;

  // Haversine formula
  const a = Math.sin(dlat / 2) ** 2 + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate the distance
  const distance = R * c;

  return distance;
}

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

    res.json({ success: true , listingId : listing._id});
  } catch (error) {
    res.json({ success : false, error: error.message });
  }
};

const updateListing = async (req, res)=>{
  try {
    const {departure, destination, date, time, seatsAvailable} = req.body;
    const {listingId} = req.params;
    const listing = await RideListings.findById(listingId);
    if (!listing) {
      throw new Error("Listing not found. Please try again later.");
    }
    listing.departure = departure;
    listing.destination = destination;
    listing.time = time;
    listing.date = date;
    listing.seatsAvailable = seatsAvailable;

    await listing.save();

    res.json({success : true});
  } catch (error) {
    res.json({ success : false, error: error.message });
  }
}

const removeListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    // Delete associated ride requests
    await RideRequest.deleteMany({ listingId });

    // Delete associated chats
    await Chat.deleteMany({ listingId });

    // Remove the listing itself
    const removedListing = await RideListings.findByIdAndDelete(listingId);

    res.json({ success: true, removedListing: removedListing._id });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};


// const finishRide = async (req, res) => {
//   try {
//     const { listingId } = req.params;

//     // Retrieve the listing to be removed
//     const removedListing = await RideListings.findById(listingId);

//     // Array to hold promises for adding reviews
//     const addReviewPromises = removedListing.passengers.map(async (passenger) => {
//       // Fetch passenger details from the User model
//       const passengerDetails = await User.findById(passenger.userId);

//       // Create a new review with passenger's name as reviewerName
//       const newReview = new Reviews({
//         stars: 0, // You may adjust this based on your requirements
//         comment: "No review given",
//         reviewerName: passengerDetails.username, // Use passenger's username as reviewerName
//         for: removedListing.driverId, // Passenger's user ID
//         from: passenger.userId, // Driver's user ID
//         isReviewGiven: false, // Marking the review as not given
//         departure: removedListing.departure,
//         destination: removedListing.destination
//       });

//       // Save the new review to the database
//       return newReview.save();
//     });

//     // Wait for all reviews to be added
//     await Promise.all(addReviewPromises);

//     // Delete ride requests associated with the listing
//     await RideRequest.deleteMany({ listingId });

//     // Delete chats associated with the listing
//     await Chat.deleteMany({ listingId });

//     // Delete the listing itself
//     await RideListings.findByIdAndDelete(listingId);

//     res.json({ success: true });
//   } catch (error) {
//     res.json({ success: false, error: error.message });
//   }
// };

const finishRide = async (req, res) => {
  try {
    const { listingId } = req.params;

    // Retrieve the listing to be removed
    const removedListing = await RideListings.findById(listingId);

    // Array to hold promises for adding reviews
    const addReviewPromises = removedListing.passengers.map(async (passenger) => {
      // Fetch passenger details from the User model
      const passengerDetails = await User.findById(passenger.userId);

      // Create a new review with passenger's name as reviewerName
      const newReview = new Reviews({
        stars: 0, // You may adjust this based on your requirements
        comment: "No review given",
        reviewerName: passengerDetails.username, // Use passenger's username as reviewerName
        for: removedListing.driverId, // Passenger's user ID
        from: passenger.userId, // Driver's user ID
        isReviewGiven: false, // Marking the review as not given
        departure: removedListing.departure,
        destination: removedListing.destination
      });

      // Save the new review to the database
      return newReview.save();
    });

    // Array to hold promises for deletion of ride requests and chats
    const deletePromises = [
      RideRequest.deleteMany({ listingId }),
      Chat.deleteMany({ listingId })
    ];

    // Wait for all reviews to be added and for deletion of ride requests and chats
    await Promise.all([...addReviewPromises, ...deletePromises]);

    // Delete the listing itself
    await RideListings.findByIdAndDelete(listingId);

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};


const addPassenger = async (req, res) => {
  try {
    const { listingId, name, photo, school, userId } = req.body;

    const listing = await RideListings.findById(listingId);
    listing.passengers.push({ name, photo, school, userId });

    await listing.save();

    
    await RideRequest.deleteOne({ userId, listingId });

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
    await listing.save();

    res.json({success : true});
  } catch (error) {
    res.json({ success : false, error: error.message });
  }
};

const myListings = async (req, res) => {
  try {
    const { driverId } = req.params;
    const listings = await RideListings.find({ driverId });

    // Transforming the array of listings to include only required fields
    const simplifiedListings = listings.map(listing => ({
      departure: listing.departure,
      destination: listing.destination,
      date: listing.date,
      time: listing.time,
      _id: listing._id
    }));

    res.json({ success: true, listings: simplifiedListings });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

const addRideRequest = async (req, res) => {
  try {
    
    const request = await RideRequest.create(req.body);
    if (!request) {
      throw new Error("The request could not be added, please try again.");
    }

    
    res.json({success : true});
  } catch (error) {
    res.json({ success : false, error: error.message });
  }
};

const myRideRequests = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    // Find all RideListings with the given driverId
    const rideListings = await RideListings.find({ driverId });

    // Array to hold promises for fetching RideRequests for each RideListing
    const rideRequestsPromises = rideListings.map(async (rideListing) => {
      // Find all RideRequests with the listingId of the current RideListing
      const rideRequests = await RideRequest.find({
        listingId: rideListing._id,
      });

      // Fetch user details for each RideRequest concurrently
      const rideRequestsDetails = Promise.all(rideRequests.map(async (rideRequest) => {
        // Get user details for each RideRequest
        const user = await User.findById(rideRequest.userId);

        // Create an object with combined details
        return {
          _id: rideRequest._id,
          departure: rideListing.departure,
          destination: rideListing.destination,
          time: rideListing.time,
          date: rideListing.date,
          username: user.username,
          school: user.school,
          image: user.image
        };
      }));

      return rideRequestsDetails;
    });

    // Wait for all promises to resolve
    const rideRequestsDetails = await Promise.all(rideRequestsPromises);

    // Flatten the array of arrays into a single array
    const flattenedRideRequestsDetails = rideRequestsDetails.flat();

    // Return the response
    return res.json({ success: true, rideRequests: flattenedRideRequestsDetails });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};


const rejectRideRequest = async (req, res) => {
  try {
    const { rideRequestId } = req.params;
    const deleted = await RideRequest.findByIdAndDelete(rideRequestId);
    res.json({success : true, deleted : deleted._id});
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
      throw new Error("Full capacity reached for this listing.");
    }

    listing.passengers.push({
      name: user.username,
      photo: user.image,
      school: user.school,
      userId: user._id
    });

    await listing.save();
    await RideRequest.findByIdAndDelete(rideRequestId);

    res.json({success : true});
  } catch (error) {
    res.json({ success : false, error: error.message });
  }
};

const getRides = async (req, res) => {
  try {
    const { long, lat, destLong, destLat } = req.params;

    const userLong = parseFloat(long);
    const userLat = parseFloat(lat);
    const destUserLong = parseFloat(destLong);
    const destUserLat = parseFloat(destLat);

    let listings = await RideListings.find();
    
    listings = await Promise.all(listings.map(async (listing) => {
      const driverInfo = await User.findById(listing.driverId);
      const {username, image, phone, carDetails:{name, model, number, color}} = driverInfo;
      
      return {
        ...listing._doc,
        driverName : username,
        image,
        phone,
        carName: name,
        model,
        number, 
        color
      };
    }));

    const myRides = listings
      .map((listing) => {
        const listingDepLat = parseFloat(listing.latdep);
        const listingDepLong = parseFloat(listing.longdep);
        const listingDestLat = parseFloat(listing.latdest);
        const listingDestLong = parseFloat(listing.longdest);

        const userDepartureDistance = haversine(userLat, userLong, listingDepLat, listingDepLong);
        const userDestinationDistance = haversine(destUserLat, destUserLong, listingDestLat, listingDestLong);

        if (userDepartureDistance > 1 || userDestinationDistance > 1) {
          return null;
        }

        const {_id, time, date, seatsAvailable, driverName, carName, passengers, image, departure, destination} = listing;

        return {
          departure,
          destination,
          _id,
          time,
          date,
          driverName,
          carName,
          seatsAvailable,
          image,
          passengers: passengers.length,
          
          distance: userDepartureDistance + userDestinationDistance
        };
      })
      .filter((ride) => ride !== null);

    myRides.sort((a, b) => a.distance - b.distance);

    res.json(myRides);
  } catch (error) {
    res.json({ success : false, error: error.message });
  }
};


const getListing = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const listing = await RideListings.findById(id).populate('driverId', 'username image school carDetails phone');
    const rideRequest = await RideRequest.find({listingId : id, userId});
    if (!listing) {
      throw new Error("Listing detail was not found. It might be removed. Please try again.");
    }
    
    const { username, image, school, carDetails, _id, phone } = listing.driverId;

    const simplifiedListing = {
      success: true,
      listing: {
        ...listing.toObject(),
        driverId: { username, image, school, carDetails, _id, phone }
      }
    };

    let isRequested;

    if (rideRequest.length > 0) {
      isRequested = true;  
    } else {
      isRequested = false;
    }

    res.json({listing : simplifiedListing, isRequested});
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

const passengerRideRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all ride requests for the given user and populate the associated ride listings
    const rideRequests = await RideRequest.find({ userId }).populate({
      path: 'listingId',
      populate: {
        path: 'driverId',
        select: 'username image school carDetails'
      }
    });

    // Check if any ride requests were found
    if (rideRequests.length === 0) {
      return res.json({ success: true, rideRequests });
    }

    // Modify the response for each ride request
    const modifiedRideRequests = rideRequests.map(request => {
      const { listingId, userId } = request;
      const { image, driverId, date, time, passengers, seatsAvailable } = listingId;
      return {
        image: driverId.image,
        driverName: driverId.username,
        driverCarName: driverId.carDetails.name,
        date,
        time,
        passengers: passengers.length,
        seatsAvailable,
        listingId: listingId._id
      };
    });

    
    res.json({ success: true, rideRequests: modifiedRideRequests });
  } catch (error) {
    // Handle errors
    res.json({ success: false, error: error.message });
  }
};

const getScheduledRidesPassenger = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all ride listings where the user's ID is present in the passengers array
    const rideListings = await RideListings.find({ 'passengers.userId': userId }).populate('driverId', 'username image carDetails');

    // Check if any ride listings were found
    if (rideListings.length === 0) {
      return res.json({ success: true, rideListings });
    }

    // Modify the response for each ride listing
    const modifiedRideListings = rideListings.map(listing => {
      const { _id, driverId, date, time, passengers, seatsAvailable } = listing;
      return {
        driverImage: driverId.image,
        driverName: driverId.username,
        carName: driverId.carDetails.name,
        date,
        passengers: passengers.length,
        time,
        seatsAvailable,
        listingId: _id
      };
    });

    // Send the modified ride listings as a response
    res.json({ success: true, rideListings: modifiedRideListings });
  } catch (error) {
    res.json({ success: false, error: error.message });
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
  getRides,
  getListing,
  passengerRideRequests,
  getScheduledRidesPassenger,
  updateListing,
  finishRide
};
