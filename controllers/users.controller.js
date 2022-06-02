const { catchAsync } = require('../helpers/catchAsync');
const { Repair } = require('../models/repairs.model');
const { User } = require('../models/users.model');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../helpers/AppError');
const { Email } = require('../helpers/email.helper');

const login = catchAsync(async (req, res, next) => {
  // Retrieve data
  const { email, password } = req.body;

  // Validate that user exists
  const user = await User.findOne({
    where: { email, status: 'active' },
  });

  // Validate credentials
  const areValidCredentials =
    user && (await bcryptjs.compare(password, user.password));
  if (!areValidCredentials) {
    return next(new AppError('Invalid credentials', 400));
  }

  // Generate JWT
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Obfuscate password
  user.password = undefined;

  // Send success response
  res.status(200).json({ token, user });
});

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    include: [{ model: Repair }],
    attributes: { exclude: ['password'] },
  });
  if (!users) {
    return next(new AppError('No users found', 404));
  }
  res.status(200).json({ users });
});

const createUser = catchAsync(async (req, res, next) => {
  // Retrieve data
  const { name, email, password, role } = req.body;

  // Encrypt password
  const salt = await bcryptjs.genSalt(12);
  const hashPassword = await bcryptjs.hash(password, salt);

  // Store user
  const newUser = await User.create({
    name,
    email,
    password: hashPassword,
    role,
  });

  // Obfuscate password
  newUser.password = undefined;

  // Send welcome email
  await new Email(newUser.email).sendWelcome(newUser.name);

  // Send success response
  res.status(201).json({ newUser });
});

const getUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  return res.status(200).json({ user });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { ...columns } = req.body;
  const { user } = req;
  user.update({ ...columns });
  return res.status(200).json({ status: 'success' });
});

const removeUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  user.update({ status: 'deleted' });
  return res.status(200).json({ status: 'success' });
});

module.exports = {
  login,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  removeUser,
};
