const Reviews = require("../models/Reviews");

const addReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const review = await Reviews.findByIdAndUpdate(reviewId, {
      comment,
      isReviewGiven: true,
    });

    if (!review) {
      throw new Error("Something went wrong, please try again.");
    }

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Reviews.findByIdAndDelete(reviewId);

    res.json(review);
  } catch (error) {
    res.json({ error: error.json });
  }
};

const getReviewsDriver = async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await Reviews.find({ for: userId, isReviewGiven: true })
        .populate({
          path: 'from',
          select: 'username school',
        })
        .select('comment');
  
      res.json({ success: true, reviews });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  };
  

const getReviewsUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Reviews.find({ from: userId, isReviewGiven: false })
      .populate("for", "username image")
      .lean();

    if (!reviews) {
      throw new Error(
        "There was some problem loading reviews, please try again."
      );
    }

    const populatedReviews = reviews.map((review) => {
      return {
        comment: review.comment,
        departure: review.departure,
        destination: review.destination,
        driverName: review.for.username,
        image: review.for.image,
        reviewId: review._id,
      };
    });

    res.json({ success: true, reviews: populatedReviews });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

module.exports = {
  addReview,
  deleteReview,
  getReviewsDriver,
  getReviewsUser,
};
