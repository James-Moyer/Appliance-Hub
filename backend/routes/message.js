const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');

router.post('/', MessageController.sendMessage);
router.get('/', MessageController.getMessages);

module.exports = router;
