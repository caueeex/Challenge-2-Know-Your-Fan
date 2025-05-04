const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../config/auth');

router.use(verifyToken);

router.get('/history', chatController.getChatHistory);

module.exports = router;