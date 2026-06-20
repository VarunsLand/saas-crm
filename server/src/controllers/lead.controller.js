const LeadService = require('../services/lead.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get all active leads for the current tenant
 * @route   GET /api/v1/leads
 * @access  Private
 */
const getLeads = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  // Extracting query params allows simple, flexible filtering (e.g. ?status=NEW)
  const leads = await LeadService.getLeads(tenantId, req.query);

  res.status(200).json({
    status: 'success',
    results: leads.length,
    data: { leads }
  });
});

/**
 * @desc    Get a specific lead by its ID
 * @route   GET /api/v1/leads/:id
 * @access  Private
 */
const getLeadById = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const leadId = req.params.id;

  const lead = await LeadService.getLeadById(tenantId, leadId);

  res.status(200).json({
    status: 'success',
    data: { lead }
  });
});

/**
 * @desc    Create a new lead
 * @route   POST /api/v1/leads
 * @access  Private
 */
const createLead = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const lead = await LeadService.createLead(tenantId, req.body);

  res.status(201).json({
    status: 'success',
    data: { lead }
  });
});

/**
 * @desc    Update an existing lead
 * @route   PATCH /api/v1/leads/:id
 * @access  Private
 */
const updateLead = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const leadId = req.params.id;

  const lead = await LeadService.updateLead(tenantId, leadId, req.body);

  res.status(200).json({
    status: 'success',
    data: { lead }
  });
});

/**
 * @desc    Import bulk leads
 * @route   POST /api/v1/leads/import
 * @access  Private
 */
const importLeads = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { leads } = req.body;

  const result = await LeadService.importLeads(tenantId, leads);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * @desc    Delete (soft delete) a lead
 * @route   DELETE /api/v1/leads/:id
 * @access  Private (Admin only)
 */
const deleteLead = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const leadId = req.params.id;

  await LeadService.deleteLead(tenantId, leadId);

  res.status(200).json({
    status: 'success',
    message: 'Lead deleted successfully'
  });
});

/**
 * @desc    Update lead stage via drag-and-drop
 * @route   PATCH /api/v1/leads/:id/stage
 * @access  Private
 */
const updateLeadStage = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const leadId = req.params.id;
  const { status } = req.body;
  const userId = req.user.user_id;

  const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Invalid lead status' });
  }

  const lead = await LeadService.updateLeadStage(tenantId, leadId, status, userId);

  res.status(200).json({
    status: 'success',
    data: { lead }
  });
});

/**
 * @desc    Convert WON lead into Customer
 * @route   POST /api/v1/leads/:id/convert
 * @access  Private
 */
const convertToCustomer = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const leadId = req.params.id;
  const userId = req.user.user_id;

  const customer = await LeadService.convertToCustomer(tenantId, leadId, userId);

  res.status(201).json({
    status: 'success',
    message: 'Lead successfully converted to Customer',
    data: { customer }
  });
});

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  importLeads,
  deleteLead,
  updateLeadStage,
  convertToCustomer
};
