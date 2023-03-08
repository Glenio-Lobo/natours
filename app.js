import hpp from 'hpp';
import path from 'path';
import morgan from "morgan";
import helmet from 'helmet';
import xss from 'xss-clean';
import express from 'express';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { AppError } from './utils/appError.js';
import { router as toursRouter } from './routes/tourRoutes.js';
import { router as usersRouter } from './routes/userRoutes.js';
import globalErrorHandler from './controller/errorController.js';
import { router as reviewRouter } from './routes/reviewRoutes.js';
import { router as viewRouter } from './routes/viewRoutes.js';

const app = express();
const __dirname = fileURLToPath(new URL('./', import.meta.url));

// console.log(__dirname, path.join(__dirname, 'views'));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

console.log(path.join(__dirname, 'public'));
// 1) Middleware Globais
app.use(express.json( { 
    limit: '10kb'
}));

// Adiciona todos os cookies atuais ao objeto de request.
app.use(cookieParser());


// Set Security HTTP Headers
// app.use(helmet({
    //     contentSecurityPolicy: {
        //         directives: {
            //             "script-src": ["'self'", 'https://cdnjs.cloudflare.com'], // Permite scripts vindos do domínio do cloudflare.com
            //             "default-src": ["'self'", 'http://127.0.0.1:8000/']
            //         }
//     }
// }));


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

app.use(cors());

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

app.use((request, response, next) => {
    console.log('Cookies ===> ', request.cookies);
    next();
})

//2) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);

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

