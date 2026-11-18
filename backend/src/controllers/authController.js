const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendNotification = require('../utils/sendNotification');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone: phone || null,
      role: 'user',
      status: 'pending',
    });

    // Notify admin(s) about new registration
    const io = req.app.get('io');
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await sendNotification(io, {
        recipient: admin._id,
        type: 'registration_submitted',
        title: 'New Registration',
        message: `${fullName} has registered and is awaiting approval.`,
        relatedId: user._id.toString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin approval.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    // Update last seen
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Check approval status (for pending page polling)
// @route   GET /api/auth/status
// @access  Private
const checkStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('status rejectionReason fullName email');
    res.json({ success: true, status: user.status, rejectionReason: user.rejectionReason, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, checkStatus };
