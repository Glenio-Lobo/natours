import express from 'express';
import morgan from "morgan";
import {router as toursRouter} from './routes/tourRoutes.js';
import {router as usersRouter} from './routes/userRoutes.js';

const app = express();

// 1) Middleware Globais
app.use(express.json()); 
app.use(morgan('dev')); 

//2) Middleware Específicos
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

export { app };

