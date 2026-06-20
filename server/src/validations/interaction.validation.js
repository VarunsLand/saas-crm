const { z } = require('zod');

// Must precisely match the Prisma InteractionType enum
const InteractionTypeEnum = z.enum([
  'CALL',
  'WHATSAPP',
  'EMAIL',
  'MEETING',
  'WALK_IN',
  'NOTE',
  'STATUS_CHANGE'
], {
  errorMap: () => ({ message: 'Invalid interaction type provided' })
});

const createInteractionSchema = z.object({
  body: z.object({
    type: InteractionTypeEnum,
    title: z.string().max(255).optional().nullable(),
    notes: z.string()
      .max(5000, 'Notes cannot exceed 5000 characters')
      .optional()
      .nullable(),
    leadId: z.string().uuid().optional().nullable(),
    customerId: z.string().uuid().optional().nullable()
  }).strict() // Disallows undocumented fields in the payload
});

module.exports = {
  createInteractionSchema
};
