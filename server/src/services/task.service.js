const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

class TaskService {
  /**
   * Fetch active tasks for a tenant, supporting timeline filters.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} filterType - 'TODAY', 'OVERDUE', or 'UPCOMING'
   * @param {string} [userId] - Optional: Filter tasks assigned to a specific user
   * @param {string} [leadId] - Optional: Filter tasks for a specific lead
   */
  static async getTasks(tenantId, filterType, userId = null, leadId = null) {
    const now = new Date();
    
    // We create midnight boundaries to accurately split TODAY, OVERDUE, and UPCOMING.
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    let dateFilter = {};
    if (filterType === 'TODAY') {
      dateFilter = { due_date: { gte: startOfToday, lt: endOfToday } };
    } else if (filterType === 'OVERDUE') {
      dateFilter = { due_date: { lt: startOfToday } };
    } else if (filterType === 'UPCOMING') {
      dateFilter = { due_date: { gte: endOfToday } };
    }

    const whereClause = {
      tenant_id: tenantId,
      lead: { deleted_at: null }, // Soft-delete aware: exclude tasks for deleted leads
    };

    if (filterType !== 'ALL') {
      whereClause.status = 'PENDING';
      Object.assign(whereClause, dateFilter);
    }

    if (userId) {
      whereClause.assigned_to = userId;
    }
    
    if (leadId) {
      whereClause.lead_id = leadId;
    }
    
    // We should also support querying by customerId, but it isn't strictly requested by GET tasks filters yet.
    // If needed, we'll add it later.

    return prisma.followUpTask.findMany({
      where: whereClause,
      orderBy: { due_date: 'asc' },
      include: {
        lead: {
          select: { id: true, first_name: true, last_name: true, status: true, phone_number: true }
        },
        customer: {
          select: { id: true, first_name: true, last_name: true, company: true }
        },
        assignee: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  }

  /**
   * Create a new task strictly bounded to the tenant context.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} leadId - The UUID of the lead
   * @param {Object} data - Validated payload containing due_date and assigned_to
   */
  static async createTask(tenantId, data) {
    const { due_date, assigned_to, title, description, priority, lead_id, customer_id } = data;

    if (lead_id) {
      const lead = await prisma.lead.findFirst({ where: { id: lead_id, tenant_id: tenantId, deleted_at: null }});
      if (!lead) throw new ApiError(404, 'Lead not found or access denied');
    } else if (customer_id) {
      const customer = await prisma.customer.findFirst({ where: { id: customer_id, tenant_id: tenantId, deleted_at: null }});
      if (!customer) throw new ApiError(404, 'Customer not found or access denied');
    } else {
      throw new ApiError(400, 'Task must belong to a lead or customer');
    }

    // 2. Strict boundary check: Verify the assigned user exists in the *same* tenant
    const assignee = await prisma.user.findFirst({
      where: { id: assigned_to, tenant_id: tenantId, deleted_at: null }
    });

    if (!assignee) {
      throw new ApiError(404, 'Assigned user not found or does not belong to this workspace');
    }

    return prisma.followUpTask.create({
      data: {
        tenant_id: tenantId,
        lead_id: lead_id || null,
        customer_id: customer_id || null,
        title,
        description,
        priority: priority || 'MEDIUM',
        assigned_to,
        due_date: new Date(due_date),
        status: 'PENDING'
      },
      include: {
        assignee: { select: { id: true, first_name: true, last_name: true } }
      }
    });
  }

  /**
   * Update task status or due date.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} taskId - The UUID of the task
   * @param {Object} data - Validated payload containing status and/or due_date
   */
  static async updateTask(tenantId, taskId, data) {
    // 1. Verify existence and tenant ownership
    const task = await prisma.followUpTask.findFirst({
      where: { id: taskId, tenant_id: tenantId }
    });

    if (!task) {
      throw new ApiError(404, 'Task not found or access denied');
    }

    // 2. Construct update payload
    const updateData = { ...data };
    
    // Coerce ISO string to JS Date for Prisma if rescheduling
    if (updateData.due_date) {
      updateData.due_date = new Date(updateData.due_date);
    }

    // Handle timestamps seamlessly for status transitions
    if (updateData.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      updateData.completed_at = new Date();
    } else if (updateData.status && updateData.status !== 'COMPLETED') {
      updateData.completed_at = null;
    }

    // 3. Perform update securely using PK
    return prisma.followUpTask.update({
      where: { id: taskId },
      data: updateData
    });
  }
}

module.exports = TaskService;
