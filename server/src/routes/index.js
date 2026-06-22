const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const leadRoutes = require('./lead.routes');
const taskRoutes = require('./task.routes');
const interactionRoutes = require('./interaction.routes');
const customerRoutes = require('./customer.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingsRoutes = require('./settings.routes');

const router = express.Router();

// Mount all module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/notes', interactionRoutes);
router.use('/customers', customerRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/financial', require('./financial.routes'));
router.use('/revenue', require('./revenue.routes'));
router.use('/expenses', require('./expense.routes'));
router.use('/invoices', require('./invoice.routes'));
router.use('/search', require('./search.routes'));

module.exports = router;
