const prisma = require('../config/db');

const getKPIs = async (tenantId) => {
  const revenueResult = await prisma.revenueEntry.aggregate({
    where: { tenant_id: tenantId },
    _sum: { amount: true }
  });
  const totalRevenue = revenueResult._sum.amount || 0;

  const expenseResult = await prisma.expenseEntry.aggregate({
    where: { tenant_id: tenantId },
    _sum: { amount: true }
  });
  const totalExpenses = expenseResult._sum.amount || 0;

  const netProfit = totalRevenue - totalExpenses;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const currentCustomers = await prisma.customer.count({
    where: { tenant_id: tenantId, deleted_at: null }
  });

  const pastCustomers = await prisma.customer.count({
    where: { tenant_id: tenantId, deleted_at: null, created_at: { lt: thirtyDaysAgo } }
  });

  let customerGrowth = 0;
  if (pastCustomers > 0) {
    customerGrowth = ((currentCustomers - pastCustomers) / pastCustomers) * 100;
  } else if (currentCustomers > 0) {
    customerGrowth = 100;
  }

  const totalLeads = await prisma.lead.count({
    where: { tenant_id: tenantId, deleted_at: null }
  });

  const wonLeads = await prisma.lead.count({
    where: { tenant_id: tenantId, status: 'WON', deleted_at: null }
  });

  const qualifiedLeads = await prisma.lead.count({
    where: { tenant_id: tenantId, status: { in: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'] }, deleted_at: null }
  });

  const lostLeads = await prisma.lead.count({
    where: { tenant_id: tenantId, status: 'LOST', deleted_at: null }
  });

  const totalClosed = wonLeads + lostLeads;
  const conversionRate = totalClosed > 0 ? (wonLeads / totalClosed) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    activeCustomers: currentCustomers,
    customerGrowth: parseFloat(customerGrowth.toFixed(1)),
    conversionRate: parseFloat(conversionRate.toFixed(1)),
    funnel: {
      totalLeads,
      qualifiedLeads: qualifiedLeads + wonLeads, // Qualified is anyone who passed the stage + won
      wonLeads
    }
  };
};

const getLeadSourceAnalytics = async (tenantId) => {
  const sources = await prisma.leadSource.findMany({
    where: { tenant_id: tenantId },
    include: { _count: { select: { leads: true } } }
  });
  return sources.map(s => ({ name: s.name, count: s._count.leads }));
};

const getTopCustomers = async (tenantId) => {
  const groupedRevenue = await prisma.revenueEntry.groupBy({
    by: ['customer_id'],
    where: { tenant_id: tenantId, customer_id: { not: null } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5
  });

  const customerIds = groupedRevenue.map(g => g.customer_id);
  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, first_name: true, last_name: true, company: true }
  });

  return groupedRevenue.map(g => {
    const cust = customers.find(c => c.id === g.customer_id);
    return {
      id: g.customer_id,
      name: cust ? `${cust.first_name} ${cust.last_name || ''}`.trim() : 'Unknown',
      company: cust?.company || 'N/A',
      total_revenue: g._sum.amount || 0
    };
  });
};

const getFinancialTrends = async (tenantId) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const revenues = await prisma.revenueEntry.findMany({
    where: { tenant_id: tenantId, date: { gte: oneYearAgo } },
    select: { amount: true, date: true }
  });

  const expenses = await prisma.expenseEntry.findMany({
    where: { tenant_id: tenantId, date: { gte: oneYearAgo } },
    select: { amount: true, date: true }
  });

  // Group by month
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = {};

  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyData[key] = { month: monthNames[d.getMonth()], year: d.getFullYear(), sortKey: d.getTime(), revenue: 0, expense: 0 };
  }

  revenues.forEach(r => {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyData[key]) monthlyData[key].revenue += r.amount;
  });

  expenses.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyData[key]) monthlyData[key].expense += e.amount;
  });

  return Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey).map(m => ({
    month: m.month,
    revenue: m.revenue,
    expense: m.expense
  }));
};

const getCustomerGrowthTrend = async (tenantId) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trend = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    d.setDate(d.getDate() + 1); // rough approximation to end of month/current day
    
    const count = await prisma.customer.count({
      where: { tenant_id: tenantId, deleted_at: null, created_at: { lte: d } }
    });
    
    trend.push({ month: monthNames[d.getMonth()], customers: count });
  }
  return trend;
};

const getRecentRevenue = async (tenantId) => {
  const recent = await prisma.revenueEntry.findMany({
    where: { tenant_id: tenantId },
    orderBy: { date: 'desc' },
    take: 5,
    include: {
      customer: { select: { first_name: true, last_name: true, company: true } }
    }
  });

  return recent.map(r => ({
    id: r.id,
    customer: r.customer ? `${r.customer.first_name} ${r.customer.last_name || ''}`.trim() : 'Direct Sale',
    amount: r.amount,
    date: r.date
  }));
};

const getBusinessInsights = async (tenantId) => {
  // Best Lead Source
  const sources = await getLeadSourceAnalytics(tenantId);
  const bestSource = sources.sort((a, b) => b.count - a.count)[0];

  // Top Customer
  const topCusts = await getTopCustomers(tenantId);
  const bestCust = topCusts[0];

  const trends = await getFinancialTrends(tenantId);
  const currentMonth = trends.length > 0 ? trends[trends.length - 1] : { revenue: 0, expense: 0 };
  const lastMonth = trends.length > 1 ? trends[trends.length - 2] : { revenue: 0, expense: 0 };

  let revenueGrowthStr = "Revenue data is currently insufficient to calculate growth.";
  if (lastMonth.revenue > 0) {
    const growth = ((currentMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100;
    if (growth >= 0) {
       revenueGrowthStr = `Revenue increased ${growth.toFixed(1)}% compared to last month.`;
    } else {
       revenueGrowthStr = `Revenue decreased ${Math.abs(growth).toFixed(1)}% compared to last month.`;
    }
  } else if (currentMonth.revenue > 0) {
    revenueGrowthStr = `Revenue is up this month.`;
  }

  let expenseGrowthStr = "Expense data is currently insufficient to calculate growth.";
  if (lastMonth.expense > 0) {
    const growth = ((currentMonth.expense - lastMonth.expense) / lastMonth.expense) * 100;
    if (growth >= 0) {
       expenseGrowthStr = `Expenses increased ${growth.toFixed(1)}% compared to last month.`;
    } else {
       expenseGrowthStr = `Expenses decreased ${Math.abs(growth).toFixed(1)}% compared to last month.`;
    }
  } else if (currentMonth.expense > 0) {
    expenseGrowthStr = `Expenses are up this month.`;
  }

  const topCustomerStr = bestCust && bestCust.total_revenue > 0 
    ? `${bestCust.name} generated the most revenue this quarter (₹${bestCust.total_revenue}).`
    : "No major customer revenue generated this quarter.";

  const topLeadSourceStr = bestSource && bestSource.count > 0
    ? `${bestSource.name} generated the highest number of leads.`
    : "No distinct top lead source this period.";

  return {
    revenueGrowth: revenueGrowthStr,
    expenseGrowth: expenseGrowthStr,
    topCustomer: topCustomerStr,
    topLeadSource: topLeadSourceStr
  };
};

const getDashboardData = async (tenantId) => {
  const [kpis, trends, insights, customerGrowth, recentActivity, topCustomers, leadSources] = await Promise.all([
    getKPIs(tenantId),
    getFinancialTrends(tenantId),
    getBusinessInsights(tenantId),
    getCustomerGrowthTrend(tenantId),
    getRecentRevenue(tenantId),
    getTopCustomers(tenantId),
    getLeadSourceAnalytics(tenantId)
  ]);

  return {
    kpis,
    trends,
    customerGrowth,
    insights,
    recentActivity,
    topCustomers,
    leadSources
  };
};

module.exports = {
  getKPIs,
  getLeadSourceAnalytics,
  getTopCustomers,
  getFinancialTrends,
  getCustomerGrowthTrend,
  getRecentRevenue,
  getBusinessInsights,
  getDashboardData
};
