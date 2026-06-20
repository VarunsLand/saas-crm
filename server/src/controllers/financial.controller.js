const catchAsync = require('../utils/catchAsync');
const financialService = require('../services/financial.service');

const getDashboardKPIs = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const kpis = await financialService.getKPIs(tenantId);

  res.status(200).json({
    status: 'success',
    data: kpis
  });
});

const getInsights = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const leadSources = await financialService.getLeadSourceAnalytics(tenantId);
  const topCustomers = await financialService.getTopCustomers(tenantId);
  const recentRevenue = await financialService.getRecentRevenue(tenantId);
  const businessInsights = await financialService.getBusinessInsights(tenantId);

  res.status(200).json({
    status: 'success',
    data: {
      leadSources,
      topCustomers,
      recentRevenue,
      businessInsights
    }
  });
});

const getCharts = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const revenueExpenseTrend = await financialService.getFinancialTrends(tenantId);
  const customerGrowthTrend = await financialService.getCustomerGrowthTrend(tenantId);

  res.status(200).json({
    status: 'success',
    data: {
      revenueExpenseTrend,
      customerGrowthTrend
    }
  });
});

module.exports = {
  getDashboardKPIs,
  getInsights,
  getCharts
};
