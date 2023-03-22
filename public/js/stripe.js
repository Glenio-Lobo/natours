import axios from 'axios';
import { showAlerts } from './alerts.js';
import { PUBLIC_STRIPE_KEY } from '../../keys.js';

// Se colocar o script v3 do stripe na base.pug, use window.Stripe.
// Variável global Stripe é criada pelo script do stripe definido no tour.pug
const stripe = Stripe(PUBLIC_STRIPE_KEY);
console.log('teste');

export const bookTour = async function(tourId) {
    // 1) Obtenha a sessão do checkout do server
    // 2) Cria um checkout form  e a cobrança do cartão
    try{
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)

        // redirectToCheckout tá defasado, redirecione manualmente usando o url da session.
        // location.assign(session.data.session.url);

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    }catch(err){
        console.log(err);
        showAlerts('error', err);
    }
}