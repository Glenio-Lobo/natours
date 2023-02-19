import express from 'express';
import * as tourController from '../controller/tourController.js';
import * as authController from '../controller/authController.js';
import { router as reviewRouter } from './reviewRoutes.js';
// import * as reviewController from '../controller/reviewController.js';

const router = express.Router();

// router.param('id', tourController.checkId);
// Chega aqui através do /api/v1/tours, ao ter como url /:tourId/reviews vai para reviewRouter que irá acessar a route '/'
// api/v1/tours no app.js ---> api/v1/tours/:tourId/reviews no tourRoutes ----> api/v1/tours/:tourId/reviews/ no reviewRoutes
router.use('/:tourId/reviews', reviewRouter);

router  
   .route('/')
   .get(tourController.getAllTours)
   .post(authController.protectAccess, 
         authController.restrictTo('admin', 'lead-guide'),
         tourController.createNewTour
         );

router 
   .route('/top-5-tours')
   .get(tourController.aliasTopTours, tourController.getAllTours);

router
   .route('/tour-stats')
   .get(tourController.getToursStats);

router 
   .route('/monthly-plan/:year')
   .get(
      authController.protectAccess,
      authController.restrictTo('admin', 'lead-guide', 'guide'),
      tourController.getMonthlyPlan
      );

router   
    .route('/:id')
   .get(tourController.getTour)
   .patch(
      authController.protectAccess,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.updateTour)
   .delete(
      authController.protectAccess, 
      authController.restrictTo('admin', 'lead-guide'), 
      tourController.deleteTour
   );

// router
//       .route('/:tourId/reviews')
//       .post(
//          authController.protectAccess, 
//          authController.restrictTo('user'),
//          reviewController.createReview
//       )

export { router };