import express from 'express';
import * as viewController from '../controller/viewController.js';
import * as authController from '../controller/authController.js';
import * as bookingController from '../controller/bookingController.js';

const router = express.Router();

// router.use(authController.isLoggedIn);

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protectAccess, viewController.getAccount);
router.get('/my-tours', authController.protectAccess, viewController.getMyTours);

export { router }