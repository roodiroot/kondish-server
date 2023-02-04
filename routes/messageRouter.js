const Router = require('express');
const messageController = require('../controllers/messageController');

const router = new Router();

router.post('/', messageController.sendMessage);

module.exports = router;
