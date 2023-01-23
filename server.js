import { app }  from './app.js';
import mongoose from 'mongoose';

const PORT = 8000;
const URL = "mongodb+srv://admin:VrwzMsnU2S2Vn0dp@cluster0.bmulhpo.mongodb.net/natours?retryWrites=true&w=majority";

mongoose.connect(URL).then(connection => {
    console.log('DB connected...');
}).catch(err => {
    console.log(err, err.message);
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});