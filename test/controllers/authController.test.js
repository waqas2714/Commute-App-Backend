const request = require("supertest");
const {app,server} = require("../../server");
const { transporter } = require("../../utils/mailer");
const User = require("../../models/userModel");
const mockingoose = require("mockingoose");
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'sample.jwt.token')
}));

// Mock Bcrypt 
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn()
}));

// Mock Nodemailer
jest.mock('../../utils/mailer', () => ({
  transporter: {
    sendMail: jest.fn((options, callback) => {
      callback(null, { response: "Email sent" });
    })
  }
}));

describe("Auth Controller - Signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up necessary environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.BACKEND_URL = 'http://localhost:5001';
    process.env.USER_EMAIL = 'test@example.com';
  }); 

  it("should create user and send verification email", async () => {
    // Mock User.findOne to return null (no existing user)
    mockingoose(User).toReturn(null, "findOne");

    const response = await request(app).post("/api/auth/signup").send({
      email: "newuser@example.com",
      username: "newuser",
      password: "password123",
      school: "Test School",
      phone: "123456789",
      image: "data:image/jpeg;base64,...",
    });

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Email Sent!");

    // Verify Cloudinary upload was called
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      "data:image/jpeg;base64,...",
      { folder: "nustWheelz" },
      expect.any(Function)
    );

    // Verify email was sent
    expect(transporter.sendMail).toHaveBeenCalled();
  });

  it("should return error if required fields are missing", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      email: "test@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Please provide all the fields.");
  });

  it("should return error if email already exists", async () => {
    mockingoose(User).toReturn({ email: "test@example.com" }, "findOne");

    const response = await request(app).post("/api/auth/signup").send({
      email: "test@example.com",
      username: "testuser",
      password: "password123",
      school: "Test School",
      phone: "123456789",
      image: "data:image/jpeg;base64,...",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "A passenger with this email address already exists."
    );
  });
});

describe("Auth Controller - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if user does not exist", async () => {
    mockingoose(User).toReturn(null, "findOne");

    const response = await request(app).post("/api/auth/login").send({
      email: "notfound@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("No user exists with this email.");
  });

  it("should return error if password is incorrect", async () => {
    // Mock finding a user
    mockingoose(User).toReturn(
      { 
        email: "test@example.com", 
        password: "hashedpassword123" 
      }, 
      "findOne"
    );

    // Mock bcrypt compare to return false (incorrect password)
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "One of the fields is wrong. Please try again."
    );
  });

  it("should return user and token if login is successful", async () => {
    // Mock finding a user
    mockingoose(User).toReturn(
      { 
        email: "test@example.com", 
        password: "hashedpassword123" 
      }, 
      "findOne"
    );

    // Mock bcrypt compare to return true (correct password)
    bcrypt.compare.mockResolvedValue(true);

    // Mock jwt sign to return a token
    jwt.sign.mockReturnValue("sample.jwt.token");

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBe("sample.jwt.token");
  });
});