import express from 'express';
import * as bookingController from '../controller/bookingController.js';
import * as authController from '../controller/authController.js';

// merge params conserva os parâmetros vindo de um router pai
const router = express.Router( { mergeParams: true });

router.use(authController.protectAccess);

router.get('/checkout-session/:tourID', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createNewBooking);

router.route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteOneBooking);

export { router };