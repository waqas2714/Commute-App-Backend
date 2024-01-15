const { signup, verifyAccount, login } = require('../controllers/authController');
const verifyUser = require('../middlewares/verifyUser');

const router = require('express').Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verifyAccount/:token', verifyAccount);


module.exports = router;
