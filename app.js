import path from 'path';
import express from 'express';
import hpp from 'hpp';
import morgan from "morgan";
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { AppError } from './utils/appError.js';
import globalErrorHandler from './controller/errorController.js';
import { router as toursRouter } from './routes/tourRoutes.js';
import { router as usersRouter } from './routes/userRoutes.js';
import { router as reviewRouter } from './routes/reviewRoutes.js';
import { router as bookingRouter } from './routes/bookingRoutes.js';
import { router as viewRouter } from './routes/viewRoutes.js';
import * as bookingController from './controller/bookingController.js';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __dirname = fileURLToPath(new URL('./', import.meta.url));

const app = express();

// Definindo a template engine e a localização das templates
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// console.log(path.join(__dirname, 'public'));

app.enable('trust proxy');

// 1) Middleware Globais

// Implmentando CORS Headers
app.use(cors());
app.options('*', cors());

// Definindo o local onde os arquivos estáticos(views, etc) serão encontrados.
app.use(express.static(path.join(__dirname, 'public')));

// Implementado os HTTP headers de segurança
app.use(
    helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'http:', 'data:'],
            scriptSrc: ["'self'", 'https:', 'http:', 'blob:']
            // styleSrc: ["'self'", 'https:', 'http:', 'unsafe-inline'],
          }
        },
        crossOriginEmbedderPolicy: false
    })
);
  

if(process.env.NODE_ENV === 'development'){    
    app.use(morgan('dev')); 
}

// Limitando a quantideade derequests que podem ser feitos por hora
const limiter = rateLimit({
    // Limitando 100 request por hora
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP. Please try again in one hour.'
});

app.use('/api', limiter);

// O body usado no webhook não pode ser no formato JSON, deve ser no formato stream.
// Por isso foi colocado antes do express.json()
app.post('/webhook-checkout', 
    express.raw({type: 'application/json'}), 
    bookingController.webhookCheckout
);


// Body Parser Middlewares

// Adiciona o JSON do request a request.body
app.use(express.json( { 
    limit: '10kb'
}));

// Middleware que constrói o corpo do request caso os dados sejam enviados através do form com action='/route' method='POST'
// extended: true permite enviar dados mais complexos
app.use(express.urlencoded({ extended: true , limit: '10kb'}));

// Adiciona todos os cookies atuais ao objeto de request.
app.use(cookieParser());


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

// Responsável pelas compressão do texto enviado ao cliente
app.use(compression());

//2) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//3) Handler genérico para rotas não programadas.
app.all('*', function(request, response, next) {
    // A reposta sempre será tratada como um erro quando next recebe um argumento, sendo o argument o erro.
    next(new AppError(`Não foi possível encontrar ${request.originalUrl}`, 404));
})

// 4) Error Handling Middleware
app.use(globalErrorHandler)

export default app ;

