import express from 'express';
import * as tourController from '../controller/tourController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

// router.param('id', tourController.checkId);

router  
   .route('/')
   .get(authController.protectAccess, tourController.getAllTours)
   .post(tourController.createNewTour);

router 
   .route('/top-5-tours')
   .get(tourController.aliasTopTours, tourController.getAllTours);

router
   .route('/tour-stats')
   .get(tourController.getToursStats);

router 
   .route('/monthly-plan/:year')
   .get(tourController.getMonthlyPlan);

router   
    .route('/:id')
   .get(tourController.getTour)
   .patch(tourController.updateTour)
   .delete(
      authController.protectAccess, 
      authController.restrictTo('admin', 'lead-guide'), 
      tourController.deleteTour
   );

export { router };