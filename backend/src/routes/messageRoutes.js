const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations, getUnreadCount } = require('../controllers/messageController');
const { protect, approvedOnly, adminOnly } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.get('/conversations', protect, adminOnly, getConversations);
router.get('/unread-count', protect, getUnreadCount);

router.post(
  '/',
  protect,
  [
    body('content').trim().isLength({ min: 1 }).withMessage('Message cannot be empty'),
  ],
  validate,
  sendMessage
);

router.get('/:conversationId', protect, getMessages);

module.exports = router;
