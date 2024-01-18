const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Please provide message."],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
