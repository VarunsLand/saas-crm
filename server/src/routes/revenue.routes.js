const express = require('express');
const revenueController = require('../controllers/revenue.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', revenueController.getAll);
router.post('/', revenueController.create);
router.patch('/:id', revenueController.update);
router.delete('/:id', revenueController.remove);

module.exports = router;
