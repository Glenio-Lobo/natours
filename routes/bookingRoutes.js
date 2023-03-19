import express from 'express';
import * as bookingController from '../controller/bookingController.js';
import * as authController from '../controller/authController.js';

// merge params conserva os parâmetros vindo de um router pai
const router = express.Router( { mergeParams: true });

router.get('/checkout-session/:tourID', 
    authController.protectAccess, 
    bookingController.getCheckoutSession);

export { router };