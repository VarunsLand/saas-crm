const express = require('express');
const interactionController = require('../controllers/interaction.controller');
const { createInteractionSchema } = require('../validations/interaction.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all interaction routes
router.use(requireAuth);

/**
 * @route   GET /api/v1/notes
 */
router.get(
  '/',
  interactionController.getInteractions
);

/**
 * @route   POST /api/v1/notes
 */
router.post(
  '/',
  validate(createInteractionSchema),
  interactionController.createInteraction
);

module.exports = router;
