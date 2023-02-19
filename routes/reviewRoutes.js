import express from 'express';
import * as reviewController from '../controller/reviewController.js';
import * as authController from '../controller/authController.js';

// merge params conserva os parâmetros vindo de um router pai
const router = express.Router( { mergeParams: true });

router
    .route('/')
    // Get pode vir de /api/v1/reviews ou /api/v1/tours/tourId/reviews
    .get(reviewController.getAllReviews)
    .post(
        authController.protectAccess, 
        authController.restrictTo('user'), 
        reviewController.setTourUserIds, 
        reviewController.createReview
    );

router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateReview);

export { router };