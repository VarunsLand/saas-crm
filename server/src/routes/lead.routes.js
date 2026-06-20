const express = require('express');
const leadController = require('../controllers/lead.controller');
const { createLeadSchema, updateLeadSchema, importLeadsSchema } = require('../validations/lead.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

// Apply authentication strictly to all routes within this module
router.use(requireAuth);

/**
 * @route   GET /api/v1/leads
 * @desc    Fetch all active leads for the current tenant
 * @access  Private
 */
router.get('/', leadController.getLeads);

/**
 * @route   POST /api/v1/leads/import
 * @desc    Bulk import leads
 * @access  Private
 */
router.post(
  '/import',
  validate(importLeadsSchema),
  leadController.importLeads
);

/**
 * @route   GET /api/v1/leads/:id
 * @desc    Fetch a single lead by its UUID
 * @access  Private
 */
router.get('/:id', leadController.getLeadById);

/**
 * @route   POST /api/v1/leads
 * @desc    Create a new lead
 * @access  Private
 */
router.post(
  '/',
  validate(createLeadSchema),
  leadController.createLead
);

/**
 * @route   PATCH /api/v1/leads/:id
 * @desc    Update an existing lead
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateLeadSchema),
  leadController.updateLead
);

/**
 * @route   PATCH /api/v1/leads/:id/stage
 * @desc    Update lead stage via drag-and-drop
 * @access  Private
 */
router.patch(
  '/:id/stage',
  leadController.updateLeadStage
);

/**
 * @route   POST /api/v1/leads/:id/convert
 * @desc    Convert WON lead into Customer
 * @access  Private
 */
router.post(
  '/:id/convert',
  leadController.convertToCustomer
);

/**
 * @route   DELETE /api/v1/leads/:id
 * @desc    Soft delete an existing lead
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  requireAdmin,
  leadController.deleteLead
);

module.exports = router;
