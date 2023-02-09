import express from 'express';
import morgan from "morgan";
import {router as toursRouter} from './routes/tourRoutes.js';
import {router as usersRouter} from './routes/userRoutes.js';
import { AppError } from './utils/appError.js';
import globalErrorHandler from './controller/errorController.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

const app = express();

// 1) Middleware Globais
app.use(express.json( { 
    limit: '10kb'
}));

// Set Security HTTP Headers
app.use(helmet());

if(process.env.NODE_ENV === 'development'){    
    app.use(morgan('dev')); 
}

const limiter = rateLimit({
    // Limitando 100 request por hora
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP. Please try again in one hour.'
});
 
app.use('/api', limiter);

// Data Sanitization para NoSql query injections
app.use(mongoSanitize());
  
// Data Sanitization para XSS
app.use(xss());

// Prevent Parameter Polution
app.use(hpp({
    whitelist: [ 
        'duration', 
        'ratingsQuantity', 
        'ratingsAverage', 
        'maxGroupSize', 
        'difficulty', 
        'price'
    ]
}));

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

