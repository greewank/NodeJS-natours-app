// const e = require('express');
const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router(); // Here a new router is created and saved into tourRouter.

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// route for aggregation pipeline
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// Instead of the above ones we can chain the http methods.(This is for the ones that don't need id.)
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

// These for the ones that need an id.
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
