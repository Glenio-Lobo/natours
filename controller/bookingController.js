import Stripe from 'stripe';
import { Tour } from './../models/tourModel.js';
import { Booking } from '../models/bookingModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import * as Factory from './handlerFactory.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = catchAsync( async function(request, response, next){
    // 1) Encontre o tour
    const tour = await Tour.findById(request.params.tourID)

    // 2) Crie a checkoutSession
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${request.protocol}://${request.get('host')}/?tour=${request.params.tourID}&user=${request.user.id}&price=${tour.price}`,
        cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
        customer_email: request.user.email,
        client_reference_id: request.param.tourID,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        // images: tour.images
                    }
                },
                quantity: 1
            }
        ],
        mode: 'payment'
    });

    // 3) Crie a response de session 
    response.status(200).json({
        status: 'success',
        session
    })
})

export const createBookingCheckout = catchAsync(async function(request, response, next){
    const { tour, user, price } = request.query;

    if(!tour && !user && !price) return next();

    await Booking.create({
        tour,
        user,
        price
    });

    response.redirect(request.originalUrl.split('?')[0]);
});

export const getAllBookings = Factory.getAllDocuments(Booking);
export const getBooking = Factory.getDocument(Booking);
export const deleteOneBooking = Factory.deleteOneDocument(Booking);
export const updateBooking = Factory.updateDocument(Booking);
export const createNewBooking = Factory.createNewDocument(Booking);