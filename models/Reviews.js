const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    stars: {
      type: Number,
      required: [true, "Please provide stars."],
    },
    comment: {
      type: String,
    },
    reviewerName: {
      type: String,
      required: [true, "Please provide reviewer name."],
    },
    for: {
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

const Reviews = mongoose.model("Reviews", reviewSchema);

module.exports = Reviews;
