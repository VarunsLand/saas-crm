const express = require('express');
const financialController = require('../controllers/financial.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/kpi', financialController.getDashboardKPIs);
router.get('/insights', financialController.getInsights);
router.get('/charts', financialController.getCharts);
router.get('/dashboard', financialController.getDashboard);

module.exports = router;
