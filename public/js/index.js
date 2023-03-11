import { login, logout } from './login.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// DOM Elements
const loginForm =  document.querySelector('.form')
const logoutButton = document.querySelector('.nav__el--logout');

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