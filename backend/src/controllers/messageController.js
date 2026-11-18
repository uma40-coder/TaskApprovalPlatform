const Message = require('../models/Message');
const User = require('../models/User');
const sendNotification = require('../utils/sendNotification');

// Determine conversationId (always the non-admin user's ID)
const getConversationId = (user1, user2) => {
  // Return the userId of the non-admin participant
  if (user1.role === 'user') return user1._id.toString();
  if (user2.role === 'user') return user2._id.toString();
  return user1._id.toString();
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private (approved users & admin)
const sendMessage = async (req, res, next) => {
  try {
    let { receiverId, content } = req.body;
    const sender = req.user;

    // If sender is a regular user and receiverId is not provided, automatically route to the platform admin
    if (sender.role === 'user' && !receiverId) {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        receiverId = admin._id;
      }
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found' });

    // Ensure conversation is always between admin and a user
    const isValidConversation =
      (sender.role === 'admin' && receiver.role === 'user') ||
      (sender.role === 'user' && receiver.role === 'admin');

    if (!isValidConversation) {
      return res.status(403).json({ success: false, message: 'Invalid conversation' });
    }

    const conversationId = getConversationId(sender, receiver);

    const message = await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      conversationId,
      content,
    });

    await message.populate('sender', 'fullName avatar role');
    await message.populate('receiver', 'fullName avatar role');

    const io = req.app.get('io');

    // Emit to both participants
    io.to(conversationId).emit('new_message', message);
    io.to(receiver._id.toString()).emit('new_message', message);

    // Send notification to receiver
    await sendNotification(io, {
      recipient: receiver._id,
      type: 'new_message',
      title: 'New Message 💬',
      message: `${sender.fullName}: ${content.substring(0, 60)}${content.length > 60 ? '...' : ''}`,
      relatedId: conversationId,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const user = req.user;

    // Security: users can only access their own conversation
    if (user.role !== 'admin' && user._id.toString() !== conversationId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'fullName avatar role')
      .populate('receiver', 'fullName avatar role')
      .sort({ createdAt: 1 });

    // Mark messages as read for receiver
    await Message.updateMany(
      { conversationId, receiver: user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations (admin only)
// @route   GET /api/messages/conversations
// @access  Admin
const getConversations = async (req, res, next) => {
  try {
    // Get all unique conversationIds with the latest message
    const conversations = await Message.aggregate([
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$content' },
          lastMessageAt: { $last: '$createdAt' },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $ne: ['$sender', req.user._id] }] }, 1, 0] },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    // Enrich with user info
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select('fullName email avatar status');
        return { ...conv, user };
      })
    );

    res.json({ success: true, conversations: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, getConversations, getUnreadCount };
