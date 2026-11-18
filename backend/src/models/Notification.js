const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'registration_submitted',
        'account_approved',
        'account_rejected',
        'task_assigned',
        'task_updated',
        'new_message',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedId: { type: String, default: null }, // taskId or messageId
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
