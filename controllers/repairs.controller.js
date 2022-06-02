const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { Email } = require('../helpers/email.helper');
const { Repair } = require('../models/repairs.model');
const { User } = require('../models/users.model');
const { catchAsync } = require('../helpers/catchAsync');
const { storage } = require('../helpers/firebase.helper');

const getAllRepairs = catchAsync(async (req, res, next) => {
  const repairs = await Repair.findAll({
    where: { status: 'pending' },
    include: [{ model: User }],
  });
  if (!repairs) {
    return next(new AppError('No repairs found', 404));
  }

  // Map async: you will use this techinque everytime that you need some async operations inside of an array
  const repairsPromises = repairs.map(async (repair) => {
    // Create firebase img ref and get the full path
    const imgRef = ref(storage, repair.profileImgUrl);
    const url = await getDownloadURL(imgRef);

    // Update the repair's profileImgUrl property
    repair.profileImgUrl = url;
    return repair;
  });

  // Resolve every promise that map gave us ([ Promise { <pending> }, Promise { <pending> } ])
  const repairsResolved = await Promise.all(repairsPromises);
  return res.status(200).json({ repairs: repairsResolved });
});

const createRepair = catchAsync(async (req, res, next) => {
  const { ...columns } = req.body;

  const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`);
  const imgUploaded = await uploadBytes(imgRef, req.file.buffer);
  const repair = await Repair.create({
    ...columns,
    imgPath: imgUploaded.metadata.fullPath,
  });
  return res.status(201).json({ repair });
});

const getRepair = catchAsync(async (req, res, next) => {
  const { repair } = req;
  // Get url from firebase
  const imgRef = ref(storage, repair.profileImgUrl);
  const url = await getDownloadURL(imgRef);
  repair.imgPath = url;
  return res.status(200).json({ repair });
});

const updateRepair = catchAsync(async (req, res, next) => {
  const { ...columns } = req.body;

  // Allow employee to change status back to pending in case of a mistake
  if (columns['status'] !== 'completed' && columns['status'] !== 'pending') {
    return next(
      new AppError('Only allow to update status to completed or pending', 400)
    );
  }
  const { repair, sessionUser } = req;
  await repair.update({ ...columns });
  const user = User.findOne({ where: { id: sessionUser.id } });
  await new Email(user.email).sendRepairCompleted();
  return res.status(200).json({ status: 'success' });
});

const removeRepair = catchAsync(async (req, res, next) => {
  const { repair, sessionUser } = req;
  repair.update({ status: 'cancelled' });
  const user = User.findOne({ where: { id: sessionUser.id } });
  await new Email(user.email).sendRepairCancelled();
  return res.status(200).json({ status: 'success' });
});

module.exports = {
  getAllRepairs,
  createRepair,
  getRepair,
  updateRepair,
  removeRepair,
};
