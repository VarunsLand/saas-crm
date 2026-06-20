const catchAsync = require('../utils/catchAsync');
const prisma = require('../config/db');

const getAll = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const entries = await prisma.expenseEntry.findMany({
    where: { tenant_id: tenantId },
    orderBy: { date: 'desc' }
  });
  res.status(200).json({ status: 'success', data: { entries } });
});

const create = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { category, amount, description, date } = req.body;
  const entry = await prisma.expenseEntry.create({
    data: {
      tenant_id: tenantId,
      category,
      amount: parseFloat(amount),
      description,
      date: new Date(date)
    }
  });
  res.status(201).json({ status: 'success', data: { entry } });
});

const update = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { category, amount, description, date } = req.body;
  const entry = await prisma.expenseEntry.updateMany({
    where: { id, tenant_id: tenantId },
    data: {
      category,
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
  await prisma.expenseEntry.deleteMany({
    where: { id, tenant_id: tenantId }
  });
  res.status(204).json({ status: 'success', data: null });
});

module.exports = { getAll, create, update, remove };
