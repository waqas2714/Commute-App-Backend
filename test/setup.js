jest.mock("cloudinary", () => ({
    v2: {
      uploader: {
        upload: jest.fn(),
      },
    },
  }));
  
  jest.mock("../utils/mailer", () => ({
    transporter: {
      sendMail: jest.fn(),
    },
  }));
  