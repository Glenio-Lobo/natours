import { app }  from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.on('uncaughtException', err => {
    console.log('!!!!!!!!!!!!!!! UNCAUGHT EXCEPTION !!!!!!!!!!!!!!!\n');
    console.log(err);
    process.exit(1);
})

process.on('uncaughtRejection', err => {
    console.log('!!!!!!!!!!!!!!! UNCAUGHT Rejection !!!!!!!!!!!!!!!\n');
    process.exit(1);
})

dotenv.config({path: './config.env'});

const PORT = process.env.PORT || 8000;
const URL = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(URL).then(connection => {
    console.log('DB connected...');
}).catch(err => {
    console.log(err.message);
});

const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});

// Erros após a conexão inicial!
mongoose.connection.on('error', error => {
    server.close(() => {
        process.exit(1);
    })
});
