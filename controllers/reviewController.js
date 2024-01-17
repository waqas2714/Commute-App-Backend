const Reviews = require("../models/Reviews")

const addReview = async (req, res)=>{
    try {

        const review = await Reviews.create(
            req.body
        )

        res.json(review)
    } catch (error) {
        res.json({error : error.json})
    }
}


const deleteReview = async (req, res)=>{
    try {
        const {reviewId} = req.params;

        const review = await Reviews.findByIdAndDelete(reviewId);

        res.json(review)
    } catch (error) {
        res.json({error : error.json})
    }
}

const getReviews = async (req, res)=>{
    try {
        const {userId} = req.params;
        const reviews = await Reviews.find({for : userId});

        res.json(reviews);
    } catch (error) {
        res.json({error : error.json})
    }
}

module.exports = {
    addReview,
    deleteReview,
    getReviews
}