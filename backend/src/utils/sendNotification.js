const Notification = require('../models/Notification');

/**
 * Create a notification and emit via Socket.IO
 */
const sendNotification = async (io, { recipient, type, title, message, relatedId = null }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedId,
    });

    // Emit real-time notification to the recipient's room
    if (io) {
      io.to(recipient.toString()).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = sendNotification;
