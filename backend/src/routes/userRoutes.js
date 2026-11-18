const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  approveUser,
  rejectUser,
  getDashboardStats,
  getProfile,
  getNotifications,
  markNotificationRead,
} = require('../controllers/userController');
const { protect, adminOnly, approvedOnly } = require('../middleware/authMiddleware');

// Admin routes
router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id/approve', protect, adminOnly, approveUser);
router.put('/:id/reject', protect, adminOnly, rejectUser);

// User routes
router.get('/profile/me', protect, getProfile);
router.get('/notifications/all', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
