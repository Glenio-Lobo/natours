import express from 'express';
import * as reviewController from '../controller/reviewController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getReview);
    
export { router };