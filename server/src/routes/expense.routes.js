const express = require('express');
const expenseController = require('../controllers/expense.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', expenseController.getAll);
router.post('/', expenseController.create);
router.patch('/:id', expenseController.update);
router.delete('/:id', expenseController.remove);

module.exports = router;
