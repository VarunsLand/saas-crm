const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

class InteractionService {
  /**
   * Fetch all interactions for a specific lead, verifying tenant ownership.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} leadId - The UUID of the lead
   */
  static async getInteractions(tenantId, { leadId, customerId }) {
    const whereClause = { tenant_id: tenantId };
    
    if (leadId) {
      whereClause.lead_id = leadId;
      const lead = await prisma.lead.findFirst({ where: { id: leadId, tenant_id: tenantId, deleted_at: null }});
      if (!lead) throw new ApiError(404, 'Lead not found');
    } else if (customerId) {
      whereClause.customer_id = customerId;
      const customer = await prisma.customer.findFirst({ where: { id: customerId, tenant_id: tenantId, deleted_at: null }});
      if (!customer) throw new ApiError(404, 'Customer not found');
    } else {
      throw new ApiError(400, 'Must provide leadId or customerId');
    }

    return prisma.interaction.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  }

  /**
   * Create a new interaction for a lead.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} userId - The UUID of the user authoring the note
   * @param {string} leadId - The UUID of the lead
   * @param {Object} data - The validated interaction payload (e.g., type, notes)
   */
  static async createInteraction(tenantId, userId, { leadId, customerId }, data) {
    if (leadId) {
      const lead = await prisma.lead.findFirst({ where: { id: leadId, tenant_id: tenantId, deleted_at: null }});
      if (!lead) throw new ApiError(404, 'Lead not found');
    } else if (customerId) {
      const customer = await prisma.customer.findFirst({ where: { id: customerId, tenant_id: tenantId, deleted_at: null }});
      if (!customer) throw new ApiError(404, 'Customer not found');
    } else {
      throw new ApiError(400, 'Must provide leadId or customerId');
    }

    return prisma.interaction.create({
      data: {
        ...data,
        tenant_id: tenantId,
        lead_id: leadId || null,
        customer_id: customerId || null,
        user_id: userId
      },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  }
}

module.exports = InteractionService;
