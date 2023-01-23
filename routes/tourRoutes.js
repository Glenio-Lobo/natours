import express from 'express';
import * as tourController from '../controller/tourController.js';

const router = express.Router();

// router.param('id', tourController.checkId);

router  
   .route('/')
   .get(tourController.getAllTours)
   .post(tourController.createNewTour);

router 
   .route('/top-5-tours')
   .get(tourController.aliasTopTours, tourController.getAllTours);

router
   .route('/tour-stats')
   .get(tourController.getToursStats);
   
router   
    .route('/:id')
   .get(tourController.getTour)
   .patch(tourController.updateTour)
   .delete(tourController.deleteTour);

export { router };