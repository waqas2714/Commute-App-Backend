const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app"); // Your Express app
const RideListings = require("../models/rideListingsModel");
const RideRequest = require("../models/RideRequests");
const User = require("../models/userModel");

jest.mock("../models/rideListingsModel");
jest.mock("../models/RideRequests");
jest.mock("../models/userModel");

describe("Ride Listings Controller", () => {

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /rideListings", () => {
    it("should create a new ride listing", async () => {
      const mockData = {
        departure: "Rawalpindi",
        destination: "Islamabad",
        time: "10:00",
        date: "2024-12-25",
        seatsAvailable: 4,
        pickupPoint: "Point A",
        driverId: "1",
        longdest: 73.0551,
        latdest: 33.6844,
        longdep: 73.0479,
        latdep: 33.6844,
      };

      // Mock the create method of RideListings model
      RideListings.create.mockResolvedValue({
        _id: "12345",
        ...mockData
      });

      const response = await request(app)
        .post("/rideListings")
        .send(mockData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.listingId).toBe("12345");
    });

    it("should return error if required fields are missing", async () => {
      const response = await request(app)
        .post("/rideListings")
        .send({}) // Missing all fields
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Please provide all the details of the ride.");
    });
  });

  describe("PUT /rideListings/:listingId", () => {
    it("should update an existing ride listing", async () => {
      const updatedData = {
        departure: "Rawalpindi",
        destination: "Lahore",
        date: "2024-12-30",
        time: "12:00",
        seatsAvailable: 3,
      };

      RideListings.findById.mockResolvedValue({
        _id: "12345",
        ...updatedData,
        save: jest.fn().mockResolvedValue(true),
      });

      const response = await request(app)
        .put("/rideListings/12345")
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should return error if listing not found", async () => {
      RideListings.findById.mockResolvedValue(null);

      const response = await request(app)
        .put("/rideListings/12345")
        .send({
          departure: "Rawalpindi",
          destination: "Lahore",
          date: "2024-12-30",
          time: "12:00",
          seatsAvailable: 3,
        })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Listing not found. Please try again later.");
    });
  });

  describe("DELETE /rideListings/:listingId", () => {
    it("should remove a ride listing", async () => {
      const mockListing = { _id: "12345" };
      
      RideListings.findByIdAndDelete.mockResolvedValue(mockListing);
      RideRequest.deleteMany.mockResolvedValue(true);

      const response = await request(app)
        .delete("/rideListings/12345")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.removedListing).toBe("12345");
    });

    it("should return error if listing not found", async () => {
      RideListings.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete("/rideListings/12345")
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Listing not found.");
    });
  });

  describe("POST /rideListings/addPassenger", () => {
    it("should add a passenger to a ride", async () => {
      const passengerData = {
        listingId: "12345",
        name: "John Doe",
        photo: "photo.jpg",
        school: "School X",
        userId: "user123",
      };

      const mockListing = {
        passengers: [],
        save: jest.fn().mockResolvedValue(true),
      };

      RideListings.findById.mockResolvedValue(mockListing);

      const response = await request(app)
        .post("/rideListings/addPassenger")
        .send(passengerData)
        .expect(200);

      expect(response.body.passengers.length).toBe(1);
      expect(response.body.passengers[0].name).toBe("John Doe");
    });
  });

  // Other controller methods can be similarly tested...

});
