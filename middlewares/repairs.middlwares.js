const { Op } = require('sequelize');
const { AppError } = require('../helpers/AppError');
const { catchAsync } = require('../helpers/catchAsync');
const { Repair } = require('../models/repairs.model');
const { User } = require('../models/users.model');

const repairExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const repair = await Repair.findOne({
    where: { [Op.and]: [{ id }, { status: { [Op.eq]: 'pending' } }] },
    include: [{ model: User }],
  });
  if (!repair) {
    return next(new AppError('Repair does not exist with given ID', 404));
  }
  // Appending repair data to req object
  req.repair = repair;
  next();
});

module.exports = { repairExists };
