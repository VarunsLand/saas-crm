const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/stats', invoiceController.getStats);
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getOne);
router.get('/:id/pdf', invoiceController.generatePdf);
router.post('/:id/send', invoiceController.send);
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);
router.delete('/:id', invoiceController.remove);

module.exports = router;
