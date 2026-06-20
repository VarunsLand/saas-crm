const prisma = require('../config/db');

class SearchService {
  static async globalSearch(tenantId, query) {
    if (!query || query.length < 2) {
      return { leads: [], customers: [], tasks: [], notes: [] };
    }

    const searchQuery = `%${query}%`;

    // We use Prisma raw queries or highly targeted OR queries for text search
    // Using simple OR clauses for now to remain database agnostic (works on Postgres out of box)

    const [leads, customers, tasks, notes] = await Promise.all([
      // Search Leads
      prisma.lead.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { first_name: { contains: query, mode: 'insensitive' } },
            { last_name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone_number: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: { id: true, first_name: true, last_name: true, email: true, status: true },
        take: 5
      }),

      // Search Customers
      prisma.customer.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { first_name: { contains: query, mode: 'insensitive' } },
            { last_name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: { id: true, first_name: true, last_name: true, email: true, company: true },
        take: 5
      }),

      // Search Tasks
      prisma.followUpTask.findMany({
        where: {
          tenant_id: tenantId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: { id: true, title: true, status: true, due_date: true },
        take: 5
      }),

      // Search Notes (Interactions of type NOTE)
      prisma.interaction.findMany({
        where: {
          tenant_id: tenantId,
          type: 'NOTE',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: { id: true, title: true, notes: true, lead_id: true, customer_id: true },
        take: 5
      })
    ]);

    return { leads, customers, tasks, notes };
  }
}

module.exports = SearchService;
