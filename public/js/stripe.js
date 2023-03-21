import Stripe from 'stripe';
import axios from 'axios';

// const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);
// console.log('teste', process.env.STRIPE_PUBLIC_KEY);

export const bookTour = async function(tourId) {
    // 1) Obtenha a sessão do checkout do server
    // const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
    // console.log(session);

    console.log('teste');
    
    // 2) Cria um checkout form  e a cobrança do cartão


}