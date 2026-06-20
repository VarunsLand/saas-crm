const express = require('express');
const taskController = require('../controllers/task.controller');
const { updateTaskSchema, createTaskSchema } = require('../validations/task.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(requireAuth);

/**
 * @route   GET /api/v1/tasks
 * @desc    Fetch global tasks for the tenant dashboard
 * @access  Private
 */
router.get(
  '/',
  taskController.getTasks
);

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  validate(createTaskSchema),
  taskController.createTask
);

/**
 * @route   PATCH /api/v1/tasks/:id
 * @desc    Update an existing task (e.g., mark COMPLETED, or reschedule)
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateTaskSchema),
  taskController.updateTask
);

module.exports = router;
