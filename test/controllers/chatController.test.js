const request = require("supertest");
const { app, server } = require("../../server");
const Chat = require("../../models/Chat");
const RideListings = require("../../models/rideListingsModel");
const mockingoose = require("mockingoose");
const cloudinary = require('cloudinary').v2;


// Mock Cloudinary
jest.mock('cloudinary', () => ({
    v2: {
      config: jest.fn(),
      uploader: {
        upload: jest.fn((image, options, callback) => {
          callback(null, {
            url: 'https://example.com/uploaded-image.jpg'
          });
        })
      }
    }
  }));

describe("Chat Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe("addChat", () => {
    it("should add a new chat and return success", async () => {
      // Mock Chat.create to simulate successful chat creation
      mockingoose(Chat).toReturn({ message: "Hello", listingId: "123", from: "user123" }, "save");

      const response = await request(app).post("/api/chat/addChat/123/user123").send({
        message: "Hello",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return an error if chat creation fails", async () => {
      // Mock Chat.create to throw an error
      mockingoose(Chat).toReturn(new Error("Chat creation failed"), "save");

      const response = await request(app).post("/api/chat/addChat/123/user123").send({

      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Chat creation failed");
    });
  });

  describe("removeChat", () => {
    it("should delete a chat and return it", async () => {
      // Mock Chat.findByIdAndDelete to simulate successful deletion
      mockingoose(Chat).toReturn({ _id: "chat123", message: "Hello" }, "findOneAndDelete");

      const response = await request(app).delete("/api/chat/chat123");

      expect(response.status).toBe(200);
        expect(response.body.message).toBe("Chat deleted successfully");
    });

    it("should return an error if chat deletion fails", async () => {
      // Mock Chat.findByIdAndDelete to throw an error
      mockingoose(Chat).toReturn(new Error("Chat deletion failed"), "findOneAndDelete");

      const response = await request(app).delete("/api/chat/chat123");

      expect(response.status).toBe(200);
      expect(response.body.error).toBe("Chat deletion failed");
    });
  });

//   describe("getAllChats", () => {
//     it("should return all chats for a user", async () => {
//       // Mock RideListings.find to return mock listings
//       mockingoose(RideListings).toReturn(
//         [
//           { _id: "list123", departure: "A", destination: "B", date: "2024-12-17", time: "10:00 AM", driverId: "user123" },
//           { _id: "list456", departure: "C", destination: "D", date: "2024-12-18", time: "11:00 AM", passengers: [{ userId: "user123" }] },
//         ],
//         "find"
//       );

//       const response = await request(app).get("/api/chat/getAllChats/user123");

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.chats.length).toBe(2);
//       expect(response.body.chats[0]).toHaveProperty("isDriver", true);
//     });

//     it("should return an error if fetching chats fails", async () => {
//       // Mock RideListings.find to throw an error
//       mockingoose(RideListings).toReturn(new Error("Database error"), "find");

//       const response = await request(app).get("/api/chat/getAllChats/user123");

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBe("Database error");
//     });
//   });

describe("Chat Controller › getAllChats", () => {
  it("should return all chats for a user", async () => {
    const userId = "1234567890abcdef12345678"; // Example userId
    const mockListings = [
      {
        _id: "60f71b1f9e5d3a001f5284ea",
        departure: "New York",
        destination: "Boston",
        time: "10:00 AM",
        date: "2024-12-18",
        driverId: userId,
        passengers: [
          {
            name: "John Doe",
            photo: "photo1.jpg",
            school: "NYU",
            userId: "abcdefabcdefabcdefabcdef",
          },
        ],
      },
      {
        _id: "60f71b1f9e5d3a001f5284eb",
        departure: "Boston",
        destination: "Chicago",
        time: "5:00 PM",
        date: "2024-12-20",
        driverId: "abcdefabcdefabcdefabcdef",
        passengers: [
          {
            name: "Jane Smith",
            photo: "photo2.jpg",
            school: "MIT",
            userId: userId,
          },
        ],
      },
    ];

    // Mock the RideListings.find query
    mockingoose(RideListings).toReturn(mockListings, "find");

    // Simulate the API request
    const response = await request(app).get(`/api/chat/getAllChats/${userId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.chats).toHaveLength(2);

    const [chat1, chat2] = response.body.chats;

    // Validate the first chat
    expect(chat1).toEqual({
      departure: "New York",
      destination: "Boston",
      date: "2024-12-18T00:00:00.000Z",
      time: "10:00 AM",
      listingId: "60f71b1f9e5d3a001f5284ea",
      isDriver: true,
    });

    // Validate the second chat
    expect(chat2).toEqual({
      departure: "Boston",
      destination: "Chicago",
      date: "2024-12-20T00:00:00.000Z",
      time: "5:00 PM",
      listingId: "60f71b1f9e5d3a001f5284eb",
      isDriver: false,
    });
  });

  it("should handle errors gracefully", async () => {
    const userId = "1234567890abcdef12345678";

    // Mock an error in RideListings.find
    mockingoose(RideListings).toReturn(new Error("Database error"), "find");

    const response = await request(app).get(`/api/chat/getAllChats/${userId}`);

    // Assertions
    expect(response.status).toBe(200); // Your controller sends a 200 even on error
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Database error");
  });
});
});
