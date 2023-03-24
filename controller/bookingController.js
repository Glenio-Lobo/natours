import Stripe from 'stripe';
import { Tour } from './../models/tourModel.js';
import { Booking } from '../models/bookingModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import * as Factory from './handlerFactory.js';
import { User } from '../models/userModel.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = catchAsync( async function(request, response, next){
    // 1) Encontre o tour
    const tour = await Tour.findById(request.params.tourID)

    // 2) Crie a checkoutSession
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${request.protocol}://${request.get('host')}/my-tours`,
        // success_url: `${request.protocol}://${request.get('host')}/?tour=${request.params.tourID}&user=${request.user.id}&price=${tour.price}`,
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
                        images: [`${request.protocol}://${request.get('host')}/img/tours/${tour.imageCover}`]
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

// export const createBookingCheckout = catchAsync(async function(request, response, next){
//     const { tour, user, price } = request.query;

//     if(!tour && !user && !price) return next();

//     await Booking.create({
//         tour,
//         user,
//         price
//     });

//     response.redirect(request.originalUrl.split('?')[0]);
// });

async function createBookingCheckout(session){
    const tour = session.client_reference_id;
    const user = (await User.findOne({email: session.customer_email})).id;
    const price = session.line_items[0].price_data.unit_amount / 100;

    await Booking.create({
        tour,
        user,
        price
    });

    response.redirect(request.originalUrl.split('?')[0]);
}

export const webhookCheckout = function(request, response, next){
    const signature = request.headers['stripe-signature'];

    let event = {};

    try{
        event = stripe.webhooks.constructEvent(request.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }catch(err){
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if(event.type === 'checkout.session.completed')
        // Envia a sessão, de onde será extraido as informações necesárias para criar o checkout na database
        createBookingCheckout(event.data.object);
    
    response.status(200).json({received: true});
}

export const getAllBookings = Factory.getAllDocuments(Booking);
export const getBooking = Factory.getDocument(Booking);
export const deleteOneBooking = Factory.deleteOneDocument(Booking);
export const updateBooking = Factory.updateDocument(Booking);
export const createNewBooking = Factory.createNewDocument(Booking);