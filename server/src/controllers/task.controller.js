const TaskService = require('../services/task.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get dashboard tasks for the tenant, filterable by timeline (TODAY, UPCOMING, etc.)
 * @route   GET /api/v1/tasks
 * @access  Private
 */
const getTasks = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  // E.g., ?filter=TODAY or ?filter=OVERDUE. Defaults to TODAY.
  const filterType = req.query.filter || 'TODAY';
  
  // Optionally support filtering by a specific assignee, 
  // or use `?mine=true` to easily scope to the current user.
  let targetUserId = req.query.user_id;
  if (req.query.mine === 'true') {
    targetUserId = req.user.user_id;
  }

  const leadId = req.query.lead_id;

  const tasks = await TaskService.getTasks(tenantId, filterType, targetUserId, leadId);

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: { tasks }
  });
});

/**
 * @desc    Create a new follow-up task attached to a specific lead
 * @route   POST /api/v1/leads/:leadId/tasks
 * @access  Private
 */
const createTask = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const task = await TaskService.createTask(tenantId, req.body);

  res.status(201).json({
    status: 'success',
    data: { task }
  });
});

/**
 * @desc    Update a task (status transition or rescheduling)
 * @route   PATCH /api/v1/tasks/:id
 * @access  Private
 */
const updateTask = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  // Support :id standard routing param
  const taskId = req.params.id; 

  const task = await TaskService.updateTask(tenantId, taskId, req.body);

  res.status(200).json({
    status: 'success',
    data: { task }
  });
});

module.exports = {
  getTasks,
  createTask,
  updateTask
};
