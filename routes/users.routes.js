const express = require('express');
const router = express.Router();

// Controller
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  removeUser,
  login,
} = require('../controllers/users.controller');

// Middleware
const {
  userExists,
  protectToken,
  ownerAuth,
} = require('../middlewares/users.middlewares');
const {
  createUserValidations,
  checkValidations,
} = require('../middlewares/validations.middlewares');

// Public routes
router.post('/', createUserValidations, checkValidations, createUser);
router.post('/login', login);
router.get('/:id', userExists, getUser);

// Protected routes
router.use(protectToken);
router.get('/', getAllUsers);

router
  .use('/:id', userExists, ownerAuth)
  .route('/:id')
  .patch(updateUser)
  .delete(removeUser);

module.exports = {
  usersRouter: router,
};
