import express from 'express';
import morgan from "morgan";
import {router as toursRouter} from './routes/tourRoutes.js';
import {router as usersRouter} from './routes/userRoutes.js';

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
    response.status(404)
    .json({
        status: 'fail',
        message: `Não foi possível encontrar ${request.originalUrl}`
    });
})

export { app };

