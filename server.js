import { app }  from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({path: './config.env'});

const PORT = process.env.PORT || 8000;
const URL = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(URL).then(connection => {
    console.log('DB connected...');
}).catch(err => {
    console.log(err, err.message);
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});