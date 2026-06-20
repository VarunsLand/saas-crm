const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

class LeadService {
  /**
   * Fetch all active leads for a specific tenant.
   * @param {string} tenantId - The UUID of the tenant
   * @param {Object} filters - Optional filters (e.g., status, assigned_to)
   */
  static async getLeads(tenantId, filters = {}) {
    // Whitelist safe filterable fields to prevent tenant_id/deleted_at injection
    const safeFilters = {};
    if (filters.status) safeFilters.status = filters.status;
    if (filters.assigned_to) safeFilters.assigned_to = filters.assigned_to;
    if (filters.source_id) safeFilters.source_id = filters.source_id;

    // Ensure strict multi-tenant and soft-delete boundaries
    const whereClause = {
      tenant_id: tenantId,
      deleted_at: null,
      ...safeFilters
    };

    return prisma.lead.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        assignee: {
          select: { id: true, first_name: true, last_name: true }
        },
        source: {
          select: { id: true, name: true }
        }
      }
    });
  }

  /**
   * Fetch a single lead by ID, ensuring it belongs to the requesting tenant.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} leadId - The UUID of the lead
   */
  static async getLeadById(tenantId, leadId) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        tenant_id: tenantId, // Strict boundary
        deleted_at: null
      },
      include: {
        assignee: {
          select: { id: true, first_name: true, last_name: true, email: true }
        },
        source: true,
        interactions: {
          orderBy: { created_at: 'desc' },
          take: 10
        },
        tasks: {
          where: { status: 'PENDING' },
          orderBy: { due_date: 'asc' }
        }
      }
    });

    if (!lead) {
      throw new ApiError(404, 'Lead not found or access denied');
    }

    return lead;
  }

  /**
   * Create a new lead safely scoped to a tenant.
   * @param {string} tenantId - The UUID of the tenant
   * @param {Object} data - The validated lead payload
   */
  static async createLead(tenantId, data) {
    return prisma.lead.create({
      data: {
        ...data,
        tenant_id: tenantId // Forcefully inject tenant_id to prevent injection attacks
      }
    });
  }

  /**
   * Update an existing lead, strictly verifying tenant ownership first.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} leadId - The UUID of the lead
   * @param {Object} data - The validated update payload
   */
  static async updateLead(tenantId, leadId, data) {
    // 1. Verify existence and tenant ownership
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        tenant_id: tenantId,
        deleted_at: null
      }
    });

    if (!existingLead) {
      throw new ApiError(404, 'Lead not found or access denied');
    }

    // 2. Perform the update securely using the verified PK
    return prisma.lead.update({
      where: { id: leadId },
      data
    });
  }

  /**
   * Bulk import leads, skipping duplicates by phone number.
   * @param {string} tenantId - The UUID of the tenant
   * @param {Array} leadsData - Array of validated lead payloads
   */
  static async importLeads(tenantId, leadsData) {
    let importedCount = 0;
    let skippedCount = 0;

    const existingPhones = await prisma.lead.findMany({
      where: {
        tenant_id: tenantId,
        phone_number: { in: leadsData.map(l => l.phone_number) },
        deleted_at: null
      },
      select: { phone_number: true }
    }).then(leads => new Set(leads.map(l => l.phone_number)));

    const leadsToInsert = [];

    for (const lead of leadsData) {
      if (existingPhones.has(lead.phone_number)) {
        skippedCount++;
      } else {
        leadsToInsert.push({
          ...lead,
          tenant_id: tenantId
        });
        // Prevent duplicates within the CSV itself
        existingPhones.add(lead.phone_number);
        importedCount++;
      }
    }

    if (leadsToInsert.length > 0) {
      await prisma.lead.createMany({
        data: leadsToInsert,
        skipDuplicates: true
      });
    }

    return { importedCount, skippedCount };
  }

  /**
   * Soft delete a lead.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} leadId - The UUID of the lead
   */
  static async deleteLead(tenantId, leadId) {
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        tenant_id: tenantId,
        deleted_at: null
      }
    });

    if (!existingLead) {
      throw new ApiError(404, 'Lead not found or access denied');
    }

    return prisma.lead.update({
      where: { id: leadId },
      data: { deleted_at: new Date() }
    });
  }

  /**
   * Update lead stage for drag-and-drop pipeline.
   */
  static async updateLeadStage(tenantId, leadId, newStage, userId) {
    const existingLead = await prisma.lead.findFirst({
      where: { id: leadId, tenant_id: tenantId, deleted_at: null }
    });

    if (!existingLead) {
      throw new ApiError(404, 'Lead not found or access denied');
    }

    return prisma.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: { status: newStage }
      });

      if (existingLead.status !== newStage) {
        await tx.interaction.create({
          data: {
            tenant_id: tenantId,
            lead_id: leadId,
            user_id: userId,
            type: 'NOTE',
            notes: `Moved stage from ${existingLead.status} to ${newStage}`,
          }
        });
      }

      return updatedLead;
    });
  }

  /**
   * Convert WON lead into Customer.
   */
  static async convertToCustomer(tenantId, leadId, userId) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenant_id: tenantId, deleted_at: null }
    });

    if (!lead) {
      throw new ApiError(404, 'Lead not found or access denied');
    }

    if (lead.status !== 'WON') {
      throw new ApiError(400, 'Only WON leads can be converted to Customers');
    }

    if (lead.converted_to_customer_id) {
      throw new ApiError(400, 'Lead has already been converted to a Customer');
    }

    // Use a transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // Create the Customer
      const customer = await tx.customer.create({
        data: {
          tenant_id: tenantId,
          first_name: lead.first_name,
          last_name: lead.last_name || null,
          email: lead.email,
          phone_number: lead.phone_number
        }
      });

      // Update the Lead lineage
      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: { converted_to_customer_id: customer.id }
      });

      return customer;
    });
  }
}

module.exports = LeadService;
