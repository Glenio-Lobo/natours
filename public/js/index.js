import { login, logout } from './login.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { showAlerts } from './alerts.js';
import 'core-js/actual';
import "regenerator-runtime/runtime.js";

// DOM Elements
const loginForm =  document.querySelector('.form--login')
const logoutButton = document.querySelector('.nav__el--logout');
const formUserData = document.querySelector('.form-user-data');
const formUserPass = document.querySelector('.form-user-settings');
const tourBookingButton = document.getElementById('book-tour');

// Delegation
if(loginForm){
    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    })
}

if(logoutButton){
    logoutButton.addEventListener('click', logout);
}

if(formUserData){
    formUserData.addEventListener('submit', function(e){
        e.preventDefault();
        
        const form = new FormData(formUserData);

        updateSettings( form , 'data');
    })
}

if(formUserPass){
    formUserPass.addEventListener('submit', async (e) => {
        e.preventDefault();

        document.querySelector('.btn--save-password ').textContent = 'Updating...';

        const passwordCurrent = document.querySelector('#password-current').value;
        const password = document.querySelector('#password').value;
        const passwordConfirmed = document.querySelector('#password-confirm').value;

        await updateSettings({ passwordCurrent, password, passwordConfirmed }, 'password');

        document.querySelector('.btn--save-password ').textContent = 'Save password';
        document.querySelector('#password-current').value = '';
        document.querySelector('#password').value = '';
        document.querySelector('#password-confirm').value = '';
    })
}

if(tourBookingButton){
    tourBookingButton.addEventListener('click', async (e) => {
        e.target.textContent = 'Processing...';
        const tourId = e.target.dataset.tourId;
        await bookTour(tourId);
        e.target.textContent = 'Book tour now!';
    })
}

const alertMessage = document.querySelector('body').dataset.alert;
if(alertMessage) showAlerts('success', alertMessage, 20);