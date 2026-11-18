const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');
const { protect, adminOnly, approvedOnly } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.get('/stats', protect, adminOnly, getTaskStats);

router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('assignedTo').notEmpty().withMessage('Assigned user is required'),
    body('deadline').isISO8601().withMessage('Valid deadline is required'),
  ],
  validate,
  createTask
);

router.get('/', protect, approvedOnly, getTasks);
router.get('/:id', protect, approvedOnly, getTaskById);
router.put('/:id', protect, approvedOnly, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
