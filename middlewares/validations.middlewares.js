const { body, validationResult } = require('express-validator');

const createUserValidations = [
  body('name').notEmpty().withMessage('Must provide a name'),
  body('email').notEmpty().isEmail().withMessage('Must provide a valid email'),
  body('password')
    .notEmpty()
    .isStrongPassword({ minSymbols: 0 })
    .withMessage(
      'Must provide a password with a minimum length of 8 characters, 1 uppercase character and 1 lowercase character'
    ),
  body('role')
    .default('client')
    .isIn(['client', 'employee'])
    .notEmpty()
    .withMessage('Must provide a valid role'),
];

const createRepairValidations = [
  body('date').notEmpty().withMessage('Date can not be empty'),
  body('computerNumber')
    .notEmpty()
    .withMessage('Number can not be empty')
    .isNumeric()
    .withMessage('Must be a valid number'),
  body('comments')
    .notEmpty()
    .withMessage('Comments can not be empty')
    .isLength({ max: 280 })
    .withMessage('Comments must be at most 280 characters long'),
  body('userId').isUUID(4).withMessage('Must be V4 UUID'),
];

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(({ msg }) => msg);
    const errorMsg = messages.join('.');
    return res.status(400).json({
      status: 'error',
      message: errorMsg,
    });
  }
  next();
};

module.exports = {
  createUserValidations,
  createRepairValidations,
  checkValidations,
};
