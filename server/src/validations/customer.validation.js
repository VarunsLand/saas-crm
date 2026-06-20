const { z } = require('zod');

const createCustomer = z.object({
  body: z.object({
    first_name: z.string({ required_error: 'First name is required' }).max(100),
    last_name: z.string().max(100).optional().nullable().or(z.literal('')),
    company: z.string().max(255).optional().nullable().or(z.literal('')),
    email: z.string().email().max(255).optional().nullable().or(z.literal('')),
    phone_number: z.string({ required_error: 'Phone number is required' }).max(50),
    total_revenue: z.number().min(0).optional(),
    assigned_to: z.string().uuid().optional().nullable()
  })
});

const getCustomer = z.object({
  params: z.object({ id: z.string().uuid() })
});

const updateCustomer = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional().nullable().or(z.literal('')),
    company: z.string().max(255).optional().nullable().or(z.literal('')),
    email: z.string().email().max(255).optional().nullable().or(z.literal('')),
    phone_number: z.string().max(50).optional(),
    total_revenue: z.number().min(0).optional(),
    assigned_to: z.string().uuid().optional().nullable()
  }).strict()
});

const deleteCustomer = z.object({
  params: z.object({ id: z.string().uuid() })
});

module.exports = { createCustomer, getCustomer, updateCustomer, deleteCustomer };
