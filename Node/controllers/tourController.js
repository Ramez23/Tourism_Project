const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const factory = require('./handlerFactory');
// Function to sign a JWT token based on the tour's ID
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Helper function to create and send the token in the response
const createSendToken = (tour, statusCode, res) => {
  const token = signToken(tour._id);
  tour.password = undefined; // Ensure password is not sent back in the response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      tour
    }
  });
};

// Asynchronous function to handle tour sign-up
exports.signupTour = catchAsync(async (req, res) => {
  const {
    name,
    email,
    password,
    summary,
    location,
    price,
    maxGroupSize
  } = req.body;

  const newTour = await Tour.create({
    name,
    email,
    password,
    summary,
    location,
    price,
    maxGroupSize,
    approved: false
  });

  createSendToken(newTour, 201, res);
});

// Asynchronous function to handle tour login
exports.loginTour = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password!', 400));
  }

  const tour = await Tour.findOne({ email }).select('+password');

  if (!tour) {
    return next(new AppError('Incorrect email or password', 401));
  } else if (!tour.approved) {
    return next(new AppError('Please wait for admin reviewing your data', 403));
  }

  const passwordMatch = await bcrypt.compare(password, tour.password);
  if (!passwordMatch) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(tour, 200, res);
});

// Function to handle tour logout
exports.logoutTour = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res
    .status(200)
    .json({ status: 'success', message: 'Logged out successfully!' });
};

// Asynchronous function to get pending tours
exports.getPendingTours = catchAsync(async (req, res) => {
  const pendingTours = await Tour.find({ approved: false });
  res.status(200).json({
    status: 'success',
    results: pendingTours.length,
    data: { pendingTours }
  });
});

// Asynchronous function to approve a tour
exports.approveTour = catchAsync(async (req, res) => {
  const guideId = req.params.id;
  const updatedTour = await Tour.findByIdAndUpdate(
    guideId,
    { approved: true },
    { new: true, runValidators: true }
  );

  if (!updatedTour) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'No tour found with that ID' });
  }

  res.status(200).json({ status: 'success', data: { updatedTour } });
});

// Add additional methods as needed...

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});