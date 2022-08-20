const Tour = require('../models/tourModel');
const APIfeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// *********************////////////
// First of all, read the data.
// __dirname is the folder where the current script is located and in this case it's the main folder.
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// *********************////////////

// (req, res) is called the route handler.
// since there's a lot of handler functions to be exported, we use exports in this case. Replaced const with exports.

// This is written as a middleware for alias (common) requests
exports.aliasTopTours = (req, res, next) => {
  // They will prefill parts of the query object before reaching getAllTours.
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTING THE SAME QUERY
  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // Using mongoose methods for querying instead of these the above method will return it manually
  // const query =  Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  res.status(200).json({
    status: 'success',
    results: tours.length,
    // data is the envelope for our data. this data will have the object which in turn will contain the data which is the response we want to send.
    data: {
      // tours is the property here because it is the name of the resource (endpoint) from the URL. could've been tours:tours but in es6 if both key value same, then you can write it as tours only.
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  // req.params is where all the parameters of the variables that is defined in :id is stored. id here is the variable that is created to store the value.
  const tour = await Tour.findById(req.params.id);
  // Behind the scenes, findById() works as Tour.findOne({_id:req.params.id})

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// create a new tour using post http method.
exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({});
  // newTour.save()

  // Instead of the above we can combine it and directly call the method on Tour
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
});

// updating data using patch (application receives only the properties that should be updated on the object) method.
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }

  // 204 means null
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
// Aggregation pipeline : Defining a pipeline to process the aggregated result.
exports.getTourStats = catchAsync(async (req, res, next) => {
  // Inside the array as an argument we pass arrays which are called stages.
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        // {'mongoDBOperator: '<fieldname>'}
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // this is going to be 2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { months: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
