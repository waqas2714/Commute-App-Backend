const request = require("supertest");
const { app, server } = require("../../server");
const Reviews = require("../../models/Reviews");
const mockingoose = require("mockingoose");

describe("Review Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe("addReview", () => {
    it("should add a review and return success", async () => {
      // Mock Reviews.findByIdAndUpdate to simulate successful review update
      mockingoose(Reviews).toReturn({ _id: "review123", comment: "Great ride!", isReviewGiven: true }, "findOneAndUpdate");

      const response = await request(app).post("/api/review/addReview/review123").send({
        comment: "Great ride!",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return an error if review update fails", async () => {
      // Mock Reviews.findByIdAndUpdate to throw an error
      mockingoose(Reviews).toReturn(new Error("Review update failed"), "findOneAndUpdate");

      const response = await request(app).post("/api/review/addReview/review123").send({
        comment: "Great ride!",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Review update failed");
    });
  });

  describe("deleteReview", () => {
    it("should delete a review and return success", async () => {
      // Mock Reviews.findByIdAndDelete to simulate successful review deletion
      mockingoose(Reviews).toReturn({ _id: "review123", comment: "Great ride!" }, "findOneAndDelete");

      const response = await request(app).delete("/api/review/deleteReview/review123");

      expect(response.status).toBe(200);
      expect(response.body._id).toBe("review123");
    });

    it("should return an error if review deletion fails", async () => {
      // Mock Reviews.findByIdAndDelete to throw an error
      mockingoose(Reviews).toReturn(new Error("Review deletion failed"), "findOneAndDelete");

      const response = await request(app).delete("/api/review/deleteReview/review123");

      expect(response.status).toBe(200);
      expect(response.body.error).toBe("Review deletion failed");
    });
  });

  describe("getReviewsDriver", () => {
    it("should return all reviews for a driver", async () => {
      const userId = "driver123";
      const mockReviews = [
        {
          _id: "review123",
          comment: "Great driver!",
          from: { username: "John Doe", school: "NYU" },
          isReviewGiven: true,
        },
        {
          _id: "review456",
          comment: "Smooth ride!",
          from: { username: "Jane Smith", school: "MIT" },
          isReviewGiven: true,
        },
      ];

      // Mock Reviews.find to return mock reviews
      mockingoose(Reviews).toReturn(mockReviews, "find");

      const response = await request(app).get(`/api/review/getReviewsDriver/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reviews.length).toBe(2);
      expect(response.body.reviews[0].comment).toBe("Great driver!");
    });

    it("should return an error if fetching reviews fails", async () => {
      const userId = "driver123";

      // Mock Reviews.find to throw an error
      mockingoose(Reviews).toReturn(new Error("Database error"), "find");

      const response = await request(app).get(`/api/review/getReviewsDriver/${userId}`);

      expect(response.status).toBe(200); // Your controller sends a 200 even on error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("getReviewsUser", () => {
    it("should return all reviews given by a user", async () => {
      const userId = "user123";
      const mockReviews = [
        {
          _id: "review123",
          comment: "Great ride!",
          departure: "A",
          destination: "B",
          for: { username: "Driver A", image: "driverA.jpg" },
          isReviewGiven: false,
        },
        {
          _id: "review456",
          comment: "Nice experience!",
          departure: "C",
          destination: "D",
          for: { username: "Driver B", image: "driverB.jpg" },
          isReviewGiven: false,
        },
      ];

      // Mock Reviews.find to return mock reviews
      mockingoose(Reviews).toReturn(mockReviews, "find");

      const response = await request(app).get(`/api/review/getReviewsUser/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reviews.length).toBe(2);
      expect(response.body.reviews[0].comment).toBe("Great ride!");
    });

    it("should return an error if fetching reviews fails", async () => {
      const userId = "user123";

      // Mock Reviews.find to throw an error
      mockingoose(Reviews).toReturn(new Error("Database error"), "find");

      const response = await request(app).get(`/api/review/getReviewsUser/${userId}`);

      expect(response.status).toBe(200); // Your controller sends a 200 even on error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Database error");
    });
  });
});
