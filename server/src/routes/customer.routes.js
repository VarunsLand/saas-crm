const express = require('express');
const customerController = require('../controllers/customer.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const customerValidation = require('../validations/customer.validation');

const router = express.Router();

router.use(requireAuth);

router
  .route('/')
  .get(customerController.getAllCustomers)
  .post(
    validate(customerValidation.createCustomer),
    customerController.createCustomer
  );

router
  .route('/:id')
  .get(validate(customerValidation.getCustomer), customerController.getCustomer)
  .patch(
    validate(customerValidation.updateCustomer),
    customerController.updateCustomer
  )
  .delete(
    requireAdmin,
    validate(customerValidation.deleteCustomer),
    customerController.deleteCustomer
  );

module.exports = router;
