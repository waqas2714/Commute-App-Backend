const { addChat, removeChat, getAllChats, getChat } = require('../controllers/chatController');

const router = require('express').Router();

router.post('/addChat/:listingId/:userId', addChat);
router.get('/getAllChats/:userId', getAllChats);
router.get('/getChat/:listingId', getChat);
router.delete('/:chatId', removeChat);



module.exports = router;
