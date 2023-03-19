import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({path: './config.env'});
import { app }  from './app.js';

process.on('uncaughtException', err => {
    console.log('!!!!!!!!!!!!!!! UNCAUGHT EXCEPTION !!!!!!!!!!!!!!!\n');
    console.log(err);
    process.exit(1);
})

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

process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('Process terminated!');
    });
  });

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION!');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

// Erros após a conexão inicial!
mongoose.connection.on('error', error => {
    server.close(() => {
        process.exit(1);
    })
});