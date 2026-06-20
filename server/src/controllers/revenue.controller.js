const catchAsync = require('../utils/catchAsync');
const prisma = require('../config/db');

const getAll = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const entries = await prisma.revenueEntry.findMany({
    where: { tenant_id: tenantId },
    include: { customer: { select: { id: true, first_name: true, last_name: true, company: true } } },
    orderBy: { date: 'desc' }
  });
  res.status(200).json({ status: 'success', data: { entries } });
});

const create = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { customer_id, amount, description, date } = req.body;
  const entry = await prisma.revenueEntry.create({
    data: {
      tenant_id: tenantId,
      customer_id: customer_id || null,
      amount: parseFloat(amount),
      description,
      date: new Date(date)
    }
  });
  
  if (customer_id) {
    const total = await prisma.revenueEntry.aggregate({
      where: { customer_id },
      _sum: { amount: true }
    });
    await prisma.customer.update({
      where: { id: customer_id },
      data: { total_revenue: total._sum.amount || 0 }
    });
  }

  res.status(201).json({ status: 'success', data: { entry } });
});

const update = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { customer_id, amount, description, date } = req.body;

  const entry = await prisma.revenueEntry.updateMany({
    where: { id, tenant_id: tenantId },
    data: {
      customer_id: customer_id || null,
      amount: parseFloat(amount),
      description,
      date: new Date(date)
    }
  });

  res.status(200).json({ status: 'success', data: { entry } });
});

const remove = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  await prisma.revenueEntry.deleteMany({
    where: { id, tenant_id: tenantId }
  });
  res.status(204).json({ status: 'success', data: null });
});

module.exports = { getAll, create, update, remove };
