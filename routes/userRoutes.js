const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// creating a user router for user resource
const router = express.Router();

router.post('/signup', authController.signup);
// this one doesn't follow the REST architecture exactly.
router.post('/login', authController.login);

// This is for the users resource.
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
