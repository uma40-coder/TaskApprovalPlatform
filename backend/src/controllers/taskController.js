const Task = require('../models/Task');
const User = require('../models/User');
const sendNotification = require('../utils/sendNotification');

// @desc    Create task
// @route   POST /api/tasks
// @access  Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, deadline } = req.body;

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || assignedUser.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'User not found or not approved' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'medium',
      deadline,
      status: 'pending',
    });

    await task.populate('assignedTo', 'fullName email');
    await task.populate('createdBy', 'fullName');

    const io = req.app.get('io');
    await sendNotification(io, {
      recipient: assignedTo,
      type: 'task_assigned',
      title: 'New Task Assigned 📋',
      message: `You have been assigned a new task: "${title}"`,
      relatedId: task._id.toString(),
    });

    io.to(assignedTo.toString()).emit('task_update', { type: 'new', task });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (admin) or own tasks (user)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      query.assignedTo = req.user._id;
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'fullName email avatar')
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(query),
    ]);

    res.json({ success: true, tasks, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Users can only view their own tasks
    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Admin (all fields) / User (status only)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role === 'admin') {
      const { title, description, assignedTo, priority, deadline, status } = req.body;
      if (title) task.title = title;
      if (description) task.description = description;
      if (assignedTo) task.assignedTo = assignedTo;
      if (priority) task.priority = priority;
      if (deadline) task.deadline = deadline;
      if (status) {
        task.status = status;
        if (status === 'completed') task.completedAt = Date.now();
      }
    } else {
      // User can only update status
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const { status } = req.body;
      if (status && ['pending', 'in_progress', 'completed'].includes(status)) {
        task.status = status;
        if (status === 'completed') task.completedAt = Date.now();
      }
    }

    await task.save();
    await task.populate('assignedTo', 'fullName email avatar');
    await task.populate('createdBy', 'fullName');

    const io = req.app.get('io');
    io.to(task.assignedTo._id.toString()).emit('task_update', { type: 'updated', task });

    if (req.user.role === 'admin') {
      await sendNotification(io, {
        recipient: task.assignedTo._id,
        type: 'task_updated',
        title: 'Task Updated',
        message: `Task "${task.title}" has been updated.`,
        relatedId: task._id.toString(),
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task stats per user (admin)
// @route   GET /api/tasks/stats
// @access  Admin
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskStats };
