const { AppError } = require('../helpers/AppError');
const { catchAsync } = require('../helpers/catchAsync');
const { Repair } = require('../models/repairs.model');
const { User } = require('../models/users.model');
const jwt = require('jsonwebtoken');

const userExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({
    where: { id },
    include: [{ model: Repair }],
    attributes: { exclude: ['password'] },
  });
  if (!user) {
    return next(new AppError('User does not exist with given Id', 404));
  }
  // Appending user data to req object
  req.user = user;
  next();
});

const protectToken = catchAsync(async (req, res, next) => {
  // Validate token
  let token;
  const isValidAuthHeader =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer');
  if (isValidAuthHeader) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Session invalid', 403));
  }

  // Search for user with decoded token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({
    where: { id: decoded.id, status: 'active' },
  });

  if (!user) {
    return next(
      new AppError('The owner of this token is no longer available', 403)
    );
  }

  req.sessionUser = user;
  next();
});

const ownerAuth = catchAsync(async (req, res, next) => {
  // Retrieve user from userExists and sessionUser from protectToken
  const { sessionUser, user } = req;

  if (sessionUser.id !== user.id) {
    return next(new AppError('You do not own this account', 403));
  }

  next();
});

const employeeAuth = catchAsync(async (req, res, next) => {
  if (req.sessionUser.role !== 'employee') {
    return next(new AppError('Access not granted', 403));
  }

  next();
});

module.exports = {
  userExists,
  protectToken,
  employeeAuth,
  ownerAuth,
};
