const express = require('express');
const router = express.Router();
const { register, login, getMe, checkStatus } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.post(
  '/register',
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);
router.get('/status', protect, checkStatus);

module.exports = router;
