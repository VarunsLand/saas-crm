const SearchService = require('../services/search.service');
const catchAsync = require('../utils/catchAsync');

const globalSearch = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { q } = req.query;

  const results = await SearchService.globalSearch(tenantId, q);

  res.status(200).json({
    status: 'success',
    data: results
  });
});

module.exports = {
  globalSearch
};
