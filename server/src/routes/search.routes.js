const express = require('express');
const searchController = require('../controllers/search.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', searchController.globalSearch);

module.exports = router;
