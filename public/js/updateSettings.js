import axios from 'axios';
import { showAlerts } from './alerts.js';

// type é password or data
export const updateSettings = async function(data, type){
    try{            
        const result = await axios({
            method: 'PATCH',
            url: `${type === 'data' ? '/api/v1/users/updateMe' : '/api/v1/users/updateMyPassword'}`,
            data
        });
    
        if(result.data.status === 'success'){
            showAlerts('success', `${type.toUpperCase()} updated successfully!.`);
        }
    }catch(err){
        showAlerts('error', err.response.data.message);
    }
};