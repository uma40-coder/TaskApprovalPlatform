const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const sendNotification = require('../utils/sendNotification');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = { role: 'user' };

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (admin)
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve user
// @route   PUT /api/users/:id/approve
// @access  Admin
const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot modify admin' });

    user.status = 'approved';
    user.rejectionReason = null;
    await user.save({ validateBeforeSave: false });

    const io = req.app.get('io');
    await sendNotification(io, {
      recipient: user._id,
      type: 'account_approved',
      title: 'Account Approved! 🎉',
      message: 'Your account has been approved. You can now access the dashboard.',
    });

    // Emit status change event directly to user
    io.to(user._id.toString()).emit('status_change', { status: 'approved' });

    res.json({ success: true, message: 'User approved successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject user
// @route   PUT /api/users/:id/reject
// @access  Admin
const rejectUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot modify admin' });

    user.status = 'rejected';
    user.rejectionReason = reason || 'Your registration was not approved.';
    await user.save({ validateBeforeSave: false });

    const io = req.app.get('io');
    await sendNotification(io, {
      recipient: user._id,
      type: 'account_rejected',
      title: 'Account Rejected',
      message: user.rejectionReason,
    });

    io.to(user._id.toString()).emit('status_change', { status: 'rejected', reason: user.rejectionReason });

    res.json({ success: true, message: 'User rejected', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats (admin)
// @route   GET /api/users/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [total, pending, approved, rejected, totalTasks, pendingTasks, completedTasks] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', status: 'pending' }),
      User.countDocuments({ role: 'user', status: 'approved' }),
      User.countDocuments({ role: 'user', status: 'rejected' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'completed' }),
    ]);

    res.json({ success: true, stats: { total, pending, approved, rejected, totalTasks, pendingTasks, completedTasks } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile (self)
// @route   GET /api/users/profile
// @access  Private (approved)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res, next) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { isRead: true }
      );
    }
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  approveUser,
  rejectUser,
  getDashboardStats,
  getProfile,
  getNotifications,
  markNotificationRead,
};
