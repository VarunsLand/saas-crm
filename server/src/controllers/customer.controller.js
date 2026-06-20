const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/db');

const getAllCustomers = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const customers = await prisma.customer.findMany({
    where: { tenant_id: tenantId, deleted_at: null },
    include: {
      assignee: {
        select: {
          id: true,
          first_name: true,
          last_name: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  res.status(200).json({
    status: 'success',
    results: customers.length,
    data: {
      customers
    }
  });
});

const getCustomer = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const customer = await prisma.customer.findFirst({
    where: { id, tenant_id: tenantId, deleted_at: null },
    include: {
      assignee: {
        select: {
          id: true,
          first_name: true,
          last_name: true
        }
      },
      revenue_entries: {
        orderBy: { date: 'desc' }
      },
      interactions: {
        orderBy: { created_at: 'desc' },
        include: { user: { select: { first_name: true, last_name: true } } }
      },
      tasks: {
        orderBy: { due_date: 'asc' },
        include: { assignee: { select: { first_name: true, last_name: true } } }
      }
    }
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  // Fetch the source lead if this customer was converted from one
  const sourceLead = await prisma.lead.findFirst({
    where: { converted_to_customer_id: id, tenant_id: tenantId },
    include: {
      interactions: {
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { first_name: true, last_name: true } }
        }
      },
      follow_up_tasks: {
        orderBy: { due_date: 'asc' },
        include: {
          assignee: { select: { first_name: true, last_name: true } }
        }
      },
      source: true
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      customer,
      sourceLead
    }
  });
});

const createCustomer = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const customer = await prisma.customer.create({
    data: {
      ...req.body,
      tenant_id: tenantId
    }
  });

  res.status(201).json({
    status: 'success',
    data: {
      customer
    }
  });
});

const updateCustomer = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const existingCustomer = await prisma.customer.findFirst({
    where: { id, tenant_id: tenantId, deleted_at: null }
  });

  if (!existingCustomer) {
    throw new ApiError(404, 'Customer not found');
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: req.body
  });

  res.status(200).json({
    status: 'success',
    data: {
      customer
    }
  });
});

const deleteCustomer = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const existingCustomer = await prisma.customer.findFirst({
    where: { id, tenant_id: tenantId, deleted_at: null }
  });

  if (!existingCustomer) {
    throw new ApiError(404, 'Customer not found');
  }

  // Soft delete
  await prisma.customer.update({
    where: { id },
    data: { deleted_at: new Date() }
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
