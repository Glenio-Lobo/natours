import Stripe from 'stripe';
import { Tour } from './../models/tourModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
console.log(process.env.STRIPE_SECRET_KEY, process.env.NODE_ENV);

export const getCheckoutSession = catchAsync( async function(request, response, next){
    // 1) Encontre o tour
    const tour = await Tour.findById(request.params.tourID)

    // 2) Crie a checkoutSession
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${request.protocol}://${request.get('host')}/`,
        cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
        customer_email: request.user.email,
        client_reference_id: request.param.tourID,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                // images: tour.images
                amount: tour.price * 100, // É especificado em centavos.
                currency: 'usd',
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