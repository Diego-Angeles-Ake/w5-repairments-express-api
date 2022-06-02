const express = require('express');
const router = express.Router();

// Controller
const {
  getAllRepairs,
  createRepair,
  getRepair,
  updateRepair,
  removeRepair,
} = require('../controllers/repairs.controller');
const { upload } = require('../helpers/multer.helper');
// Middleware
const { repairExists } = require('../middlewares/repairs.middlwares');
const {
  protectToken,
  employeeAuth,
} = require('../middlewares/users.middlewares');
const {
  checkValidations,
  createRepairValidations,
} = require('../middlewares/validations.middlewares');

// Protected routes
router.use(protectToken);
// Employee specific
router.use(employeeAuth);
router
  .route('/')
  .get(getAllRepairs)
  .post(
    upload.single('repairImg'),
    createRepairValidations,
    checkValidations,
    createRepair
  );
router
  .use('/:id', repairExists)
  .route('/:id')
  .get(getRepair)
  .patch(updateRepair)
  .delete(removeRepair);

module.exports = {
  repairsRouter: router,
};
