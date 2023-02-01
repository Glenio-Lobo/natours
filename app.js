import express from 'express';
import morgan from "morgan";
import {router as toursRouter} from './routes/tourRoutes.js';
import {router as usersRouter} from './routes/userRoutes.js';
import { AppError } from './utils/appError.js';
import globalErrorHandler from './controller/errorController.js';

const app = express();

// 1) Middleware Globais
app.use(express.json());

if(process.env.NODE_ENV === 'development'){    
    app.use(morgan('dev')); 
}

//2) Middleware Específicos
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

//3) Handler genérico para rotas não programadas.
app.all('*', function(request, response, next) {
    // A reposta sempre será tratada como um erro quando next recebe um argumento, sendo o argument o erro.
    next(new AppError(`Não foi possível encontrar ${request.originalUrl}`, 404));

    // const err = new Error(`Não foi possível encontrar ${request.originalUrl}`);
    // err.status = 'fail';
    // err.statusCode = 404;
    
    // response.status(404)
    // .json({
    //     status: 'fail',
    //     message: `Não foi possível encontrar ${request.originalUrl}`
    // });
})

// 4) Error Handling Middleware
app.use(globalErrorHandler)

export { app };

