import axios from 'axios';
import { showAlerts } from './alerts.js';

axios.defaults.withCredentials = true;

export const login = async function(email, password){
    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            },  
            withCredentials: true
        });
        
        if(res.data.status === 'success'){
            showAlerts('success', 'Logged In');
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500)
        }
        
    }catch(err){
        console.log(err.response.data);
        showAlerts('error', 'Wrong username or password.');
    }
}

export const logout = async function(){
    try{
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        })

        console.log(res);
        // reload page
        // .reload(true) força o reload a partir do server e não do cache do browser
        if(res.data.status === 'success') location.reload(true); 

    }catch(err){
        console.log(err);
        showAlerts('error', 'No Internet. Logged Out.');
    }
}