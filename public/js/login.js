// import axios from 'axios';

export const login = async function(email, password){
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password
            },  
            withCredentials: true
        });
        
        if(res.data.status === 'success'){
            alert('Logged In');
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500)
        }
        
        console.log("EHRE ==========> ", res, axios.defaults.withCredentials);
    }catch(err){
        console.log(err.response.data);
        alert(err.response.data.message);
    }
}