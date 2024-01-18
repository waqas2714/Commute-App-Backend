const { addChat, removeChat, getChat } = require('../controllers/chatController');

const router = require('express').Router();

router.post('/', addChat);
router.get('/:from/:to', getChat);
router.delete('/:chatId', removeChat);



module.exports = router;
