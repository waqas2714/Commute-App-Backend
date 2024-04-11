const { addReview, deleteReview, getReviewsDriver, getReviewsUser } = require('../controllers/reviewController');


const router = require('express').Router();

router.post('/addReview/:reviewId', addReview);
router.get('/getReviewsDriver/:userId', getReviewsDriver);
router.get('/getReviewsUser/:userId', getReviewsUser);
router.delete('/deleteReview/:reviewId', deleteReview);



module.exports = router;
