import express from 'express';
import * as reviewController from '../controller/reviewController.js';
import * as authController from '../controller/authController.js';

// merge params conserva os parâmetros vindo de um router pai
const router = express.Router( { mergeParams: true });

router.use(authController.protectAccess);

router
    .route('/')
    // Get pode vir de /api/v1/reviews ou /api/v1/tours/tourId/reviews
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'), 
        reviewController.setTourUserIds, 
        reviewController.createReview
    );

router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(
        authController.restrictTo('user', 'admin'), 
        reviewController.deleteReview
    ).patch(
        authController.restrictTo('user', 'admin'), 
        reviewController.updateReview
    );

export { router };