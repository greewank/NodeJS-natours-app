const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// creating a user router for user resource
const router = express.Router();

router.post('/signup', authController.signup);
// this one doesn't follow the REST architecture exactly.
router.post('/login', authController.login);

// forgot and reset password
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

// This is for the users resource.

router.patch('/updateMe', authController.protect, userController.updateMe);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
