const { addListing, removeListing, addPassenger, removePassenger, myListings, addRideRequest, myRideRequests, rejectRideRequest, acceptRideRequest, getRides } = require('../controllers/rideListingsController');


const router = require('express').Router();

router.post('/addListing', addListing);
router.delete('/removeListing/:listingId', removeListing);
router.delete('/removePassenger/:listingId/:passengerId', removePassenger);
router.post('/addPassenger', addPassenger);
router.get('/myListings/:driverId', myListings);
router.post('/addRideRequest', addRideRequest);
router.get('/myRideRequest/:driverId', myRideRequests);
router.delete('/rejectRideRequest/:rideRequestId', rejectRideRequest);
router.get('/acceptRideRequest/:rideRequestId', acceptRideRequest);
router.get('/getRides/:lat/:long/:destLat/:destLong', getRides);

module.exports = router;
