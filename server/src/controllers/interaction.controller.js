const InteractionService = require('../services/interaction.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Fetch all interactions/history for a specific lead
 * @route   GET /api/v1/leads/:leadId/interactions
 * @access  Private
 */
const getInteractions = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { leadId, customerId } = req.query; 

  const interactions = await InteractionService.getInteractions(tenantId, { leadId, customerId });

  res.status(200).json({
    status: 'success',
    results: interactions.length,
    data: { interactions }
  });
});

/**
 * @desc    Create a new interaction note/log for a lead
 * @route   POST /api/v1/leads/:leadId/interactions
 * @access  Private
 */
const createInteraction = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const userId = req.user.user_id;
  const { leadId, customerId, ...data } = req.body;

  const interaction = await InteractionService.createInteraction(
    tenantId, 
    userId, 
    { leadId, customerId }, 
    data
  );

  res.status(201).json({
    status: 'success',
    data: { interaction }
  });
});

module.exports = {
  getInteractions,
  createInteraction
};
