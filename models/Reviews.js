const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    comment: {
      type: String,
    },
    departure: {
      type: String,
      required: [true, "Please provide departure name."]
    },
    destination: {
      type: String,
      required: [true, "Please provide destination name."]
    },
    for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isReviewGiven: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Reviews = mongoose.model("Reviews", reviewSchema);

module.exports = Reviews;
