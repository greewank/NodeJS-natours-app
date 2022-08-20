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
