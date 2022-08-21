const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // .create() method  is going to create a new document.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  //   The first argument in the sign method is the payload(object for all the data inside the token), second is for jwt secret key and third is called option which is optional and in this case specified when the session will be expired.
  const token = signToken(newUser._id);
  res.status(201).json({
    stauts: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //   1. Check if email and password exist.
  if (!email || !password) {
    return next(new AppError('Please provide email and password!'), 400);
  }
  //   2. Check if users exist and password is correct. Here, the select method is included explicitly as the select for password has been set to false by default.
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //   3. If everything is ok, add token to client.
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //   console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access'),
      401
    );
  }
  //   2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //   3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists!', 401)
    );
  }

  //   4. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Recently changed password! Please login again'),
      401
    );
  }
  //   Grants access to the protected route
  req.user = currentUser;
  next();
});

// restricting who can delete tours (only responsible people like admin or lead-tour)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You dont have access to the page!', 403));
    }
    next();
  };
};
