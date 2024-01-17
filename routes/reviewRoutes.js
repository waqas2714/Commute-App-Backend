const { addReview, deleteReview, getReviews } = require('../controllers/reviewController');


const router = require('express').Router();

router.post('/addReview', addReview);
router.get('/getReviews/:userId', getReviews);
router.delete('/deleteReview/:reviewId', deleteReview);



module.exports = router;
